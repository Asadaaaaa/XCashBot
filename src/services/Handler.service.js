// Commands
import StartCommandService from './commands/Start.command.service.js';
import AddPhoneCommandService from './commands/addPhone.command.service.js';
import AdminCommandService from './commands/Admin.command.service.js';
import MLBBAccountsCommandService from './commands/MLBBAccouunts.command.service.js';

// Schedulers
import FlashSaleCheckerSchedulerService from './schedulers/FlashSaleChecker.scheduler.service.js';

class Handler {
  constructor(server) {
    // Commands
    new StartCommandService(server);    
    new AddPhoneCommandService(server);
    new AdminCommandService(server);
    new MLBBAccountsCommandService(server);

    // Schedulers
    new FlashSaleCheckerSchedulerService(server);
  }
}

export default Handler;