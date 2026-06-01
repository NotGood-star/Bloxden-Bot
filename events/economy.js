const fs = require("fs");
const {
  EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let economy = {};

if (fs.existsSync("economy.json")) {

economy = JSON.parse(
fs.readFileSync("economy.json")
);

}

/* ========================= */
/* SHOP */
/* ========================= */

const shopItems = {

vip: {
name: "💎 VIP Role",
price: 5000
},

merchant: {
name: "🛒 Merchant Role",
price: 10000
},

king: {
name: "👑 King Role",
price: 25000
},

boost: {
name: "🚀 Boost Role",
price: 30000
},

legend: {
name: "🌟 Legend Role",
price: 50000
},

mythic: {
name: "🔥 Mythic Role",
price: 100000
},

elite: {
name: "💠 Elite Role",
price: 250000
},

bloxdengod: {
name: "🏆 BloxDen God",
price: 1000000
}

};

/* ========================= */
/* JOBS */
/* ========================= */

const jobs = {

businessman: { name: "💼 Businessman", min: 500, max: 1500 },

hacker: { name: "💻 Hacker", min: 800, max: 2200 },

developer: { name: "👨‍💻 Developer", min: 700, max: 2000 },

politician: { name: "🗳️ Politician", min: 1000, max: 3000 },

astronaut: { name: "🚀 Astronaut", min: 2500, max: 5000 },

driver: { name: "🚗 Driver", min: 300, max: 900 },

bankmanager: { name: "🏦 Bank Manager", min: 1500, max: 3500 },

magician: { name: "🪄 Magician", min: 500, max: 1800 },

fighter: { name: "⚔️ Fighter", min: 700, max: 2500 },

footballer: { name: "⚽ Footballer", min: 1200, max: 4000 },

musician: { name: "🎼 Musician", min: 500, max: 2000 },

gambler: { name: "🎰 Gambler", min: 0, max: 5000 },

gamer: { name: "🎮 Gamer", min: 400, max: 1800 },

detective: { name: "🕵️ Detective", min: 800, max: 2500 },

director: { name: "🎥 Director", min: 1500, max: 4500 }

};

/* ========================= */
/* SAVE */
/* ========================= */

function saveData() {

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

}
function formatCoins(amount) {
  return Number(amount).toLocaleString("en-US");
}

function createEmbed(
interaction,
title,
description,
color = "#5865F2"
) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: `${interaction.user.username} • BloxDen Economy`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setDescription(description)
    .setTitle(title)
    .setThumbnail(
      interaction.user.displayAvatarURL()
    )
    .setFooter({
      text: "BloxDen Economy System"
    })
    .setTimestamp();
}
/* ========================= */
/* CREATE USER */
/* ========================= */

function createUser(id) {

if (!economy[id]) {

economy[id] = {
coins: 0,
job: null,
inventory: [],
lastDaily: 0,
dailyStreak: 0,
lastWork: 0,
lastBeg: 0,
lastCrime: 0,
lastRob: 0
};

} else {

economy[id].lastBeg ??= 0;
economy[id].lastCrime ??= 0;
economy[id].lastRob ??= 0;
economy[id].lastWork ??= 0;
economy[id].lastDaily ??= 0;

}

}

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* BALANCE */
/* ========================= */

