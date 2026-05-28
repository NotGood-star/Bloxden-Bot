const fs = require("fs");

module.exports = (client) => {

/* DATABASE */

let welcomeData = {};

if (fs.existsSync("welcome.json")) {

welcomeData = JSON.parse(
fs.readFileSync("welcome.json")
);

}

/* MEMBER JOIN */

client.on("guildMemberAdd", async member => {

const guildId = member.guild.id;

if (
!welcomeData[guildId] ||
!welcomeData[guildId].welcomeChannel
) return;

const channel =
member.guild.channels.cache.get(
welcomeData[guildId].welcomeChannel
);

if (!channel) return;

channel.send(
`🎉 Welcome ${member} to **${member.guild.name}**!

👋 Hope you enjoy your stay!
📜 Read the rules and have fun 🚀`
);

});

/* MEMBER LEAVE */

client.on("guildMemberRemove", async member => {

const guildId = member.guild.id;

if (
!welcomeData[guildId] ||
!welcomeData[guildId].goodbyeChannel
) return;

const channel =
member.guild.channels.cache.get(
welcomeData[guildId].goodbyeChannel
);

if (!channel) return;

channel.send(
`😢 ${member.user.username} left the server.

Goodbye 👋`
);

});

/* COMMANDS */

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* SET WELCOME CHANNEL */

if (
interaction.commandName === "welcomesetchannel"
) {

const channel =
interaction.options.getChannel("channel");

if (!welcomeData[interaction.guild.id]) {

welcomeData[interaction.guild.id] = {};

}

welcomeData[
interaction.guild.id
].welcomeChannel = channel.id;

fs.writeFileSync(
"welcome.json",
JSON.stringify(welcomeData, null, 2)
);

return interaction.reply(
`✅ Welcome channel set to ${channel}`
);

}

/* SET GOODBYE CHANNEL */

if (
interaction.commandName === "goodbyesetchannel"
) {

const channel =
interaction.options.getChannel("channel");

if (!welcomeData[interaction.guild.id]) {

welcomeData[interaction.guild.id] = {};

}

welcomeData[
interaction.guild.id
].goodbyeChannel = channel.id;

fs.writeFileSync(
"welcome.json",
JSON.stringify(welcomeData, null, 2)
);

return interaction.reply(
`✅ Goodbye channel set to ${channel}`
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content: "❌ Welcome System Error",
ephemeral: true
});

}

}

});

};
