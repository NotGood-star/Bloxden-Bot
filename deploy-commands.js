require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help menu"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping command"),

  new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Funny joke")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {

    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered!");

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