if (interaction.commandName === "balance") {

const user =
interaction.options.getUser("user") ||
interaction.user;

createUser(user.id);

const embed = createEmbed(
interaction,
"💰 Balance",
`### 🪙 Wallet

**${user.username}**
has

💵 **${formatCoins(
economy[user.id].coins
)} Coins**`,
"#FFD700"
);

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* DAILY */
/* ========================= */

if (interaction.commandName === "daily") {

createUser(interaction.user.id);

const user =
economy[interaction.user.id];

const cooldown =
24 * 60 * 60 * 1000;

if (
Date.now() - user.lastDaily
< cooldown
) {

return interaction.reply({
content:
"⏳ You already claimed daily today",
ephemeral: true
});

}

user.coins += 1000;

user.lastDaily = Date.now();

user.dailyStreak++;

saveData();

const embed = createEmbed(
interaction,
"🎁 Daily Reward",
`💰 Received:
**1,000 🪙**

🔥 Daily Streak:
**${user.dailyStreak}**`,
"#57F287"
);

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* DAILY STREAK */
/* ========================= */

if (
interaction.commandName ===
"dailystreak"
) {

createUser(interaction.user.id);

return interaction.reply(
`🔥 Daily Streak:
${economy[
interaction.user.id
].dailyStreak}`
);

}

/* ========================= */
/* BEG */
/* ========================= */

if (interaction.commandName === "beg") {

createUser(interaction.user.id);

const cooldown = 10 * 60 * 1000; // 10 minutes

if (
Date.now() -
economy[interaction.user.id].lastBeg <
cooldown
) {

return interaction.reply({
content:
"⏳ You must wait 10 minutes before begging again.",
ephemeral: true
});

}

economy[interaction.user.id].lastBeg =
Date.now();

const amount =
Math.floor(Math.random() * 500) + 100;

economy[
interaction.user.id
].coins += amount;

saveData();

const embed = createEmbed(
interaction,
"🙏 Beg",
`A stranger felt generous.

💰 Received:
**${formatCoins(amount)} 🪙**`,
"#57F287"
);

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* CRIME */
/* ========================= */

if (interaction.commandName === "crime") {

  createUser(interaction.user.id);

  const cooldown = 5 * 60 * 1000;

  if (
    Date.now() -
      economy[interaction.user.id].lastCrime <
    cooldown
  ) {
    return interaction.reply({
      content:
        "⏳ You must wait 5 minutes before committing another crime.",
      ephemeral: true
    });
  }

  economy[interaction.user.id].lastCrime =
    Date.now();

  const success = Math.random() < 0.5;

  if (success) {

    const amount =
      Math.floor(Math.random() * 2000) + 500;

    economy[interaction.user.id].coins +=
      amount;

    saveData();

    const embed = createEmbed(
      interaction,
      "🚔 Crime Successful",
      `💰 Earned:\n**${formatCoins(amount)} 🪙**`,
      "#57F287"
    );

    return interaction.reply({
      embeds: [embed]
    });

  } else {

    const amount =
      Math.floor(Math.random() * 1000) + 200;

    economy[interaction.user.id].coins -=
      amount;

    saveData();

    const embed = createEmbed(
      interaction,
      "🚓 Arrested",
      `💸 Fine:\n**${formatCoins(amount)} 🪙**`,
      "#ED4245"
    );

    return interaction.reply({
      embeds: [embed]
    });

  }

}

/* ========================= */
/* WORK APPLY */
/* ========================= */

if (
if (interaction.commandName === "workapply") {

  const job =
    interaction.options.getString("job");

  createUser(interaction.user.id);

  if (!jobs[job]) {

    return interaction.reply({
      embeds: [
        createEmbed(
          interaction,
          "❌ Invalid Job",
          "That job does not exist.",
          "#ED4245"
        )
      ]
    });

  }

  economy[interaction.user.id].job = job;

  saveData();

  return interaction.reply({
    embeds: [
      createEmbed(
        interaction,
        "💼 Job Applied",
        `You are now working as\n**${jobs[job].name}**`,
        "#57F287"
      )
    ]
  });

}

/* ========================= */
/* WORK */
/* ========================= */

if (interaction.commandName === "work") {

createUser(interaction.user.id);

const user =
economy[interaction.user.id];

if (!user.job) {

return interaction.reply(
"❌ Apply for a job first using /workapply"
);

}

const cooldown =
5 * 60 * 60 * 1000;

if (
Date.now() - user.lastWork
< cooldown
) {

const remaining =
cooldown -
(Date.now() - user.lastWork);

const hours =
Math.floor(
remaining / (60 * 60 * 1000)
);

const minutes =
Math.floor(
(remaining % (60 * 60 * 1000))
/ (60 * 1000)
);

return interaction.reply({
content:
`⏳ Work again in ${hours}h ${minutes}m`,
ephemeral: true
});

}

const salary =
Math.floor(
Math.random() *
(jobs[user.job].max - jobs[user.job].min + 1)
) + jobs[user.job].min;

user.coins += salary;

user.lastWork = Date.now();

saveData();

const embed = createEmbed(
interaction,
"💼 Work Complete",
`🏢 Job:
**${jobs[user.job].name}**

💰 Earned:
**${formatCoins(salary)} 🪙**`,
"#57F287"
);

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* ROB */
/* ========================= */

if (interaction.commandName === "rob") {

  createUser(interaction.user.id);

  const cooldown = 30 * 60 * 1000; // 30 minutes

  const lastRob = economy[interaction.user.id].lastRob || 0;

  if (Date.now() - lastRob < cooldown) {
    return interaction.reply({
      content: "⏳ You must wait 30 minutes before robbing again.",
      ephemeral: true
    });
  }

  const target = interaction.options.getUser("user");

  if (target.id === interaction.user.id) {
    return interaction.reply("❌ You can't rob yourself");
  }

  createUser(target.id);

  if (economy[target.id].coins < 500) {
    return interaction.reply("❌ User has low coins");
  }

  const success = Math.random() < 0.5;

  economy[interaction.user.id].lastRob = Date.now();

  if (success) {

  const amount =
    Math.floor(Math.random() * 1000) + 200;

  economy[interaction.user.id].coins +=
    amount;

  economy[target.id].coins -= amount;

  saveData();

  const embed = createEmbed(
    interaction,
    "🔫 Rob Successful",
    `Victim: **${target.username}**\n\n💰 Stolen: **${formatCoins(amount)} 🪙**`,
    "#57F287"
  );

  return interaction.reply({
    embeds: [embed]
  });

}

saveData();

const embed = createEmbed(
  interaction,
  "🚔 Rob Failed",
  "The victim escaped and called the police.",
  "#ED4245"
);

return interaction.reply({
  embeds: [embed]
});

/* ========================= */
/* PAY */
/* ========================= */

if (interaction.commandName === "pay") {
if (interaction.commandName === "pay") {

  const target =
    interaction.options.getUser("user");

  const amount =
    interaction.options.getInteger("amount");

  createUser(interaction.user.id);
  createUser(target.id);

  if (amount <= 0) {

    return interaction.reply({
      embeds: [
        createEmbed(
          interaction,
          "❌ Invalid Amount",
          "Amount must be greater than 0.",
          "#ED4245"
        )
      ]
    });

  }

  if (
    economy[interaction.user.id].coins <
    amount
  ) {

    return interaction.reply({
      embeds: [
        createEmbed(
          interaction,
          "❌ Not Enough Coins",
          "You don't have enough coins.",
          "#ED4245"
        )
      ]
    });

  }

  economy[interaction.user.id].coins -=
    amount;

  economy[target.id].coins += amount;

  saveData();

  const embed = createEmbed(
    interaction,
    "💸 Payment Sent",
    `Recipient: **${target.username}**\n\nAmount: **${formatCoins(amount)} 🪙**`,
    "#57F287"
  );

  return interaction.reply({
    embeds: [embed]
  });

}

/* ========================= */
/* SHOP */
/* ========================= */

if (interaction.commandName === "shop") {

const embed = new EmbedBuilder()
.setColor("#00BFFF")
.setTitle("🛒 BloxDen Shop")
.setDescription(
"Purchase exclusive roles using your coins."
)
.addFields(
{
name: "💎 VIP",
value: "5,000 🪙",
inline: true
},
{
name: "🛒 Merchant",
value: "10,000 🪙",
inline: true
},
{
name: "👑 King",
value: "25,000 🪙",
inline: true
},
{
name: "🚀 Boost",
value: "30,000 🪙",
inline: true
},
{
name: "🌟 Legend",
value: "50,000 🪙",
inline: true
},
{
name: "🔥 Mythic",
value: "100,000 🪙",
inline: true
},
{
name: "💠 Elite",
value: "250,000 🪙",
inline: true
},
{
name: "🏆 BloxDen God",
value: "1,000,000 🪙",
inline: true
}
)
.setFooter({
text: "Use /buy <item>"
})
.setTimestamp();

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* BUY */
/* ========================= */

if (interaction.commandName === "buy") {

const item =
interaction.options
.getString("item")
.toLowerCase();

createUser(interaction.user.id);

if (!shopItems[item]) {

return interaction.reply(
"❌ Item not found"
);

}

const data =
shopItems[item];

if (
economy[
interaction.user.id
].coins < data.price
) {

return interaction.reply(
"❌ Not enough coins"
);

}

economy[
interaction.user.id
].coins -= data.price;

economy[
interaction.user.id
].inventory.push(data.name);

saveData();

const embed = createEmbed(
interaction,
"🛒 Purchase Successful",
`📦 Item:
**${data.name}**

💸 Cost:
**${formatCoins(data.price)} 🪙**`,
"#57F287"
);

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* INVENTORY */
/* ========================= */

if (interaction.commandName === "inventory") {

const user =
interaction.options.getUser("user") ||
interaction.user;

createUser(user.id);

const inventory =
economy[user.id].inventory;

const embed = new EmbedBuilder()
.setColor("#FEE75C")
.setAuthor({
name: `${user.username}'s Inventory`,
iconURL: user.displayAvatarURL()
})
.setThumbnail(user.displayAvatarURL())
.setDescription(
inventory.length
? inventory.join("\n")
: "📦 Inventory is empty"
)
.addFields({
name: "Items",
value: `${inventory.length}`,
inline: true
})
.setFooter({
text: "BloxDen Economy Inventory"
})
.setTimestamp();

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* PROFILE */
/* ========================= */

if (interaction.commandName === "profile") {

const user =
interaction.options.getUser("user") ||
interaction.user;

createUser(user.id);

const data = economy[user.id];

const embed = new EmbedBuilder()
.setColor("#5865F2")
.setAuthor({
name: `${user.username}'s Economy Profile`,
iconURL: user.displayAvatarURL()
})
.setThumbnail(user.displayAvatarURL())
.addFields(
{
name: "🪙 Wallet",
value: `**${formatCoins(data.coins)}**`,
inline: true
},
{
name: "💼 Job",
value: data.job
? jobs[data.job].name
: "Unemployed",
inline: true
},
{
name: "🔥 Daily Streak",
value: `**${data.dailyStreak} Days**`,
inline: true
},
{
name: "📦 Inventory",
value: `**${data.inventory.length} Items**`,
inline: true
},
{
name: "🏦 Status",
value:
data.coins >= 1000000
? "🏆 BloxDen God"
: data.coins >= 250000
? "💠 Elite"
: data.coins >= 100000
? "🔥 Mythic"
: data.coins >= 50000
? "🌟 Legend"
: "👤 Member",
inline: true
},
{
name: "📈 Wealth Progress",
value:
`${"🟩".repeat(
Math.min(
10,
Math.floor(data.coins / 100000)
)
)}${"⬜".repeat(
10 -
Math.min(
10,
Math.floor(data.coins / 100000)
)
)}`,
inline: false
}
)
.setFooter({
text: "BloxDen Economy Profile"
})
.setTimestamp();

return interaction.reply({
embeds: [embed]
});

}

/* ========================= */
/* BLACKJACK */
/* ========================= */

if (interaction.commandName === "blackjack") {

  const bet =
    interaction.options.getInteger("bet");

  createUser(interaction.user.id);

  if (!bet || bet <= 0) {

    return interaction.reply({
      embeds: [
        createEmbed(
          interaction,
          "❌ Invalid Bet",
          "Bet amount must be greater than 0.",
          "#ED4245"
        )
      ]
    });

  }

  if (
    economy[interaction.user.id].coins < bet
  ) {

    return interaction.reply({
      embeds: [
        createEmbed(
          interaction,
          "❌ Not Enough Coins",
          `You need **${formatCoins(bet)} 🪙** to play Blackjack.`,
          "#ED4245"
        )
      ]
    });

  }

  const player =
    Math.floor(Math.random() * 11) + 10;

  const dealer =
    Math.floor(Math.random() * 11) + 10;

  const win =
    player > dealer &&
    player <= 21;

  if (win) {

    economy[interaction.user.id].coins += bet;

  } else {

    economy[interaction.user.id].coins -= bet;

  }

  saveData();

  const embed = new EmbedBuilder()
    .setColor(
      win
        ? "#57F287"
        : "#ED4245"
    )
    .setAuthor({
      name: `${interaction.user.username} • Blackjack`,
      iconURL:
        interaction.user.displayAvatarURL()
    })
    .setTitle(
      win
        ? "🃏 Blackjack Victory"
        : "💀 Blackjack Defeat"
    )
    .setThumbnail(
      interaction.user.displayAvatarURL()
    )
    .addFields(
      {
        name: "🧑 Your Hand",
        value: `${player}`,
        inline: true
      },
      {
        name: "🤖 Dealer Hand",
        value: `${dealer}`,
        inline: true
      },
      {
        name: "🎲 Bet Amount",
        value: `${formatCoins(bet)} 🪙`,
        inline: true
      },
      {
        name: win
          ? "🎉 Profit"
          : "💸 Loss",
        value: `${formatCoins(bet)} 🪙`,
        inline: false
      },
      {
        name: "💰 New Balance",
        value: `${formatCoins(
          economy[interaction.user.id].coins
        )} 🪙`,
        inline: false
      }
    )
    .setFooter({
      text: "BloxDen Economy • Blackjack"
    })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed]
  });

}

/* ========================= */
/* MINES */
/* ========================= */

if (interaction.commandName === "mines") {

const bet =
interaction.options.getInteger("bet");

createUser(interaction.user.id);

if (
economy[
interaction.user.id
].coins < bet
) {

return interaction.reply(
"❌ Not enough coins"
);

}

const win =
Math.random() < 0.4;

if (win) {

  const reward = bet * 2;

  economy[interaction.user.id].coins += reward;

  saveData();

  const embed = createEmbed(
    interaction,
    "💣 Mines Victory",
    `🎉 Won **${formatCoins(reward)} 🪙**`,
    "#57F287"
  );

  return interaction.reply({
    embeds: [embed]
  });

} else {

  economy[interaction.user.id].coins -= bet;

  saveData();

  const embed = createEmbed(
    interaction,
    "💥 BOOM!",
    `❌ Lost **${formatCoins(bet)} 🪙**`,
    "#ED4245"
  );

  return interaction.reply({
    embeds: [embed]
  });

}
