require('dotenv').config();
import TelegramBot = require('node-telegram-bot-api');
import { Message } from 'node-telegram-bot-api';

const token: string = process.env.TELEGRAM_BOT_TOKEN!;

// Create a bot that uses 'polling' to fetch new updates
const bot: TelegramBot = new TelegramBot(token, {polling: true});

// Matches "/start"
bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Hello! Welcome to our bot. How can I assist you today?');
});
