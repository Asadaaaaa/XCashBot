// Helpers
import sendLogs from './helpers/Logger.helper.js';
import ServerData from './helpers/ServerData.helper.js';

// Library
import * as dotenv from 'dotenv';
import FS from 'fs-extra';
import { Telegraf } from 'telegraf';

// Handler
import HandlerService from './services/Handler.service.js';

class Server {
  constructor() {
    // Server Logger
    this.sendLogs = sendLogs;
    
    // File System
    this.FS = FS;

    // .env config
    dotenv.config();
    this.env = process.env;

    this.sendLogs('Bot is Starting...');
    this.init();
  }

  async init() {
    // Initiate Server Data
    const serverDataPath = '/server_data';
    const resourceFolder = '/src/resources';

    if (!FS.existsSync(process.cwd() + serverDataPath)) {
      this.sendLogs('Initiate Server Data...');
      this.FS.mkdirSync(process.cwd() + serverDataPath);
      this.FS.copySync(process.cwd() + resourceFolder, process.cwd() + serverDataPath);
    }

    this.ServerData = new ServerData(this);
    this.ServerData.loadData();

    this.run();
  }

  run() {
    this.Telegraf = new Telegraf(this.env.TELEGRAM_BOT_TOKEN);

    new HandlerService(this);

    this.Telegraf.launch(() => {
      this.sendLogs('Bot is Started!');
    }).catch((err) => {
      this.sendLogs('Error: ');
      console.log(err)
    });
  }
}

new Server();
