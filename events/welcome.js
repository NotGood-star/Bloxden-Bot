module.exports = (client) => {

client.on("guildMemberAdd", async member => {

const channel =
member.guild.channels.cache.find(
c => c.name === "welcome"
);

if (!channel) return;

channel.send(
`🎉 Welcome ${member} to **${member.guild.name}** 💚`
);

});

client.on("guildMemberRemove", async member => {

const channel =
member.guild.channels.cache.find(
c => c.name === "goodbye"
);

if (!channel) return;

channel.send(
`😢 Goodbye ${member.user.username} 👋`
);

});

};
