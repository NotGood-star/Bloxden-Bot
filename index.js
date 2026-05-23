const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = "/";
const warnings = new Map(); // ⚠️ WARN STORAGE

// ================= READY =================
client.once("ready", () => {
  console.log(`${client.user.tag} is online`);
  client.user.setActivity("All-in-One Bot", { type: 3 });
});

// ================= RANDOM FUNCTION =================
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ================= COMMANDS =================
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // ================= FUN =================

  if (cmd === "ping") {
    return message.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  if (cmd === "8ball") {
    const replies = ["Yes", "No", "Maybe", "Definitely", "Never", "Ask again"];
    return message.reply(`🎱 ${random(replies)}`);
  }

  if (cmd === "joke") {
    const jokes = [
      "Why did the developer go broke? Because he used up all his cache.",
      "I told my computer I needed a break, and it said 'No problem'.",
      "Why do programmers hate nature? Too many bugs."
    ];
    return message.reply(`😂 ${random(jokes)}`);
  }

  if (cmd === "rps") {
    const choices = ["rock", "paper", "scissors"];
    const bot = random(choices);
    const user = args[0];

    if (!user) return message.reply("Usage: /rps rock|paper|scissors");

    if (user === bot) return message.reply(`Tie! I chose ${bot}`);

    if (
      (user === "rock" && bot === "scissors") ||
      (user === "paper" && bot === "rock") ||
      (user === "scissors" && bot === "paper")
    ) {
      return message.reply(`You win! I chose ${bot}`);
    }

    return message.reply(`I win! I chose ${bot}`);
  }

  if (cmd === "coinflip") {
    return message.reply(`🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}`);
  }

  if (cmd === "dice") {
    return message.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
  }

  if (cmd === "guess") {
    const num = Math.floor(Math.random() * 10) + 1;
    const guess = parseInt(args[0]);
    if (!guess) return message.reply("Guess 1-10");
    return message.reply(guess === num ? "Correct!" : `Wrong! It was ${num}`);
  }

  if (cmd === "quote") {
    const quotes = ["Believe in yourself", "Never give up", "Work hard"];
    return message.reply(`💬 ${random(quotes)}`);
  }

  // ================= MODERATION =================

  if (cmd === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("No permission");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention user");

    await user.ban();
    return message.reply("User banned");
  }

  if (cmd === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("No permission");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention user");

    await user.kick();
    return message.reply("User kicked");
  }

  if (cmd === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission");

    const user = message.mentions.members.first();
    const time = args[1];

    if (!user || !time) return message.reply("Usage: /timeout @user seconds");

    await user.timeout(time * 1000);
    return message.reply("User timed out");
  }

  // ================= WARN SYSTEM =================

  if (cmd === "warn") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission");

    const user = message.mentions.users.first();
    const reason = args.slice(1).join(" ") || "No reason";

    if (!user) return message.reply("Usage: /warn @user reason");

    if (!warnings.has(user.id)) warnings.set(user.id, []);

    warnings.get(user.id).push({
      reason,
      moderator: message.author.tag,
      date: new Date().toLocaleString()
    });

    return message.reply(`⚠️ ${user.tag} warned`);
  }

  if (cmd === "warnings") {
    const user = message.mentions.users.first() || message.author;

    const data = warnings.get(user.id);

    if (!data || data.length === 0)
      return message.reply("No warnings");

    let text = `⚠️ Warnings for ${user.tag}\n\n`;

    data.forEach((w, i) => {
      text += `#${i + 1}\nReason: ${w.reason}\nBy: ${w.moderator}\nDate: ${w.date}\n\n`;
    });

    return message.reply(text);
  }

  // ================= UTILITY =================

  if (cmd === "serverinfo") {
    return message.reply(`Server: ${message.guild.name}\nMembers: ${message.guild.memberCount}`);
  }

  if (cmd === "userinfo") {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`User: ${user.tag} | ID: ${user.id}`);
  }

  if (cmd === "avatar") {
    const user = message.mentions.users.first() || message.author;
    return message.reply(user.displayAvatarURL());
  }

  // ================= ROBLOX (PLACEHOLDER) =================

  if (cmd === "robloxuser") {
    const name = args[0];
    if (!name) return message.reply("Enter username");
    return message.reply(`Roblox search: ${name}`);
  }

  if (cmd === "bloxfruitstock") {
    return message.reply("🍎 Stock system requires API");
  }

  if (cmd === "gamepass") {
    return message.reply("🎮 Gamepass lookup requires API");
  }

  // ================= GIVEAWAY (SIMPLE) =================

  if (cmd === "gstart") {
    const prize = args.join(" ");
    if (!prize) return message.reply("Give prize");

    const msg = await message.channel.send(
      `🎁 GIVEAWAY\nPrize: ${prize}\nReact 🎉`
    );

    await msg.react("🎉");
  }

  if (cmd === "greroll") {
    return message.reply("Reroll needs advanced system");
  }

  if (cmd === "gend") {
    return message.reply("Giveaway ended");
  }
});

// ================= LOGIN =================
client.login(process.MTUwNzU5MDk1ODgzNjA4ODkzMg.GF8HVn.ns0O8ciqF4BtttrDIfrAx-Ploy3hmzyF7K-KgkTOKEN);
