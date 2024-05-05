class AdminCommandService {
  constructor(server) {
    this.server = server;

    this.command();
  }

  command() {
    this.server.Telegraf.command('admin', async (ctx) => {
      const userData = this.server.ServerData.getUserById(ctx.message.from.id);
      if(userData === undefined) return;

      if(userData.phoneNumber === null && userData.isNotif === false && userData.mlbbAccounts.length === 0) {
        return ctx.reply('Please Add Your Phone Number by using this format:\n\n /addPhone <phone_number>\n\nExample: /addPhone 081234567890');
      }

      const password = ctx.message.text.split(' ')[1];
      if(password === this.server.env.ADMIN_PASSWORD) {
        this.server.ServerData.setUserAdmin(ctx.message.from.id);
        this.server.ServerData.setUserIsActive(ctx.message.from.id, true);
        ctx.reply('You are now an admin!');
      } else {
        ctx.reply('Invalid Password');
      }
    });

    this.server.Telegraf.command('listUsers', async (ctx) => {
      if(!this.server.ServerData.isUserAdmin(ctx.message.from.id)) return ctx.reply('You are not an admin!');

      const userData = this.server.ServerData.getUsers();
      if(userData.length === 0) {
        return ctx.reply('This Bot doesn\'t have any user yet.');
      }

      let message = 'List User:\n\n';
      
      for(let user of userData) {
        const chatData = await this.server.Telegraf.telegram.getChat(user.id);
        message += `User ${user.id}:\n - Username: ${chatData.username}\n - Phone Number: ${user.phoneNumber}\n - Active: ${user.isActive}\n - Notification: ${user.isNotif}\n - Admin: ${user.isAdmin}\n\n`;
      }

      ctx.reply(message);
    });

    this.server.Telegraf.command('setActive', async (ctx) => {
      if(!this.server.ServerData.isUserAdmin(ctx.message.from.id)) return ctx.reply('You are not an admin!');

      const userId = ctx.message.text.split(' ')[1];
      const isActive = ctx.message.text.split(' ')[2];
      if(userId === undefined) return ctx.reply('Please use this format: /setActive <user_id> <true_false>\n\nExample: /setActive 12345678 true');

      this.server.ServerData.setUserIsActive(Number(userId), isActive === 'true' ? true : false);
      ctx.reply(`Set Active Success, User ID: ${userId} Active: ${isActive}`);
    });
  }
}

export default AdminCommandService