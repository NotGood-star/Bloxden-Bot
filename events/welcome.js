const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let welcomeData = {};

if (fs.existsSync("welcome.json")) {

welcomeData = JSON.parse(
fs.readFileSync("welcome.json")
);

}

/* ========================= */
/* SAVE */
/* ========================= */

function saveData() {

fs.writeFileSync(
"welcome.json",
JSON.stringify(welcomeData, null, 2)
);

}

/* ========================= */
/* CREATE GUILD */
/* ========================= */

function createGuild(id) {

if (!welcomeData[id]) {

welcomeData[id] = {
welcomeChannel: null,
goodbyeChannel: null
};

}

}

/* ========================= */
/* MEMBER JOIN */
/* ========================= */

client.on("guildMemberAdd", async member => {

createGuild(member.guild.id);

const channelId =
welcomeData[member.guild.id]
.welcomeChannel;

if (!channelId) return;

const channel =
member.guild.channels.cache.get(
channelId
);

if (!channel) return;

channel.send(
`👋 Welcome ${member} to **${member.guild.name}**!

🎉 Hope you enjoy your stay!
📜 Read the rules and have fun!`
);

});

/* ========================= */
/* MEMBER LEAVE */
/* ========================= */

client.on("guildMemberRemove", async member => {

createGuild(member.guild.id);

const channelId =
welcomeData[member.guild.id]
.goodbyeChannel;

if (!channelId) return;

const channel =
member.guild.channels.cache.get(
channelId
);

if (!channel) return;

channel.send(
`😢 Goodbye **${member.user.tag}**

💔 We hope to see you again someday!`
);

});

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* SET WELCOME CHANNEL */
/* ========================= */

if (
interaction.commandName ===
"welcomesetchannel"
) {

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
interaction.options.getChannel(
"channel"
);

createGuild(interaction.guild.id);

welcomeData[
interaction.guild.id
].welcomeChannel = channel.id;

saveData();

return interaction.reply(
`✅ Welcome channel set to ${channel}`
);

}

/* ========================= */
/* SET GOODBYE CHANNEL */
/* ========================= */

if (
interaction.commandName ===
"goodbyesetchannel"
) {

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
interaction.options.getChannel(
"channel"
);

createGuild(interaction.guild.id);

welcomeData[
interaction.guild.id
].goodbyeChannel = channel.id;

saveData();

return interaction.reply(
`✅ Goodbye channel set to ${channel}`
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ Welcome System Error",
ephemeral: true
});

}

}

});

};
