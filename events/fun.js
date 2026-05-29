module.exports = (client) => {

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* PING */
/* ========================= */

if (interaction.commandName === "ping") {

return interaction.reply(
`🏓 Pong! ${client.ws.ping}ms`
);

}

/* ========================= */
/* HELP */
/* ========================= */

if (interaction.commandName === "help") {

return interaction.reply(
`📜 BloxDen Commands

🎮 Fun
/ping
/help
/joke
/funfact
/dice
/coinflip
/quote

💰 Economy
/balance
/daily
/dailystreak
/beg
/crime
/workapply
/work
/rob
/shop
/buy
/inventory
/profile
/blackjack
/mines

🏆 Levels
/rank
/leaderboard
/setlevelchannel
/xpadd
/xpremove

🛡 Moderation
/ban
/kick
/timeout
/warn
/clear
/snipe

🎫 Tickets
/ticketpanel
/closeticket

🎉 Giveaway
/giveaway
/reroll
/endgiveaway

🤖 AutoMod
/automodsetchannel
/automodon
/automodoff

👋 Welcome
/welcomesetchannel
/goodbyesetchannel`
);

}

/* ========================= */
/* JOKE */
/* ========================= */

if (interaction.commandName === "joke") {

const jokes = [

"😂 Why did the developer go broke? Because he used up all his cache.",

"🤣 Discord mods never sleep.",

"😂 Roblox servers lag more than my brain during exams.",

"💀 Vornycs is richest person on Earth.",

"🤣 JavaScript developers hate bugs… unless it's a feature."

];

const joke =
jokes[Math.floor(Math.random() * jokes.length)];

return interaction.reply(joke);

}

/* ========================= */
/* FUN FACT */
/* ========================= */

if (interaction.commandName === "funfact") {

const facts = [

"🤖 This bot was made for BloxDen.",

"👑 Our Helping Team has 3 Members:\nOwner - Not_Good\nCo-Owner - Vornycs\nHelper - Zerphy",

"🚀 Discord bots are powered using APIs.",

"🔥 Coding becomes easier with practice.",

"💻 JavaScript is one of the most popular coding languages."

];

const fact =
facts[Math.floor(Math.random() * facts.length)];

return interaction.reply(fact);

}

/* ========================= */
/* DICE */
/* ========================= */

if (interaction.commandName === "dice") {

const number =
Math.floor(Math.random() * 6) + 1;

return interaction.reply(
`🎲 You rolled **${number}**`
);

}

/* ========================= */
/* COIN FLIP */
/* ========================= */

if (interaction.commandName === "coinflip") {

const result =
Math.random() < 0.5
? "Heads"
: "Tails";

return interaction.reply(
`🪙 Coin landed on **${result}**`
);

}

/* ========================= */
/* QUOTE */
/* ========================= */

if (interaction.commandName === "quote") {

const quotes = [

"🔥 Never give up.",

"🚀 Dream big and work hard.",

"💪 Success comes from consistency.",

"⚡ Small progress is still progress.",

"🏆 Winners never quit."

];

const quote =
quotes[Math.floor(Math.random() * quotes.length)];

return interaction.reply(
`📖 ${quote}`
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ Fun System Error",
ephemeral: true
});

}

}

});

};
