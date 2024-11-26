import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export async function execute(interaction: CommandInteraction) {
  await interaction.reply("Pong!");
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
  await interaction.followUp("Wait... Pong again!");
}