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
    // Create the channel
    const newChannel = await interaction.guild.channels.create({
      name: channelName,
      type: 0, // '0' corresponds to a text channel
    });

    if (newChannel instanceof TextChannel) {
      await newChannel.send(`${link}`);
    }
    // Hardcode time to midnight
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0); // Set to midnight
    // Create new event
    const scheduledEvent = await interaction.guild.scheduledEvents.create({
        name: title, 
        scheduledStartTime: eventDate, 
        scheduledEndTime: new Date(eventDate.getTime() + 60 * 60 * 1000), // Hardcode 1 hr as end date (will be fixded)
        privacyLevel: 2, // "GUILD_ONLY"
        entityType: 3, // "EXTERNAL"
        entityMetadata: { location: link }, 
        description: `Details: ${link}`, 
    });
  } 
  catch (error) {
    console.error("Error:", error);
    await interaction.reply("An error occurred.");
  }
}
