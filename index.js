require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('./db/main.json')
const db = low(adapter)

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});

const getChampListAsString = (champs) => {
  try {
    let champsObj = {};
    let listMessage = "";

    for (let i = 0; i < champs.length; i++) {
      let champ = champs[i];
      if(champsObj[champ]) {
        champsObj[champ] = champsObj[champ] + 1
      } else {
        champsObj[champ] = 1
      }
    }

    for (let i = 0; i < Object.keys(champsObj).length; i++) {
      const key = Object.keys(champsObj)[i]

      listMessage = listMessage + `🏆 ${key}: ${champsObj[key]} ret \n`
    }
    return listMessage;
  } catch(err) {
    return "";
  }
}


bot.onText(/\/pollToday/, async (msg) => {
  console.log("calling pollToday")
  try {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const duration = Number(msg.text.split(" ")[1]) || 60;
    
    const question = "🏓 Bugin kelesiń ba? 🏓";
    const answers = ["🤩 Go", "🤥 No"];
    const open_period = duration;
    const opts = {
      'is_anonymous': false,
      open_period
    };
    
    await bot.sendPoll(chatId, question, answers, opts);
    await bot.pinChatMessage(chatId, messageId + 1);
  } catch (err) {
    console.log("err", err);
    bot.sendMessage(msg.chat.id, "Bauyrym, sen qatelestiń!!!");
  }
  
});

bot.onText(/\/allChamps/, async (msg) => {
  console.log("calling list")
  try {
    const chatId = msg.chat.id;
    const champs = db.get('champs').value();
    console.log("champs", champs)
    const champList = getChampListAsString(champs);

    bot.sendMessage(chatId, champList)
  } catch(err) {
    console.log("err", err);
    bot.sendMessage(msg.chat.id, "Bauyrym, sen qatelestiń!!!");
  }
})

bot.onText(/\/champing/, async (msg) => {
  console.log("calling champ", msg)
  try {
    const chatId = msg.chat.id;
    const suggestedChamp = msg.text.split(" ")[1];

    // if(!db.has(suggestedChamp) || !suggestedChamp) {
    //   return bot.sendMessage(msg.chat.id, "Bauyrym, ol kim?");
    // }

    // let champs = db.get('champs').value();
    // champs.push(suggestedChamp);
    // db.set('champs', champs).write();

    db.get('champs')
      .push(suggestedChamp)
      .write()
  
    bot.sendMessage(chatId, `${suggestedChamp} Champ!!!`)
  } catch(err) {
    console.log("err", err);
    bot.sendMessage(msg.chat.id, "Bauyrym, sen qatelestiń!!!");
  }
})
