import { CommandInteraction, SlashCommandBuilder, TextChannel, Guild } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Creates a channel and sends a message in it.")
  .addStringOption((option) =>
    option.setName("title").setDescription("The title for the channel").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("date").setDescription("The date for the channel").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("link").setDescription("A link to post in the created channel").setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  const title = interaction.options.get("title")?.value as string;
  const date = interaction.options.get("date")?.value as string;
  const link = interaction.options.get("link")?.value as string;

  if (!interaction.guild) {
    return interaction.reply("This command can only be used in a server.");
  }

  const channelName = `${title}-${date}`.toLowerCase().replace(/\s+/g, "-"); // Sanitize channel name

  try {
    // Create the channel in the guild
    const newChannel = await interaction.guild.channels.create({
      name: channelName,
      type: 0, // '0' corresponds to a text channel
    });

    if (newChannel instanceof TextChannel) {
      await newChannel.send(`${link}`);
    }
    await interaction.reply(`Channel "${channelName}" created! Link sent in the channel.`);
  } 
  catch (error) {
    console.error("Error creating channel:", error);
    await interaction.reply("An error occurred while creating the channel.");
  }
}
