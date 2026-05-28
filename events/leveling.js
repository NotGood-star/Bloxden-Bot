const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let levels = {};

if (fs.existsSync("levels.json")) {

levels = JSON.parse(
fs.readFileSync("levels.json")
);

}

/* ========================= */
/* SAVE */
/* ========================= */

function saveData() {

fs.writeFileSync(
"levels.json",
JSON.stringify(levels, null, 2)
);

}

/* ========================= */
/* CREATE USER */
/* ========================= */

function createUser(id) {

if (!levels.users) {

levels.users = {};

}

if (!levels.users[id]) {

levels.users[id] = {
xp: 0,
level: 1
};

}

}

/* ========================= */
/* CREATE GUILD */
/* ========================= */

function createGuild(id) {

if (!levels.guilds) {

levels.guilds = {};

}

if (!levels.guilds[id]) {

levels.guilds[id] = {
levelChannel: null
};

}

}

/* ========================= */
/* MESSAGE XP */
/* ========================= */

client.on("messageCreate", async message => {

if (!message.guild) return;
if (message.author.bot) return;

createUser(message.author.id);
createGuild(message.guild.id);

const randomXP =
Math.floor(Math.random() * 15) + 5;

levels.users[message.author.id].xp +=
randomXP;

const neededXP =
levels.users[message.author.id].level * 100;

if (
levels.users[message.author.id].xp
>= neededXP
) {

levels.users[message.author.id].xp = 0;

levels.users[message.author.id].level++;

const level =
levels.users[message.author.id].level;

const channelId =
levels.guilds[message.guild.id]
.levelChannel;

const levelChannel =
message.guild.channels.cache.get(
channelId
);

if (levelChannel) {

levelChannel.send(
`🎉 ${message.author} leveled up to Level ${level} 🏆`
);

} else {

message.channel.send(
`🎉 ${message.author} leveled up to Level ${level} 🏆`
);

}

}

saveData();

});

/* ========================= */
/* COMMANDS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* RANK */
/* ========================= */

if (interaction.commandName === "rank") {

createUser(interaction.user.id);

const data =
levels.users[interaction.user.id];

return interaction.reply(
`🏆 ${interaction.user.username}'s Rank

⭐ XP: ${data.xp}
🎖 Level: ${data.level}`
);

}

/* ========================= */
/* LEADERBOARD */
/* ========================= */

if (interaction.commandName === "leaderboard") {

if (!levels.users) {

levels.users = {};

}

const sorted =
Object.entries(levels.users)
.sort((a, b) =>
b[1].level - a[1].level
)
.slice(0, 10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text +=
`${i + 1}. ${user.username} — Level ${sorted[i][1].level}\n`;

}

return interaction.reply(
`🏆 BloxDen Leaderboard\n\n${text || "No data"}`
);

}

/* ========================= */
/* SET LEVEL CHANNEL */
/* ========================= */

if (interaction.commandName === "setlevelchannel") {

if (
!interaction.member.permissions.has(
"Administrator"
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

const channel =
interaction.options.getChannel("channel");

createGuild(interaction.guild.id);

levels.guilds[
interaction.guild.id
].levelChannel = channel.id;

saveData();

return interaction.reply(
`✅ Level channel set to ${channel}`
);

}

/* ========================= */
/* XP ADD */
/* ========================= */

if (interaction.commandName === "xpadd") {

if (
!interaction.member.permissions.has(
"Administrator"
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

const user =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

createUser(user.id);

levels.users[user.id].xp += amount;

saveData();

return interaction.reply(
`✅ Added ${amount} XP to ${user.username}`
);

}

/* ========================= */
/* XP REMOVE */
/* ========================= */

if (interaction.commandName === "xpremove") {

if (
!interaction.member.permissions.has(
"Administrator"
)
) {

return interaction.reply({
content:
"❌ You need Administrator permission",
ephemeral: true
});

}

const user =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

createUser(user.id);

levels.users[user.id].xp -= amount;

if (levels.users[user.id].xp < 0) {

levels.users[user.id].xp = 0;

}

saveData();

return interaction.reply(
`✅ Removed ${amount} XP from ${user.username}`
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ Level System Error",
ephemeral: true
});

}

}

});

};
