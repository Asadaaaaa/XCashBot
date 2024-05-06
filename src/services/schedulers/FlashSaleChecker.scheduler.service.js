// Helpers
import sendLogs from '../../helpers/Logger.helper.js';
import SleepHelper from '../../helpers/Sleep.helper.js';

class FlashSaleCheckerSchedulerService {
  constructor(server) {
    this.server = server;

    this.run();
  }

  async run() {
    while(true) {
      let isFound = false;
      let paymentQrisId = null;

      try {
        paymentQrisId = await fetch('https://xc-api.xcashshop.com/payment?except=wallet').then(res => res.json()).then(data => data[0].datas[0].id);
      } catch(err) {
        this.server.sendLogs('Failed to get Payment QRIS ID, Retry in 3 seconds...');
        await SleepHelper(3000);
        continue;
      }
      
      try{
        await fetch('https://xc-api.xcashshop.com/product/weekly-diamond-pass').then(res => res.json()).then(data => {
          if(data.statusCode === 200) {
            const items = data.data.items;

            for(let item of items) {
              if(item.price <= this.server.env.PRICE_WDP_TRIGGER) {
                isFound = true;
                
                this.server.sendLogs(`Flash Sale Found | ${item.name}, Price ${item.price}`);
                const usersData = this.server.ServerData.getUserCanCheckout();
                
                for(let user of usersData) {
                  for(let mlbbAccount of user.mlbbAccounts) {
                    fetch(`https://xc-api.xcashshop.com/order/prepare/Mobile%20Legend%20M?zoneId=${mlbbAccount.mlbbServer}&userId=${mlbbAccount.mlbbId}`).then(res => res.json()).then(prepareData => {
                      if(prepareData.statusCode !== 200) {
                        this.server.sendLogs(`Prepare Order Failed | UserID: ${user.id}, Phone Number: ${user.phoneNumber} | MLBB Account: ${mlbbAccount.mlbbId} (${mlbbAccount.mlbbServer})`);
                        return;
                      };
                      
                      fetch("https://xc-api.xcashshop.com/order", {
                        "method": "POST",
                        "headers": {
                          "accept": "*/*",
                          "content-type": "application/json",
                          "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                          "sec-ch-ua-mobile": "?0",
                          "sec-ch-ua-platform": "\"Windows\"",
                          "sec-fetch-dest": "empty",
                          "sec-fetch-mode": "cors",
                          "sec-fetch-site": "same-site",
                          "Referer": "https://xcashshop.com/",
                          "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "body": JSON.stringify({
                          "username": prepareData.data,
                          "productId": data.data.id,
                          "productItemId": item.id,
                          "data": {
                            "userId": mlbbAccount.mlbbId,
                            "zoneId": mlbbAccount.mlbbServer
                          },
                          "paymentChannelId": paymentQrisId,
                          "phoneNumber": user.phoneNumber,
                          "voucher": ""
                        })
                      }).then(res => res.json()).then(orderData => {
                        if(orderData.statusCode === 200) {
                          this.server.sendLogs(`Order Success | UserID: ${user.id}, Phone Number: ${user.phoneNumber} | MLBB Account: ${prepareData.data} - ${mlbbAccount.mlbbId} (${mlbbAccount.mlbbServer})`);
                          this.server.Telegraf.telegram.sendMessage(user.id, `Order Success | ${item.name}\nPrice: ${item.price}\n\nYou can pay the order by using this link: https://xcashshop.com/history/${user.phoneNumber}/${orderData.data}`);
                        } else {
                          this.server.sendLogs(`Order Failed | UserID: ${user.id}, Phone Number: ${user.phoneNumber} | MLBB Account: ${prepareData.data} - ${mlbbAccount.mlbbId} (${mlbbAccount.mlbbServer})`);
                        };
                      });
                    });
                  };
                }
              }
            }
          } else {
            this.server.sendLogs('Failed to get Flash Sale Data');
            console.log(data);
          }
        });
      } catch(err) {
        this.server.sendLogs('Failed to get Flash Sale Data, Retry in 3 seconds...');
        await SleepHelper(3000);
        continue;
      }

      if(!isFound) {
        await SleepHelper(5000);
      } else {
        await SleepHelper(300000);
      }
    }
  }
}

export default FlashSaleCheckerSchedulerService;