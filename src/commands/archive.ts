import { SlashCommandBuilder, CommandInteraction, GuildChannel } from 'discord.js';
import dotenv from "dotenv";

dotenv.config();

export const data = new SlashCommandBuilder()
    .setName('archive')
    .setDescription('Archive a channel by moving it to the archive category.')
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('The channel to archive')
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    try {
        // Get the channel and category from the interaction
        const channel = interaction.options.get('channel', true).channel as GuildChannel;
        console.log(channel);

        if (!channel) {
            return interaction.reply({
                content: 'Invalid channel specified.',
                ephemeral: true,
            });
        }

        // Check if the channel is already in the archive category
        const archiveCategoryId = process.env.ARCHIVE_ID || "";
        if (channel.parentId === archiveCategoryId) {
            return interaction.reply({
                content: 'This channel is already archived.',
                ephemeral: true,
            });
        }

        // Move the channel to the archive category
        await channel.setParent(archiveCategoryId, { lockPermissions: false });

        // Notify the user
        return interaction.reply({
            content: `The channel ${channel.name} has been archived successfully.`,
            ephemeral: true,
        });
    } catch (error) {
        console.error('Error archiving channel:', error);
        return interaction.reply({
            content: 'There was an error trying to archive the channel. Please try again later.',
            ephemeral: true,
        });
    }
}