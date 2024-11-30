import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import * as ping from "./ping";
import * as add from "./add";
import * as archive from "./archive";

export type Command = {
  data: SlashCommandBuilder; // For command metadata
  execute: (interaction: CommandInteraction) => Promise<void>; // For execution
};

export const commands: Record<string, Command> = {
  ping,
  add, 
  archive
};
