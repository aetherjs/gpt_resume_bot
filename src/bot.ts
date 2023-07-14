import TelegramBot, { Message, InlineKeyboardButton } from 'node-telegram-bot-api';
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

const collectButton: InlineKeyboardButton = {
  text: 'Collect',
  callback_data: 'collect'
};

const summariseButton: InlineKeyboardButton = {
  text: 'Summarise',
  callback_data: 'summarise'
};

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! I am your summarizing bot.', {
    reply_markup: {
      inline_keyboard: [[collectButton]]
    }
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id;
  const data = callbackQuery.data;

  if (!chatId) {
    console.error('Chat ID is undefined');
    return;
  }

  if (data === 'collect') {
    collectedText = '';
    bot.sendMessage(chatId, 'Now in collect mode. Forward messages to me and I will collect them.', {
      reply_markup: {
        inline_keyboard: [[summariseButton]]
      }
    });

    bot.on('message', (msg: Message) => {

      if (msg.text && msg.text.startsWith('/')) {
        return;
      }

      // Hard limit to 2000 words before I figure out the pricing and token limti
      if (collectedText.split(' ').length > 2000) {
        bot.sendMessage(chatId, 'Collected text is too long. Please use /summarise or start a new /collect session.');
        collectedText = '';
      } else {
        collectedText += ' ' + msg.text;
      }
    });
  } else if (data === 'summarise') {
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
      bot.sendMessage(chatId, response.data.choices[0].message.content, {
        reply_markup: {
          inline_keyboard: [[collectButton]]
        }
      });
      collectedText = '';
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'An error occurred while trying to summarise the text. Collected text discarded!', {
        reply_markup: {
          inline_keyboard: [[collectButton]]
        }
      });
      collectedText = '';
    }
  }
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