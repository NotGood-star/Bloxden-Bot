client.on("interactionCreate", async interaction => {

try {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "ping") {

await interaction.reply("🏓 Pong!");

}

else if (interaction.commandName === "help") {

await interaction.reply(`
📜 BloxDen Commands

🎮 Fun:
/ping
/joke
/dice
/coinflip
/quote
/funfact

💰 Economy:
/balance
/daily
/pay

🏆 Levels:
/rank
/leaderboard

🎫 Tickets:
/ticket
/closeticket

📨 Invites:
/invite
/inviteleaderboard

💬 Messages:
/messages
/messageleaderboard

🎭 Roles:
/reactionrole
`);

}

else if (interaction.commandName === "funfact") {

const facts = [

"🤖 This Bot is Made by Not_Good 💻",
"🔥 Never Give Up Until You Win 🏆",
"⚡ This Bot is made in 2 Days 🚀",
"😵 Making Bot is frustrating 😂",
"📚 To Make Bot You must know Coding 👨‍💻"

];

const random =
facts[Math.floor(Math.random() * facts.length)];

await interaction.reply(random);

}

else if (interaction.commandName === "joke") {

const jokes = [
"😂 Discord mods never sleep.",
"🤣 Roblox lag again.",
"😂 Chicken crossed the road."
];

await interaction.reply(
jokes[Math.floor(Math.random() * jokes.length)]
);

}

else if (interaction.commandName === "dice") {

await interaction.reply(
`🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`
);

}

else if (interaction.commandName === "coinflip") {

await interaction.reply(
`🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}`
);

}

else if (interaction.commandName === "quote") {

const quotes = [
"🔥 Never give up.",
"🚀 Dream big.",
"💪 Stay strong."
];

await interaction.reply(
quotes[Math.floor(Math.random() * quotes.length)]
);

}

else if (interaction.commandName === "balance") {

const user =
interaction.options.getUser("user") ||
interaction.user;

if (!economy[user.id]) {
economy[user.id] = {
coins: 0
};
}

await interaction.reply(
`💰 ${user.username} has ${economy[user.id].coins} coins`
);

}

else if (interaction.commandName === "daily") {

if (!economy[interaction.user.id]) {
economy[interaction.user.id] = {
coins: 0
};
}

economy[interaction.user.id].coins += 500;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
"💰 You received 500 coins"
);

}

else if (interaction.commandName === "pay") {

const target =
interaction.options.getUser("user");

const amount =
interaction.options.getInteger("amount");

if (!economy[interaction.user.id]) {
economy[interaction.user.id] = {
coins: 0
};
}

if (!economy[target.id]) {
economy[target.id] = {
coins: 0
};
}

economy[interaction.user.id].coins -= amount;
economy[target.id].coins += amount;

fs.writeFileSync(
"economy.json",
JSON.stringify(economy, null, 2)
);

await interaction.reply(
`💸 Sent ${amount} coins`
);

}

else if (interaction.commandName === "rank") {

if (!levels[interaction.user.id]) {
levels[interaction.user.id] = {
xp: 0,
level: 1
};
}

await interaction.reply(
`🏆 Level ${levels[interaction.user.id].level}\n⭐ XP ${levels[interaction.user.id].xp}`
);

}

else if (interaction.commandName === "leaderboard") {

const sorted =
Object.entries(levels)
.sort((a,b) => b[1].level - a[1].level)
.slice(0,10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i+1}. ${user.username} — Level ${sorted[i][1].level}\n`;

}

await interaction.reply(
`🏆 Leaderboard\n\n${text || "No data"}`
);

}

else if (interaction.commandName === "ticket") {

const ticket =
await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,
type: ChannelType.GuildText
});

await ticket.permissionOverwrites.create(
interaction.guild.roles.everyone,
{
ViewChannel: false
}
);

await ticket.permissionOverwrites.create(
interaction.user.id,
{
ViewChannel: true,
SendMessages: true
}
);

await ticket.send(
`🎫 Welcome ${interaction.user}`
);

await interaction.reply({
content: `✅ Ticket created: ${ticket}`,
ephemeral: true
});

}

else if (interaction.commandName === "closeticket") {

await interaction.reply("🔒 Closing ticket...");

setTimeout(() => {
interaction.channel.delete();
}, 3000);

}

else if (interaction.commandName === "invite") {

const user =
interaction.options.getUser("user") ||
interaction.user;

if (!invites[user.id]) {
invites[user.id] = 0;
}

await interaction.reply(
`📨 ${user.username} has ${invites[user.id]} invites`
);

}

else if (interaction.commandName === "inviteleaderboard") {

const sorted =
Object.entries(invites)
.sort((a,b) => b[1] - a[1])
.slice(0,10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i+1}. ${user.username} — ${sorted[i][1]} invites\n`;

}

await interaction.reply(
`🏆 Invite Leaderboard\n\n${text || "No data"}`
);

}

else if (interaction.commandName === "messages") {

const user =
interaction.options.getUser("user") ||
interaction.user;

if (!messages[user.id]) {
messages[user.id] = 0;
}

await interaction.reply(
`💬 ${user.username} has ${messages[user.id]} messages`
);

}

else if (interaction.commandName === "messageleaderboard") {

const sorted =
Object.entries(messages)
.sort((a,b) => b[1] - a[1])
.slice(0,10);

let text = "";

for (let i = 0; i < sorted.length; i++) {

const user =
await client.users.fetch(sorted[i][0]);

text += `${i+1}. ${user.username} — ${sorted[i][1]} messages\n`;

}

await interaction.reply(
`🏆 Message Leaderboard\n\n${text || "No data"}`
);

}

else if (interaction.commandName === "reactionrole") {

const role =
interaction.options.getRole("role");

const button =
new ButtonBuilder()
.setCustomId(`rr_${role.id}`)
.setLabel(`Get ${role.name}`)
.setStyle(ButtonStyle.Success);

const row =
new ActionRowBuilder()
.addComponents(button);

await interaction.reply({
content: "🎭 Click button for role",
components: [row]
});

}

}

else if (interaction.isButton()) {

if (interaction.customId.startsWith("rr_")) {

const roleId =
interaction.customId.replace("rr_", "");

const role =
interaction.guild.roles.cache.get(roleId);

if (interaction.member.roles.cache.has(role.id)) {

await interaction.member.roles.remove(role);

await interaction.reply({
content: `❌ Removed ${role.name}`,
ephemeral: true
});

} else {

await interaction.member.roles.add(role);

await interaction.reply({
content: `✅ Added ${role.name}`,
ephemeral: true
});

}

}

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

await interaction.reply({
content: "❌ Error occurred",
ephemeral: true
});

}

}

});
