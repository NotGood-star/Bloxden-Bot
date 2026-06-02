const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

const jokes = [
  "😂 Vornycs is the richest person in the world... according to Vornycs.",
  "✈️ Zerphy wants to fly but forgot airplanes exist.",
  "🤣 Shido tried to catch WiFi with a fishing rod.",
  "😂 Lucky installed more RAM in a calculator.",
  "🤖 Not_Good fixed a bug by creating three more bugs.",
  "🤣 Vornycs bought air because it was on sale.",
  "😂 Zerphy opened a door marked 'Pull' by pushing for 10 minutes.",
  "🤣 Lucky challenged a bot to a staring contest and lost.",
  "😂 Shido searched 'How to search on Google' on Google.",
  "🤣 Vornycs invested in invisible NFTs.",
  "😂 Zerphy thought cloud storage was keeping files in the sky.",
  "🤣 Lucky downloaded more FPS.",
  "😂 Shido tried charging his phone with a potato.",
  "🤣 Vornycs tried mining diamonds in Minecraft for real money.",
  "😂 Zerphy thought Java and JavaScript were the same thing.",
  "🤣 Lucky tried to pause an online game by pressing ESC.",
  "😂 Shido joined a race and forgot to start running.",
  "🤣 Vornycs bought a gaming chair for his cat.",
  "😂 Zerphy tried turning off the internet to fix lag.",
  "🤣 Not_Good said 'one last update' 27 updates ago."
];

const quotes = [
  "💡 Honesty is the best policy.",
  "🌟 Success comes to those who work for it.",
  "🔥 Dreams don't work unless you do.",
  "💪 Hard work beats talent when talent doesn't work hard.",
  "🚀 Great things take time.",
  "🌈 Every day is a new opportunity.",
  "🎯 Stay focused and never give up.",
  "📚 Learning never exhausts the mind.",
  "💎 Small progress is still progress.",
  "🌱 Growth begins outside your comfort zone.",
  "⚡ Action is the foundation of success.",
  "🏆 Winners never quit.",
  "🧠 Knowledge is power.",
  "🌍 Make today count.",
  "⭐ Believe in yourself.",
  "🎨 Creativity is intelligence having fun.",
  "🔑 Discipline creates freedom.",
  "🚶 A journey begins with a single step.",
  "💖 Kindness costs nothing.",
  "📈 Consistency is the key to success."
];

const funFacts = [
  "🤖 This bot is officially made by Not_Good.",
  "👑 Bot Owner: Not_Good.",
  "⚡ Co-Owner: Vornycs.",
  "⚡ Co-Owner: Zerphy.",
  "🛡️ Moderator: Shido.",
  "🛡️ Moderator: Lucky.",
  "🎮 Roblox was released in 2006.",
  "🧱 Roblox was originally called DynaBlocks.",
  "🌎 Millions of players use Roblox daily.",
  "💰 Robux is Roblox's virtual currency.",
  "🎨 Roblox Studio is used to create games.",
  "🏗️ Anyone can create a Roblox game.",
  "🚀 Some Roblox developers earn real money.",
  "🤖 BloxDen Bot has economy commands.",
  "💸 You can earn coins using /daily.",
  "💼 Jobs help you earn more money.",
  "🛒 The shop contains exclusive items.",
  "🏆 BloxDen God costs 1,000,000 coins.",
  "🎲 Blackjack is a luck-based game.",
  "💣 Mines can double your bet.",
  "🔫 Robbing has a chance to fail.",
  "🔥 Daily streaks increase over time.",
  "📦 Inventory stores purchased items.",
  "💎 VIP is the cheapest shop role.",
  "⚔️ Economy games make servers more fun."
];

function createEmbed(interaction, title, description, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: `${interaction.user.username} • BloxDen Fun`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp();
}

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

/* PING */

if (interaction.commandName === "ping") {

return interaction.reply({
embeds: [
createEmbed(
interaction,
"🏓 Pong!",
`Bot Ping: **${client.ws.ping}ms**`,
"#57F287"
)
]
});

}

/* HELP */

if (interaction.commandName === "help") {

return interaction.reply({
embeds: [
createEmbed(
interaction,
"📖 Help Menu",
`
🏓 /ping
😂 /joke
💡 /quote
🧠 /funfact
🪙 /coinflip
🎲 /dice
📖 /help
`,
"#5865F2"
)
]
});

}

/* JOKE */

if (interaction.commandName === "joke") {

const joke =
jokes[Math.floor(Math.random() * jokes.length)];

return interaction.reply({
embeds: [
createEmbed(
interaction,
"😂 Random Joke",
joke,
"#FEE75C"
)
]
});

}

/* QUOTE */

if (interaction.commandName === "quote") {

const quote =
quotes[Math.floor(Math.random() * quotes.length)];

return interaction.reply({
embeds: [
createEmbed(
interaction,
"💡 Inspirational Quote",
quote,
"#57F287"
)
]
});

}

/* FUNFACT */

if (interaction.commandName === "funfact") {

const fact =
funFacts[Math.floor(Math.random() * funFacts.length)];

return interaction.reply({
embeds: [
createEmbed(
interaction,
"🧠 Fun Fact",
fact,
"#5865F2"
)
]
});

}

/* COINFLIP */

if (interaction.commandName === "coinflip") {

const result =
Math.random() < 0.5
? "🪙 Heads"
: "🪙 Tails";

return interaction.reply({
embeds: [
createEmbed(
interaction,
"🪙 Coin Flip",
result,
"#FEE75C"
)
]
});

}

/* DICE */

if (interaction.commandName === "dice") {

const roll =
Math.floor(Math.random() * 6) + 1;

return interaction.reply({
embeds: [
createEmbed(
interaction,
"🎲 Dice Roll",
`You rolled **${roll}**`,
"#FEE75C"
)
]
});

}

});

};
