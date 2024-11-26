import { Client as DiscordClient, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextChannel, Guild } from "discord.js";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import { Client } from "pg";
import { createChannelAndEvent } from "./commands/add";
import dotenv from "dotenv";
import { channel } from "diagnostics_channel";

dotenv.config();

const channelID = process.env.CHANNEL_ID || "";

const dbClient = new Client({
  connectionString: process.env.DATABASE_URL,
});
(async () => {
  dbClient.connect();
})();

dbClient.query("LISTEN new_entry");

export const discordClient = new DiscordClient({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

discordClient.once("ready", async () => {
  await deployCommands({ guildId: config.GUILD_ID });
  console.log("Discord bot is ready! 🤖");
});

dbClient.on("notification", async (msg: any) => {
  const payload = JSON.parse(msg.payload);
  console.log(payload);
  const { id, title, start_date, end_date, link } = payload;

  try {
    const notificationChannel = discordClient.channels.cache.get(
      channelID
    ) as TextChannel;

    if (!notificationChannel) {
      console.error("Notification channel not found.");
      return;
    }
    
    const confirm = new ButtonBuilder()
      .setCustomId(String(id))
      .setLabel('Add Event')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
			.addComponents(confirm);

    await notificationChannel.send({
      content: `**New Entry Detected:**\n- **Title**: ${title}\n- **Date**: ${start_date} to ${end_date}\n- **Link**: ${link}\nClick the button below to create a channel and event.`,
      components: [row],
    });
  } 
  
  catch (error) {
    console.error("Error sending notification message:", error);
  }
});

discordClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  const customId = interaction.customId;
  console.log(customId);

  let title = "";
  let start_date = "";
  let end_date = "";
  let link = "";
  (async () => {
    const { rows: [event] } = await dbClient.query(`SELECT title, start_date, end_date, link FROM events WHERE id = ${customId}`);
    console.log(event);
    if (event) {
      ({ title, start_date, end_date, link } = event); 
      console.log(title, start_date, end_date, link);
    }
  })();

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply("This interaction can only be used in a server.");
      return;
    }

    await interaction.deferReply();

    const result = await createChannelAndEvent(guild, title, start_date, end_date, link);

    await interaction.editReply(result);
  } 
  catch (error) {
    console.error("Error handling button interaction:", error);
    await interaction.reply("An error occurred while processing your request.");
  }
});

discordClient.login(config.BOT_TOKEN);