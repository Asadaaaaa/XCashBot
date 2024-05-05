class MLBBAccountsCommandService {
  constructor(server) {
    this.server = server;

    this.command();
  }

  command() {
    this.server.Telegraf.command('addMLBB', async (ctx) => {
      const userData = this.server.ServerData.getUserById(ctx.message.from.id);
      if(userData === undefined) return;

      const mlbbData = ctx.message.text.split(' ')[1];
      const mlbbServer = (ctx.message.text.split(' ')[2]).replace('(', '').replace(')', '');

      // Validate MLBB ID by Regex
      const mlbbIdRegex = new RegExp('^[0-9]{8,10}$');
      const mlbbServerRegex = new RegExp('^[0-9]{4}$');

      if(!mlbbIdRegex.test(mlbbData) || !mlbbServerRegex.test(mlbbServer)) {
        return ctx.reply('Invalid Mobile Legends Account, Please use this format: /addMLBB <mlbb_id> (<mlbb_server>)\n\nExample: /addMLBB 12345678 (1234)');
      }

      if(this.server.ServerData.isMLLBBAccountExist(ctx.message.from.id, mlbbData, mlbbServer)) {
        return ctx.reply('Mobile Legends Account already exist, Please use another Mobile Legends Account.');
      }

      fetch(`https://xc-api.xcashshop.com/order/prepare/Mobile%20Legend%20M?zoneId=${mlbbServer}&userId=${mlbbData}`).then(res => res.json()).then(data => {
        if(data.statusCode === 200) {
          ctx.reply(`Add Account Success, Mobile Legends Account:\n\n - Username: ${data.data}\n - ID: ${mlbbData} (${mlbbServer})\n\nCheck Your List Account by using this format: /listMLBB`);
          this.server.ServerData.addMLBBAccount(ctx.message.from.id, mlbbData, mlbbServer);
        } else if(data.statusCode === 400 && data.message === 'Mobile Legend account not valid') {
          ctx.reply('Mobile Legends Account not found, Please check your Mobile Legends Account and Server.');
        } else {
          ctx.reply('Something went wrong, Please try again later.');
        }
      });
    });

    this.server.Telegraf.command('listMLBB', async (ctx) => {
      const userData = this.server.ServerData.getUserById(ctx.message.from.id);
      if(userData === undefined) return;

      if(userData.mlbbAccounts.length === 0) {
        return ctx.reply('You don\'t have any Mobile Legends Account, Please add your Mobile Legends Account by using this format: /addMLBB <mlbb_id> (<mlbb_server>)\n\nExample: /addMLBB 12345678 (1234)');
      }

      let message = 'Your Mobile Legends Account:\n\n';
      userData.mlbbAccounts.forEach((account, index) => {
        message += `Account ${index + 1}:\n - ID: ${account.mlbbId}\n - Server ${account.mlbbServer}\n\n`;
      });

      message += 'You can delete your MLBB Account by using this format:\n/deleteMLBB <id_mlbb>\nYou can add MLBB Account by using this format:\n/addMLBB <mlbb_id> (<mlbb_server>)'

      ctx.reply(message);
    });

    this.server.Telegraf.command('deleteMLBB', async (ctx) => {
      const userData = this.server.ServerData.getUserById(ctx.message.from.id);
      if(userData === undefined) return;

      const mlbbId = ctx.message.text.split(' ')[1];

      if(userData.mlbbAccounts.length === 0) {
        return ctx.reply('You don\'t have any MLBB Account, Please add your MLBB Account by using this format: /addMLBB <mlbb_id> (<mlbb_server>)\n\nExample: /addMLBB 12345678 (1234)');
      }

      if(mlbbId === undefined) {
        return ctx.reply('Please use this format: /deleteMLBB <id_mlbb>\n\nExample: /deleteMLBB 12345678');
      }
      
      if(this.server.ServerData.isMLLBBAccountExist(ctx.message.from.id, mlbbId) === false) return ctx.reply('MLBB Account not found, Please check your MLBB Account by using this format: /listMLBB');

      this.server.ServerData.deleteMLBBAccount(ctx.message.from.id, mlbbId);
      ctx.reply('Delete Account Success, Check Your List Account by using this format: /listMLBB');
    });
  }
}

export default MLBBAccountsCommandService;