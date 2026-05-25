require("dotenv").config();

const express = require("express");
const app = express();

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(3000, () => {
  console.log("Web server running on port 3000");
});

client.once("clientReady", () => {
  console.log(`${client.user.tag} is Online!`);
});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {

    await interaction.reply(`
📜 BloxDen Commands

/help
/ping
/joke
    `);

  }

});

client.login(process.env.TOKEN);
