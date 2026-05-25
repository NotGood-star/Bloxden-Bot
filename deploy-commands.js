const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

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

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {

    console.log("TOKEN:", TOKEN ? "Loaded" : "Missing");
    console.log("CLIENT_ID:", CLIENT_ID ? "Loaded" : "Missing");

    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered!");

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
