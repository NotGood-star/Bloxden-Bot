const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(3000, () => {
  console.log("Web server running on port 3000");
});
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],

  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
});

client.commands = new Collection();

const PREFIX = "/";

let warnings = {};
let reactionRoles = {};

if (fs.existsSync("./warnings.json")) {
  warnings = JSON.parse(fs.readFileSync("./warnings.json"));
}

if (fs.existsSync("./reactionRoles.json")) {
  reactionRoles = JSON.parse(fs.readFileSync("./reactionRoles.json"));
}

function saveWarnings() {
  fs.writeFileSync("./warnings.json", JSON.stringify(warnings, null, 2));
}

function saveReactionRoles() {
  fs.writeFileSync(
    "./reactionRoles.json",
    JSON.stringify(reactionRoles, null, 2)
  );
}

client.once("ready", () => {
  console.log(`${client.user.tag} is Online!`);
  client.user.setActivity("Made By Not_Good");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // =========================
  // HELP COMMAND
  // =========================

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Help Menu")
      .setDescription(`
🎁 Giveaway Commands
/giveaway-create
/giveaway-end
/g-reroll

🤣 Fun Commands
/joke
/guess
/rps
/quote
/coinflip
/dice

⚔️ Moderation Commands
/warn
/warnings
/ban
/banlist
/kick
/timeout
/addrole
/removerole

🔥 Reaction Roles
/reactionrole-set
/reactionrole-remove

🪄 Utility
/serverinfo
/help
      `)
      .setFooter({
        text: "Bot Made By Not_Good (@not_good67)",
      });

    return message.reply({ embeds: [embed] });
  }

  // =========================
  // JOKE
  // =========================

  if (command === "joke") {
    const jokes = [
      "Why did the chicken join Discord? To talk with friends!",
      "Why are Discord bots smart? Because they have good commands.",
      "Why did the gamer bring a ladder? To rank up!",
    ];

    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    return message.reply(joke);
  }

  // =========================
  // COINFLIP
  // =========================

  if (command === "coinflip") {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    return message.reply(`🪙 Result: **${result}**`);
  }

  // =========================
  // DICE
  // =========================

  if (command === "dice") {
    const roll = Math.floor(Math.random() * 6) + 1;

    return message.reply(`🎲 You rolled: **${roll}**`);
  }

  // =========================
  // QUOTE
  // =========================

  if (command === "quote") {
    const quotes = [
      "Dream big and dare to fail.",
      "Never give up.",
      "Success comes from hard work.",
      "Stay focused and keep grinding.",
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    return message.reply(`💬 ${quote}`);
  }

  // =========================
  // RPS
  // =========================

  if (command === "rps") {
    const choices = ["rock", "paper", "scissors"];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return message.reply("Use: /rps rock/paper/scissors");
    }

    const botChoice =
      choices[Math.floor(Math.random() * choices.length)];

    let result = "";

    if (userChoice === botChoice) {
      result = "It's a Tie!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "You Win!";
    } else {
      result = "You Lose!";
    }

    return message.reply(`
You: ${userChoice}
Bot: ${botChoice}

${result}
`);
  }

  // =========================
  // GUESS NUMBER
  // =========================

  if (command === "guess") {
    const number = Math.floor(Math.random() * 10) + 1;
    const guess = parseInt(args[0]);

    if (!guess) {
      return message.reply("Use: /guess <1-10>");
    }

    if (guess === number) {
      return message.reply(
        `🎉 Correct! Number was ${number}`
      );
    } else {
      return message.reply(
        `❌ Wrong! Number was ${number}`
      );
    }
  }

  // =========================
  // WARN
  // =========================

  if (command === "warn") {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    ) {
      return message.reply("❌ No Permission");
    }

    const member = message.mentions.users.first();

    if (!member) {
      return message.reply("Mention a user");
    }

    const reason = args.slice(1).join(" ") || "No reason";

    if (!warnings[member.id]) {
      warnings[member.id] = [];
    }

    warnings[member.id].push(reason);

    saveWarnings();

    return message.reply(
      `⚠️ ${member.tag} warned.\nReason: ${reason}`
    );
  }

  // =========================
  // WARNINGS
  // =========================

  if (command === "warnings") {
    const member = message.mentions.users.first();

    if (!member) {
      return message.reply("Mention a user");
    }

    const userWarnings = warnings[member.id] || [];

    return message.reply(
      `${member.tag} has ${userWarnings.length} warnings.`
    );
  }

  // =========================
  // BAN
  // =========================

  if (command === "ban") {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.BanMembers
      )
    ) {
      return message.reply("❌ No Permission");
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply("Mention a user");
    }

    const reason = args.slice(1).join(" ") || "No reason";

    await member.ban({ reason });

    return message.reply(
      `🔨 ${member.user.tag} banned.`
    );
  }

  // =========================
  // KICK
  // =========================

  if (command === "kick") {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.KickMembers
      )
    ) {
      return message.reply("❌ No Permission");
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply("Mention a user");
    }

    await member.kick();

    return message.reply(
      `👢 ${member.user.tag} kicked.`
    );
  }

  // =========================
  // TIMEOUT
  // =========================

  if (command === "timeout") {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    ) {
      return message.reply("❌ No Permission");
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply("Mention a user");
    }

    await member.timeout(60000);

    return message.reply(
      `⏰ ${member.user.tag} timed out for 1 minute`
    );
  }

  // =========================
  // ADD ROLE
  // =========================

  if (command === "addrole") {
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) {
      return message.reply(
        "Use: /addrole @user @role"
      );
    }

    await member.roles.add(role);

    return message.reply("✅ Role Added");
  }

  // =========================
  // REMOVE ROLE
  // =========================

  if (command === "removerole") {
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) {
      return message.reply(
        "Use: /removerole @user @role"
      );
    }

    await member.roles.remove(role);

    return message.reply("✅ Role Removed");
  }

  // =========================
  // SERVER INFO
  // =========================

  if (command === "serverinfo") {
    const embed = new EmbedBuilder()
      .setTitle(message.guild.name)
      .setThumbnail(message.guild.iconURL())
      .addFields(
        {
          name: "👥 Members",
          value: `${message.guild.memberCount}`,
          inline: true,
        },
        {
          name: "📅 Created",
          value: `${message.guild.createdAt.toDateString()}`,
          inline: true,
        }
      );

    return message.reply({ embeds: [embed] });
  }

  // =========================
  // REACTION ROLE SET
  // =========================

  if (command === "reactionrole-set") {
    const emoji = args[0];
    const role = message.mentions.roles.first();

    if (!emoji || !role) {
      return message.reply(
        "Use: /reactionrole-set 😀 @role"
      );
    }

    reactionRoles[emoji] = role.id;
    saveReactionRoles();

    await message.react(emoji);

    return message.reply("✅ Reaction Role Created");
  }

  // =========================
  // REACTION ROLE REMOVE
  // =========================

  if (command === "reactionrole-remove") {
    const emoji = args[0];

    delete reactionRoles[emoji];
    saveReactionRoles();

    return message.reply("✅ Reaction Role Removed");
  }
});

// =========================
// REACTION ROLE ADD
// =========================

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  const roleId = reactionRoles[reaction.emoji.name];

  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(
    user.id
  );

  await member.roles.add(roleId);
});

// =========================
// REACTION ROLE REMOVE
// =========================

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  const roleId = reactionRoles[reaction.emoji.name];

  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(
    user.id
  );

  await member.roles.remove(roleId);
});

client.login(process.env.TOKEN);
