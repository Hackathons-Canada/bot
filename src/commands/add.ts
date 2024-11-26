import { CommandInteraction, SlashCommandBuilder, TextChannel, Guild } from "discord.js";
''
export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Creates a channel and sends a message in it.")
  .addStringOption((option) =>
    option.setName("title").setDescription("The title for the channel").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("start_date").setDescription("Start date").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("end_date").setDescription("End date").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("link").setDescription("A link to post in the created channel").setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  const title = interaction.options.get("title")?.value as string;
  const start_date = interaction.options.get("start_date")?.value as string;
  const end_date = interaction.options.get("end_date")?.value as string;
  const link = interaction.options.get("link")?.value as string;

  if (!interaction.guild) {
    return interaction.reply("This command can only be used in a server.");
  }

  try {
    const result = await createChannelAndEvent(interaction.guild, title, start_date, end_date, link);
    await interaction.reply(result);
  } catch (error) {
    console.error("Error:", error);
    await interaction.reply("An error occurred while creating the channel or event.");
  }
}

export async function createChannelAndEvent(
  guild: Guild,
  title: string,
  start_date: string,
  end_date: string,
  link: string
): Promise<string> {
  const channelName = `${title}-${start_date}`.toLowerCase().replace(/\s+/g, "-");
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  startDate.setHours(0, 0, 0, 0); 
  if (startDate.getTime() === endDate.setHours(0, 0, 0, 0)) {
    // If dates are the same, set endDate to 11:59 PM
    endDate.setHours(23, 59, 59, 999);
  } 
  else {
    // Otherwise, set endDate to midnight
    endDate.setHours(0, 0, 0, 0);
  }
  console.log({ startDate, endDate });

  // Create the channel
  const newChannel = await guild.channels.create({
    name: channelName,
    type: 0, // '0' corresponds to a text channel
  });

  if (newChannel instanceof TextChannel) {
    await newChannel.send(`${link}`);
  }

  // Create the event
  const scheduledEvent = await guild.scheduledEvents.create({
    name: title,
    scheduledStartTime: startDate,
    scheduledEndTime: endDate,
    privacyLevel: 2, // "GUILD_ONLY"
    entityType: 3, // "EXTERNAL"
    entityMetadata: { location: link },
    description: `Details: ${link}`,
  });

  return `Channel ${newChannel.name} and event ${scheduledEvent.name} created successfully.`;
}
