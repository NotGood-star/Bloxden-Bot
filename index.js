const express = require("express");
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

require("dotenv").config();

// ================= EXPRESS (RENDER KEEP ALIVE) =================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// ================= DISCORD BOT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= ANTI CRASH =================
process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);

// ================= WARN STORAGE =================
const warnings = new Map();

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("All-in-One Bot", { type: 3 });
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

  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ================= FUN =================
  if (cmd === "ping") {
    return message.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  if (cmd === "joke") {
    const jokes = [
      "Why did the dev go broke? Cache problems.",
      "I told my PC a joke, it crashed.",
      "Coding is 10% writing, 90% fixing errors."
    ];
    return message.reply(`😂 ${random(jokes)}`);
  }

  if (cmd === "8ball") {
    const answers = ["Yes", "No", "Maybe", "Definitely", "Never"];
    return message.reply(`🎱 ${random(answers)}`);
  }

  if (cmd === "coinflip") {
    return message.reply(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails");
  }

  if (cmd === "dice") {
    return message.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
  }

  // ================= MODERATION =================
  if (cmd === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ No permission");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention user");

    await user.kick().catch(() => {});
    return message.reply("👢 Kicked");
  }

  if (cmd === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ No permission");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention user");

    await user.ban().catch(() => {});
    return message.reply("🔨 Banned");
  }

  if (cmd === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("❌ No permission");

    const user = message.mentions.members.first();
    const time = parseInt(args[1]);

    if (!user || !time) return message.reply("Usage: /timeout @user seconds");

    await user.timeout(time * 1000).catch(() => {});
    return message.reply("⏳ Timed out");
  }

  // ================= WARN SYSTEM =================
  if (cmd === "warn") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("❌ No permission");

    const user = message.mentions.users.first();
    const reason = args.slice(1).join(" ") || "No reason";

    if (!user) return message.reply("Usage: /warn @user reason");

    if (!warnings.has(user.id)) warnings.set(user.id, []);

    warnings.get(user.id).push({
      reason,
      moderator: message.author.tag,
      date: new Date().toLocaleString()
    });

    return message.reply(`⚠️ Warned ${user.tag}`);
  }

  if (cmd === "warnings") {
    const user = message.mentions.users.first() || message.author;

    const data = warnings.get(user.id);

    if (!data || data.length === 0)
      return message.reply("✅ No warnings");

    let text = `⚠️ Warnings for ${user.tag}\n\n`;

    data.forEach((w, i) => {
      text += `#${i + 1}\nReason: ${w.reason}\nBy: ${w.moderator}\nDate: ${w.date}\n\n`;
    });

    return message.reply(text);
  }

  // ================= UTILITY =================
  if (cmd === "avatar") {
    const user = message.mentions.users.first() || message.author;
    return message.reply(user.displayAvatarURL());
  }

  if (cmd === "userinfo") {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`User: ${user.tag} | ID: ${user.id}`);
  }

  if (cmd === "serverinfo") {
    return message.reply(
      `Server: ${message.guild.name}\nMembers: ${message.guild.memberCount}`
    );
  }

  // ================= GIVEAWAY =================
  if (cmd === "gstart") {
    const prize = args.join(" ");
    if (!prize) return message.reply("Give prize");

    const msg = await message.channel.send(
      `🎁 GIVEAWAY\nPrize: ${prize}\nReact 🎉`
    );

    await msg.react("🎉");
  }

  if (cmd === "gend") {
    return message.reply("🎁 Giveaway ended");
  }
});
