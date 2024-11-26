import dotenv from 'dotenv';

dotenv.config();

const { CLIENT_ID, BOT_TOKEN, GUILD_ID } = process.env;

if (!CLIENT_ID || !BOT_TOKEN || !GUILD_ID ) {
  throw new Error("Missing environment variables");
}

export const config = {
  CLIENT_ID, 
  BOT_TOKEN, 
  GUILD_ID
};
