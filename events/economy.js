const fs = require("fs");

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

/* ========================= */
/* CREATE USER */
/* ========================= */

function createUser(id) {
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

return interaction.reply(
`🪙 ${user.username} has **${economy[user.id].coins}** coins`
);

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

return interaction.reply(
`🎁 You received 1000 🪙

🔥 Daily Streak:
${user.dailyStreak}`
);

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

return interaction.reply(
`🙏 Someone gave you **${amount} 🪙**`
);

}

/* ========================= */
/* CRIME */
/* ========================= */

if (interaction.commandName === "crime") {

createUser(interaction.user.id);

const cooldown = 5 * 60 * 1000; // 5 minutes

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

const success =
Math.random() < 0.5;

if (success) {

const amount =
Math.floor(Math.random() * 2000) + 500;

economy[
interaction.user.id
].coins += amount;

saveData();

return interaction.reply(
`🚔 Crime successful

💰 Earned:
${amount} 🪙`
);

} else {

const amount =
Math.floor(Math.random() * 1000) + 200;

economy[
interaction.user.id
].coins -= amount;

saveData();

return interaction.reply(
`❌ You got caught

💸 Lost:
${amount} 🪙`
);

}

}

/* ========================= */
/* WORK APPLY */
/* ========================= */

if (
interaction.commandName ===
"workapply"
) {

const job =
interaction.options.getString("job");

createUser(interaction.user.id);

if (!jobs[job]) {

return interaction.reply(
"❌ Invalid job"
);

}

economy[
interaction.user.id
].job = job;

saveData();

return interaction.reply(
`💼 You are now working as ${jobs[job].name}`
);

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

return interaction.reply(
`💼 You worked as ${jobs[user.job].name}

💰 Earned:
${salary} 🪙`
);

}

/* ========================= */
/* ROB */
/* ========================= */

if (interaction.commandName === "rob") {

createUser(interaction.user.id);

const cooldown = 30 * 60 * 1000; // 30 minutes

if (
Date.now() -
economy[interaction.user.id].lastRob <
cooldown
) {

return interaction.reply({
content:
"⏳ You must wait 30 minutes before robbing again.",
ephemeral: true
});

}

economy[interaction.user.id].lastRob =
Date.now();

const target =
interaction.options.getUser("user");

if (target.id === interaction.user.id) {

return interaction.reply(
"❌ You can't rob yourself"
);

}

createUser(target.id);

if (
economy[target.id].coins < 500
) {

return interaction.reply(
"❌ User has low coins"
);

}

const success =
Math.random() < 0.5;

if (success) {

const amount =
Math.floor(Math.random() * 1000) + 200;

economy[interaction.user.id].coins += amount;
economy[target.id].coins -= amount;

saveData();

return interaction.reply(
`🔫 You robbed ${target}

💰 Stole: ${amount} 🪙`
);

}

return interaction.reply(
"🚔 Rob failed"
);

}

/* ========================= */
/* PAY */
/* ========================= */

if (interaction.commandName === "pay") {

const target =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

createUser(interaction.user.id);
createUser(target.id);

if (
economy[
interaction.user.id
].coins < amount
) {

return interaction.reply(
"❌ Not enough coins"
);

}

economy[
interaction.user.id
].coins -= amount;

economy[
target.id
].coins += amount;

saveData();

return interaction.reply(
`💸 Sent ${amount} 🪙 to ${target}`
);

}

/* ========================= */
/* SHOP */
/* ========================= */

if (interaction.commandName === "shop") {

return interaction.reply(
`🛒 BloxDen Shop

💎 VIP Role — 5,000 🪙
🛒 Merchant Role — 10,000 🪙
👑 King Role — 25,000 🪙
🚀 Boost Role — 30,000 🪙
🌟 Legend Role — 50,000 🪙
🔥 Mythic Role — 100,000 🪙
💠 Elite Role — 250,000 🪙
🏆 BloxDen God — 1,000,000 🪙`
);

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

return interaction.reply(
`🛒 Purchased ${data.name}

💸 Spent:
${data.price} 🪙`
);

}

/* ========================= */
/* INVENTORY */
/* ========================= */

if (
interaction.commandName ===
"inventory"
) {

const user =
interaction.options.getUser("user") ||
interaction.user;

createUser(user.id);

const inventory =
economy[user.id].inventory;

return interaction.reply(
`📦 Inventory of ${user.username}

${inventory.length
? inventory.join("\n")
: "Empty"}`
);

}

/* ========================= */
/* PROFILE */
/* ========================= */

if (interaction.commandName === "profile") {

const user =
interaction.options.getUser("user") ||
interaction.user;

createUser(user.id);

const data =
economy[user.id];

return interaction.reply(
`👤 Profile of ${user.username}

🪙 Coins:
${data.coins}

💼 Job:
${data.job
? jobs[data.job].name
: "None"}

📦 Inventory:
${data.inventory.length}

🔥 Daily Streak:
${data.dailyStreak}`
);

}

/* ========================= */
/* BLACKJACK */
/* ========================= */

if (interaction.commandName === "blackjack") {

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

const player =
Math.floor(Math.random() * 11) + 10;

const bot =
Math.floor(Math.random() * 11) + 10;

if (
player > bot &&
player <= 21
) {

economy[
interaction.user.id
].coins += bet;

saveData();

return interaction.reply(
`🃏 Your Total: ${player}

🤖 Bot Total: ${bot}

🎉 You won ${bet} 🪙`
);

} else {

economy[
interaction.user.id
].coins -= bet;

saveData();

return interaction.reply(
`🃏 Your Total: ${player}

🤖 Bot Total: ${bot}

💀 You lost ${bet} 🪙`
);

}

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

const reward =
bet * 2;

economy[
interaction.user.id
].coins += reward;

saveData();

return interaction.reply(
`💣 You survived the mines!

🎉 Won ${reward} 🪙`
);

} else {

economy[
interaction.user.id
].coins -= bet;

saveData();

return interaction.reply(
`💥 BOOM!

❌ Lost ${bet} 🪙`
);

}

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ Economy Error",
ephemeral: true
});

}

}

});

};
