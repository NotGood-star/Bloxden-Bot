   const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let data = {
    users: {},
    guilds: {}
};

if (fs.existsSync("levels.json")) {
    data = JSON.parse(fs.readFileSync("levels.json"));
}

/* ========================= */
/* SAVE SYSTEM */
/* ========================= */

let saving = false;

function saveData() {
    if (saving) return;

    saving = true;

    setTimeout(() => {
        fs.writeFileSync("levels.json", JSON.stringify(data, null, 2));
        saving = false;
    }, 3000);
}

/* ========================= */
/* HELPERS */
/* ========================= */

function createUser(guildId, userId) {
    if (!data.users[guildId]) data.users[guildId] = {};
    if (!data.users[guildId][userId]) {
        data.users[guildId][userId] = {
            xp: 0,
            level: 1,
            lastMessage: 0
        };
    }
}

function createGuild(guildId) {
    if (!data.guilds[guildId]) {
        data.guilds[guildId] = {
            levelChannel: null
        };
    }
}

function neededXP(level) {
    return level * 100;
}

/* ========================= */
/* MESSAGE XP SYSTEM */
/* ========================= */

client.on("messageCreate", (message) => {

if (!message.guild || message.author.bot) return;

const guildId = message.guild.id;
const userId = message.author.id;

createUser(guildId, userId);
createGuild(guildId);

const user = data.users[guildId][userId];
const guild = data.guilds[guildId];

/* COOLDOWN */
const now = Date.now();
if (now - user.lastMessage < 60000) return;

user.lastMessage = now;

/* XP GAIN */
const xpGain = Math.floor(Math.random() * 15) + 5;
user.xp += xpGain;

/* LEVEL UP */
const req = neededXP(user.level);

if (user.xp >= req) {

user.level++;
user.xp = 0;

const embed = {
title: "🎉 Level Up!",
description: `<@${userId}> reached **Level ${user.level}**`,
color: 0x2ecc71,
timestamp: new Date()
};

const channel = message.guild.channels.cache.get(guild.levelChannel);

if (channel) {
channel.send({ embeds: [embed] });
} else {
message.channel.send({ embeds: [embed] });
}

}

saveData();

});

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async (interaction) => {

if (!interaction.isChatInputCommand()) return;

const guildId = interaction.guild.id;
const userId = interaction.user.id;

createUser(guildId, userId);
createGuild(guildId);

const user = data.users[guildId][userId];
const guild = data.guilds[guildId];

try {

/* ========================= */
/* /rank */
/* ========================= */

if (interaction.commandName === "rank") {

const needed = neededXP(user.level);

return interaction.reply({
embeds: [{
title: `${interaction.user.username}'s Rank`,
color: 0x3498db,
thumbnail: {
url: interaction.user.displayAvatarURL()
},
fields: [
{ name: "🎖 Level", value: `${user.level}`, inline: true },
{ name: "⭐ XP", value: `${user.xp}`, inline: true },
{ name: "📈 Needed XP", value: `${needed}`, inline: true }
],
timestamp: new Date()
}]
});

}

/* ========================= */
/* /leaderboard */
/* ========================= */

if (interaction.commandName === "leaderboard") {

const guildUsers = data.users[guildId] || {};

const sorted = Object.entries(guildUsers)
.sort((a, b) => b[1].level - a[1].level)
.slice(0, 10);

let desc = "";

for (let i = 0; i < sorted.length; i++) {

let name = "Unknown";

try {
const u = await client.users.fetch(sorted[i][0]);
name = u.username;
} catch {}

desc += `**${i + 1}.** ${name} — Level ${sorted[i][1].level}\n`;
}

return interaction.reply({
embeds: [{
title: "🏆 Leaderboard",
description: desc || "No data available",
color: 0xf1c40f
}]
});

}

/* ========================= */
/* /setlevelchannel */
/* ========================= */

if (interaction.commandName === "setlevelchannel") {

if (!interaction.member.permissions.has("Administrator")) {
return interaction.reply({
content: "❌ Admin permission required",
ephemeral: true
});
}

const channel = interaction.options.getChannel("channel");

guild.levelChannel = channel.id;

saveData();

return interaction.reply({
embeds: [{
title: "✅ Level Channel Set",
description: `Level-up messages will be sent in ${channel}`,
color: 0x00ff99
}]
});

}

/* ========================= */
/* /xpadd */
/* ========================= */

if (interaction.commandName === "xpadd") {

if (!interaction.member.permissions.has("Administrator")) {
return interaction.reply({
content: "❌ Admin permission required",
ephemeral: true
});
}

const target = interaction.options.getUser("user");
const amount = interaction.options.getInteger("amount");

createUser(guildId, target.id);

data.users[guildId][target.id].xp += amount;

saveData();

return interaction.reply({
embeds: [{
title: "➕ XP Added",
description: `Added **${amount} XP** to ${target}`,
color: 0x2ecc71
}]
});

}

/* ========================= */
/* /xpremove */
/* ========================= */

if (interaction.commandName === "xpremove") {

if (!interaction.member.permissions.has("Administrator")) {
return interaction.reply({
content: "❌ Admin permission required",
ephemeral: true
});
}

const target = interaction.options.getUser("user");
const amount = interaction.options.getInteger("amount");

createUser(guildId, target.id);

data.users[guildId][target.id].xp -= amount;

if (data.users[guildId][target.id].xp < 0) {
data.users[guildId][target.id].xp = 0;
}

saveData();

return interaction.reply({
embeds: [{
title: "➖ XP Removed",
description: `Removed **${amount} XP** from ${target}`,
color: 0xe74c3c
}]
});

}

} catch (err) {
console.error("LEVEL SYSTEM ERROR:", err);

return interaction.reply({
content: "❌ Level system error occurred (check console)",
ephemeral: true
});
}

});

};
