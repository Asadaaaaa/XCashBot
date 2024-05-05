class StartCommandService {
  constructor(server) {
    this.server = server;

    this.command();
  }

  command() {
    this.server.Telegraf.command('start', async (ctx) => {
      const userData = this.server.ServerData.getUserById(ctx.message.from.id);
      if(userData === undefined) {
        ctx.reply(`Hello ${ctx.message.from.username}, Welcome !.\nPlease Add Your Phone Number by using this format:\n\n /addPhone <phone_number>\n\nExample: /addPhone 081234567890`);
        this.server.ServerData.addUser(ctx.message.from.id);
      } else if(userData.phoneNumber === null && userData.isNotif === false && userData.mlbbAccounts.length === 0) {
        ctx.reply(`Please Add Your Phone Number by using this format:\n\n /addPhone <phone_number>\n\nExample: /addPhone 081234567890`);
      }
    });
  }
}

export default StartCommandService;