require("dotenv").config();

const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

app.get("/", (req, res) => {
  res.send("Running");
});

app.listen(3000, () => {
  console.log("Web running");
});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {

    console.log("Help command used");

    await interaction.reply("Hello!");

  }

});

client.login(process.env.TOKEN);
