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

merchant: {
name: "🛒 Merchant Role",
price: 10000
},

vip: {
name: "💎 VIP Role",
price: 5000
},

king: {
name: "👑 King Role",
price: 25000
}

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

if (!economy[id]) {

economy[id] = {
coins: 0,
inventory: [],
lastDaily: 0,
streak: 0,
job: "Unemployed"
};

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
`💰 ${user.username} has ${economy[user.id].coins} coins`
);

}

/* ========================= */
/* DAILY */
/* ========================= */

if (interaction.commandName === "daily") {

createUser(interaction.user.id);

const now = Date.now();

if (
now - economy[interaction.user.id].lastDaily
< 86400000
) {

return interaction.reply({
content:
"⏰ You already claimed daily reward!",
ephemeral: true
});

}

economy[interaction.user.id].coins += 500;

economy[interaction.user.id].lastDaily =
now;

economy[interaction.user.id].streak += 1;

saveData();

return interaction.reply(
`💰 You received 500 coins!\n🔥 Daily Streak: ${economy[interaction.user.id].streak}`
);

}

/* ========================= */
/* DAILY STREAK */
/* ========================= */

if (interaction.commandName === "dailystreak") {

createUser(interaction.user.id);

return interaction.reply(
`🔥 Your Daily Streak: ${economy[interaction.user.id].streak}`
);

}

/* ========================= */
/* BEG */
/* ========================= */

if (interaction.commandName === "beg") {

createUser(interaction.user.id);

const amount =
Math.floor(Math.random() * 300) + 1;

economy[interaction.user.id].coins += amount;

saveData();

return interaction.reply(
`🙏 Someone gave you ${amount} coins`
);

}

/* ========================= */
/* CRIME */
/* ========================= */

if (interaction.commandName === "crime") {

createUser(interaction.user.id);

const success =
Math.random() < 0.5;

if (success) {

const amount =
Math.floor(Math.random() * 1000) + 100;

economy[interaction.user.id].coins += amount;

saveData();

return interaction.reply(
`🚔 Crime successful!\n💰 You stole ${amount} coins`
);

} else {

const loss =
Math.floor(Math.random() * 500) + 50;

economy[interaction.user.id].coins -= loss;

if (economy[interaction.user.id].coins < 0) {

economy[interaction.user.id].coins = 0;

}

saveData();

return interaction.reply(
`🚨 You got caught!\n💸 Lost ${loss} coins`
);

}

}

/* ========================= */
/* WORK APPLY */
/* ========================= */

if (interaction.commandName === "workapply") {

const jobs = [
"👨‍💻 Developer",
"🍕 Pizza Delivery",
"🛠 Mechanic",
"🎨 Designer"
];

createUser(interaction.user.id);

const job =
jobs[Math.floor(Math.random() * jobs.length)];

economy[interaction.user.id].job = job;

saveData();

return interaction.reply(
`✅ You are now working as ${job}`
);

}

/* ========================= */
/* WORK */
/* ========================= */

if (interaction.commandName === "work") {

createUser(interaction.user.id);

const amount =
Math.floor(Math.random() * 700) + 100;

economy[interaction.user.id].coins += amount;

saveData();

return interaction.reply(
`💼 You worked as ${economy[interaction.user.id].job}\n💰 Earned ${amount} coins`
);

}

/* ========================= */
/* ROB */
/* ========================= */

if (interaction.commandName === "rob") {

const target =
interaction.options.getUser("user");

if (target.id === interaction.user.id) {

return interaction.reply(
"❌ You cannot rob yourself"
);

}

createUser(interaction.user.id);
createUser(target.id);

const success =
Math.random() < 0.5;

if (success) {

const amount =
Math.floor(Math.random() * 1000) + 100;

if (economy[target.id].coins < amount) {

return interaction.reply(
"❌ User does not have enough coins"
);

}

economy[target.id].coins -= amount;

economy[interaction.user.id].coins += amount;

saveData();

return interaction.reply(
`🔫 You robbed ${target.username} and stole ${amount} coins`
);

} else {

return interaction.reply(
`🚔 You failed to rob ${target.username}`
);

}

}

/* ========================= */
/* SHOP */
/* ========================= */

if (interaction.commandName === "shop") {

let text = "🛒 BloxDen Shop\n\n";

for (const item in shopItems) {

text +=
`${shopItems[item].name} — ${shopItems[item].price} coins\n`;

}

return interaction.reply(text);

}

/* ========================= */
/* BUY */
/* ========================= */

if (interaction.commandName === "buy") {

const item =
interaction.options.getString("item");

createUser(interaction.user.id);

if (!shopItems[item]) {

return interaction.reply(
"❌ Item not found"
);

}

if (
economy[interaction.user.id].coins
< shopItems[item].price
) {

return interaction.reply(
"❌ Not enough coins"
);

}

economy[interaction.user.id].coins -=
shopItems[item].price;

economy[interaction.user.id].inventory.push(
shopItems[item].name
);

saveData();

return interaction.reply(
`✅ Purchased ${shopItems[item].name}`
);

}

/* ========================= */
/* INVENTORY */
/* ========================= */

if (interaction.commandName === "inventory") {

createUser(interaction.user.id);

const inventory =
economy[interaction.user.id].inventory;

return interaction.reply(
`🎒 Inventory:\n${inventory.join("\n") || "Empty"}`
);

}

/* ========================= */
/* PROFILE */
/* ========================= */

if (interaction.commandName === "profile") {

createUser(interaction.user.id);

return interaction.reply(
`👤 Profile of ${interaction.user.username}

💰 Coins: ${economy[interaction.user.id].coins}
💼 Job: ${economy[interaction.user.id].job}
🔥 Daily Streak: ${economy[interaction.user.id].streak}
🎒 Inventory Items: ${economy[interaction.user.id].inventory.length}`
);

}

/* ========================= */
/* BLACKJACK */
/* ========================= */

if (interaction.commandName === "blackjack") {

createUser(interaction.user.id);

const win =
Math.random() < 0.5;

const amount =
Math.floor(Math.random() * 1000) + 100;

if (win) {

economy[interaction.user.id].coins += amount;

saveData();

return interaction.reply(
`🃏 You won Blackjack!\n💰 Won ${amount} coins`
);

} else {

economy[interaction.user.id].coins -= amount;

if (economy[interaction.user.id].coins < 0) {

economy[interaction.user.id].coins = 0;

}

saveData();

return interaction.reply(
`💀 You lost Blackjack!\n💸 Lost ${amount} coins`
);

}

}

/* ========================= */
/* MINES */
/* ========================= */

if (interaction.commandName === "mines") {

createUser(interaction.user.id);

const win =
Math.random() < 0.5;

const amount =
Math.floor(Math.random() * 2000) + 100;

if (win) {

economy[interaction.user.id].coins += amount;

saveData();

return interaction.reply(
`💣 You survived the mines!\n💰 Won ${amount} coins`
);

} else {

economy[interaction.user.id].coins -= amount;

if (economy[interaction.user.id].coins < 0) {

economy[interaction.user.id].coins = 0;

}

saveData();

return interaction.reply(
`💥 BOOM! You hit a mine.\n💸 Lost ${amount} coins`
);

}

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ Economy Error",
ephemeral: true
});

}

}

});

};
