const fs = require("fs");

module.exports = (client) => {

let reputation = {};

if (fs.existsSync("reputation.json")) {

reputation = JSON.parse(
fs.readFileSync("reputation.json")
);

}

function saveData() {

fs.writeFileSync(
"reputation.json",
JSON.stringify(reputation, null, 2)
);

}

function createUser(id) {

if (!reputation[id]) {

reputation[id] = {

rep: 0,
lastRep: 0

};

}

}

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

try {

/* ========================= */
/* /REP */
/* ========================= */

if (interaction.commandName === "rep") {

const target =
interaction.options.getUser("user");

if (target.id === interaction.user.id) {

return interaction.reply({
content:
"❌ You cannot give reputation to yourself.",
ephemeral: true
});

}

createUser(interaction.user.id);
createUser(target.id);

const cooldown =
24 * 60 * 60 * 1000;

if (
Date.now() -
reputation[interaction.user.id].lastRep
<
cooldown
) {

const remaining =
cooldown -
(
Date.now() -
reputation[interaction.user.id].lastRep
);

const hours =
Math.floor(
remaining /
(1000 * 60 * 60)
);

const minutes =
Math.floor(
(remaining %
(1000 * 60 * 60))
/
(1000 * 60)
);

return interaction.reply({
content:
`⏳ You can give reputation again in ${hours}h ${minutes}m`,
ephemeral: true
});

}

reputation[target.id].rep += 1;

reputation[
interaction.user.id
].lastRep = Date.now();

saveData();

return interaction.reply(
`⭐ You gave **1 Reputation** to ${target}

🏆 Total Reputation:
${reputation[target.id].rep}`
);

}

/* ========================= */
/* /REPLEADERBOARD */
/* ========================= */

if (
interaction.commandName ===
"repleaderboard"
) {

const sorted =
Object.entries(reputation)
.sort(
(a, b) =>
b[1].rep - a[1].rep
)
.slice(0, 10);

let leaderboard = "";

for (
let i = 0;
i < sorted.length;
i++
) {

try {

const user =
await client.users.fetch(
sorted[i][0]
);

leaderboard +=
`${i + 1}. ${user.username} — ⭐ ${sorted[i][1].rep}\n`;

} catch {}

}

if (!leaderboard) {

leaderboard =
"No reputation data found.";

}

return interaction.reply(
`🏆 Reputation Leaderboard

${leaderboard}`
);

}

} catch (err) {

console.error(err);

if (!interaction.replied) {

interaction.reply({
content:
"❌ Reputation system error.",
ephemeral: true
});

}

}

});

};
