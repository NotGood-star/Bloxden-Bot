// ================= IMPORTS =================
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

require("dotenv").config();

// ================= EXPRESS KEEP-ALIVE =================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive and running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= GLOBAL ERROR HANDLERS =================
process.on("unhandledRejection", (err) => {
  console.log("⚠️ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.log("⚠️ Uncaught Exception:", err);
});

process.on("uncaughtExceptionMonitor", (err) => {
  console.log("⚠️ Exception Monitor:", err);
});

// ================= DATA STORAGE =================
const warnings = new Map();

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("Stable Bot Running", { type: 3 });
});

// ================= LOGIN SAFETY =================
function startBot() {
  try {
    client.login(process.env.TOKEN);
  } catch (err) {
    console.log("❌ Login failed, retrying in 5s...", err);
    setTimeout(startBot, 5000);
  }
}

startBot();

// ================= COMMAND SYSTEM =================
const PREFIX = "/";

client.on("messageCreate", async (message) => {
  try {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // ================= FUN =================
    if (cmd === "ping") {
      return message.reply(`🏓 Pong! ${client.ws.ping}ms`);
    }

    if (cmd === "joke") {
      const jokes = [
        "Why do devs hate nature? Too many bugs.",
        "I told my PC to break, it crashed my life instead.",
        "Code never lies, comments sometimes do."
      ];
      return message.reply(`😂 ${random(jokes)}`);
    }

    if (cmd === "8ball") {
      const replies = ["Yes", "No", "Maybe", "Definitely", "Never"];
      return message.reply(`🎱 ${random(replies)}`);
    }

    if (cmd === "coinflip") {
      return message.reply(`🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}`);
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
      return message.reply("👢 User kicked");
    }

    if (cmd === "ban") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply("❌ No permission");

      const user = message.mentions.members.first();
      if (!user) return message.reply("Mention user");

      await user.ban().catch(() => {});
      return message.reply("🔨 User banned");
    }

    if (cmd === "timeout") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply("❌ No permission");

      const user = message.mentions.members.first();
      const time = parseInt(args[1]);

      if (!user || !time) return message.reply("Usage: /timeout @user seconds");

      await user.timeout(time * 1000).catch(() => {});
      return message.reply("⏳ User timed out");
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

    // ================= GIVEAWAY (BASIC) =================
    if (cmd === "gstart") {
      const prize = args.join(" ");
      if (!prize) return message.reply("Give prize");

      const msg = await message.channel.send(
        `🎁 GIVEAWAY\nPrize: ${prize}\nReact 🎉`
      );

      await msg.react("🎉");
    }

    if (cmd === "gend") {
      return message.reply("🎁 Giveaway ended (manual)");
    }

    // ================= DEFAULT =================
    if (cmd) {
      return message.reply("❓ Unknown command");
    }

  } catch (err) {
    console.log("⚠️ Command Error:", err);
    message.reply("❌ Error occurred but bot is still running").catch(() => {});
  }
});
