class StartCommandService {
  constructor(server) {
    this.server = server;

    this.command();
  }

  command() {
    this.server.Telegraf.command('addPhone', async (ctx) => {
      const userData = this.server.ServerData.getUserById(ctx.message.from.id);
      if(userData === undefined) return;

      const phoneNumber = ctx.message.text.split(' ')[1];

      // Validate Phone Number by Regex
      const phoneRegex = new RegExp('^[0-9]{10,14}$');

      if(!phoneRegex.test(phoneNumber)) {
        return ctx.reply('Invalid Phone Number, Please use this format: /addPhone <phone_number>\n\nExample: /addPhone 081234567890');
      }

      if(userData.phoneNumber === null && userData.isNotif === false && userData.mlbbAccounts.length === 0) {
        this.server.ServerData.addPhoneNumber(ctx.message.from.id, phoneNumber);
        ctx.reply(`Success, Phone Number: ${phoneNumber}\n\nYou can change your phone number anytime by using this format: /addPhone <phone_number>\n\nPlease add your Mobile Legends Account by using this format: /addMLBB <mlbb_id> (<mlbb_server>)\n\nExample: /addMLBB 12345678 (1234)\n\nYou can add multiple MLBB Account by using the same format.`);
      } else {
        this.server.ServerData.addPhoneNumber(ctx.message.from.id, phoneNumber);
        ctx.reply(`Phone Number Changed from ${userData.phoneNumber} to ${phoneNumber}.`);
      }
    });
  }
}

export default StartCommandService;