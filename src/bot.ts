import TelegramBot, { Message } from 'node-telegram-bot-api';
import dotenv from 'dotenv';
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

openai.apiKey = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

let collectedText = '';

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! I am your summarizing bot. Use /collect to start collecting messages.');
});

bot.onText(/\/collect/, (msg: Message) => {
  const chatId = msg.chat.id;
  collectedText = '';
  bot.sendMessage(chatId, 'Now in collect mode. Forward messages to me and I will collect them. Use /summarise to summarise collected messages.');
});

bot.on('message', (msg: Message) => {
  const chatId = msg.chat.id;
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  if (collectedText.split(' ').length > 1000) {
    bot.sendMessage(chatId, 'Collected text is too long. Please use /summarise or start a new /collect session.');
    collectedText = '';
  } else {
    collectedText += ' ' + msg.text;
  }
});

bot.onText(/\/summarise/, async (msg: Message) => {
  const chatId = msg.chat.id;
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system",
          "content": "Please summarise this list of messages from telegram news channels."
        },
        {
          "role": "user",
          "content": collectedText
        }
      ],
    });
    bot.sendMessage(chatId, response.data.choices[0].message.content);
    collectedText = '';
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'An error occurred while trying to summarise the text. Collected text discarded!');
    collectedText = '';
  }
});
