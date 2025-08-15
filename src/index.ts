import dotenv from 'dotenv';
dotenv.config();

import { WhatsappBot } from './bot/whatsappBot';

console.log('Bot inmobiliario iniciado.');
const bot = new WhatsappBot();
bot.start();
