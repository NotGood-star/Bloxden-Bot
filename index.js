const express = require("express");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
require("dotenv").config();

// ================= EXPRESS (RENDER KEEP ALIVE) =================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is online ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 Server running on port " + PORT);
});

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= ERROR HANDLING (CRASH PROOF) =================
process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ================= LOGIN =================
client.login(process.env.TOKEN);

// ================= PREFIX =================
const PREFIX = "/";

// ================= COMMANDS =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // ================= PING =================
  if (cmd === "ping") {
    return message.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  // ================= JOKE =================
  if (cmd === "joke") {
    const jokes = [
      "Why did the developer go broke? Because he used up all his cache.",
      "My code doesn’t have bugs — it just develops random features.",
      "Debugging: Being the detective in a crime movie where you are also the murderer."
    ];
    return message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
  }

  // ================= 8BALL =================
  if (cmd === "8ball") {
    const answers = ["Yes", "No", "Maybe", "Definitely", "Never", "Try again"];
    return message.reply(`🎱 ${answers[Math.floor(Math.random() * answers.length)]}`);
  }

  // ================= COINFLIP =================
  if (cmd === "coinflip") {
    return message.reply(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails");
  }

  // ================= DICE =================
  if (cmd === "dice") {
    return message.reply(`🎲 You rolled: ${Math.floor(Math.random() * 6) + 1}`);
  }

  // ================= AVATAR =================
  if (cmd === "avatar") {
    const user = message.mentions.users.first() || message.author;
    return message.reply(user.displayAvatarURL({ dynamic: true }));
  }

  // ================= USERINFO =================
  if (cmd === "userinfo") {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`👤 ${user.tag} | ID: ${user.id}`);
  }

  // ================= SERVER INFO =================
  if (cmd === "serverinfo") {
    return message.reply(
      `📌 Server: ${message.guild.name}\n👥 Members: ${message.guild.memberCount}`
    );
  }

  // ================= KICK =================
  if (cmd === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ No permission");

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Mention a user");

    await member.kick().catch(() => {});
    return message.reply("👢 User kicked");
  }

  // ================= BAN =================
  if (cmd === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ No permission");

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Mention a user");

    await member.ban().catch(() => {});
    return message.reply("🔨 User banned");
  }

  // ================= WARN =================
  if (cmd === "warn") {
    return message.reply("⚠️ Warn system ready (upgrade needed for database)");
  }

  // ================= GIVEAWAY =================
  if (cmd === "gstart") {
    const prize = args.join(" ");
    if (!prize) return message.reply("❌ Give a prize");

    const msg = await message.channel.send(`🎁 GIVEAWAY: ${prize}\nReact 🎉`);
    await msg.react("🎉");
  }

  if (cmd === "gend") {
    return message.reply("🎁 Giveaway ended");
  }
});
