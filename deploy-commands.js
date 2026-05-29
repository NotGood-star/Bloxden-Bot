const {
REST,
Routes,
SlashCommandBuilder,
PermissionFlagsBits
} = require("discord.js");

require("dotenv").config();

/* ========================= */
/* ALL COMMANDS */
/* ========================= */

const commands = [

/* ========================= */
/* FUN */
/* ========================= */

new SlashCommandBuilder()
.setName("ping")
.setDescription("Show bot ping"),

new SlashCommandBuilder()
.setName("help")
.setDescription("Show all commands"),

new SlashCommandBuilder()
.setName("joke")
.setDescription("Get a random joke"),

new SlashCommandBuilder()
.setName("funfact")
.setDescription("Get a random fun fact"),

new SlashCommandBuilder()
.setName("dice")
.setDescription("Roll a dice"),

new SlashCommandBuilder()
.setName("coinflip")
.setDescription("Flip a coin"),

new SlashCommandBuilder()
.setName("quote")
.setDescription("Get a random quote"),

/* ========================= */
/* ECONOMY */
/* ========================= */

new SlashCommandBuilder()
.setName("balance")
.setDescription("Check balance")
.addUserOption(option =>
option
.setName("user")
.setDescription("Select user")
),

new SlashCommandBuilder()
.setName("daily")
.setDescription("Claim daily reward"),

new SlashCommandBuilder()
.setName("dailystreak")
.setDescription("Check daily streak"),

new SlashCommandBuilder()
.setName("beg")
.setDescription("Beg for coins"),

new SlashCommandBuilder()
.setName("crime")
.setDescription("Commit a crime"),

new SlashCommandBuilder()
.setName("workapply")
.setDescription("Apply for a job"),

new SlashCommandBuilder()
.setName("work")
.setDescription("Work and earn coins"),

new SlashCommandBuilder()
.setName("rob")
.setDescription("Rob a user")
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("shop")
.setDescription("View shop"),

new SlashCommandBuilder()
.setName("buy")
.setDescription("Buy an item")
.addStringOption(option =>
option
.setName("item")
.setDescription("Item name")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("inventory")
.setDescription("View inventory"),

new SlashCommandBuilder()
.setName("profile")
.setDescription("View profile")
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
),

/* ========================= */
/* LEVELING */
/* ========================= */

new SlashCommandBuilder()
.setName("rank")
.setDescription("View your rank"),

new SlashCommandBuilder()
.setName("leaderboard")
.setDescription("View leaderboard"),

new SlashCommandBuilder()
.setName("setlevelchannel")
.setDescription("Set level channel")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addChannelOption(option =>
option
.setName("channel")
.setDescription("Select channel")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("xpadd")
.setDescription("Add XP")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName("amount")
.setDescription("XP amount")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("xpremove")
.setDescription("Remove XP")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName("amount")
.setDescription("XP amount")
.setRequired(true)
),

/* ========================= */
/* MODERATION */
/* ========================= */

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban a user")
.setDefaultMemberPermissions(
PermissionFlagsBits.BanMembers
)
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick a user")
.setDefaultMemberPermissions(
PermissionFlagsBits.KickMembers
)
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout a user")
.setDefaultMemberPermissions(
PermissionFlagsBits.ModerateMembers
)
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName("minutes")
.setDescription("Timeout duration")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("warn")
.setDescription("Warn a user")
.setDefaultMemberPermissions(
PermissionFlagsBits.ModerateMembers
)
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("clear")
.setDescription("Clear messages")
.setDefaultMemberPermissions(
PermissionFlagsBits.ManageMessages
)
.addIntegerOption(option =>
option
.setName("amount")
.setDescription("Amount")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("snipe")
.setDescription("View deleted message"),

/* ========================= */
/* TICKETS */
/* ========================= */

new SlashCommandBuilder()
.setName("ticketpanel")
.setDescription("Create ticket panel")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

new SlashCommandBuilder()
.setName("closeticket")
.setDescription("Close current ticket"),

/* ========================= */
/* GIVEAWAY */
/* ========================= */

new SlashCommandBuilder()
.setName("giveaway")
.setDescription("Start giveaway")
.addStringOption(option =>
option
.setName("prize")
.setDescription("Prize")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("duration")
.setDescription("Example: 10s, 5m, 1h")
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName("winners")
.setDescription("Winner count")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reroll")
.setDescription("Reroll giveaway")
.addStringOption(option =>
option
.setName("messageid")
.setDescription("Giveaway message ID")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("endgiveaway")
.setDescription("End giveaway")
.addStringOption(option =>
option
.setName("messageid")
.setDescription("Giveaway message ID")
.setRequired(true)
),

/* ========================= */
/* AUTOMOD */
/* ========================= */

new SlashCommandBuilder()
.setName("automodsetchannel")
.setDescription("Set automod log channel")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addChannelOption(option =>
option
.setName("channel")
.setDescription("Select channel")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("automodon")
.setDescription("Enable automod")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

new SlashCommandBuilder()
.setName("automodoff")
.setDescription("Disable automod")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
),

/* ========================= */
/* WELCOME */
/* ========================= */

new SlashCommandBuilder()
.setName("welcomesetchannel")
.setDescription("Set welcome channel")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addChannelOption(option =>
option
.setName("channel")
.setDescription("Select channel")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("goodbyesetchannel")
.setDescription("Set goodbye channel")
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)
.addChannelOption(option =>
option
.setName("channel")
.setDescription("Select channel")
.setRequired(true)
),

/* ========================= */
/* UTILITY */
/* ========================= */

new SlashCommandBuilder()
.setName("avatar")
.setDescription("View avatar")
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
),

new SlashCommandBuilder()
.setName("userinfo")
.setDescription("View user info")
.addUserOption(option =>
option
.setName("user")
.setDescription("Target user")
),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("View server info"),

new SlashCommandBuilder()
.setName("afk")
.setDescription("Set AFK")
.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("poll")
.setDescription("Create poll")
.addStringOption(option =>
option
.setName("question")
.setDescription("Poll question")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("suggest")
.setDescription("Create suggestion")
.addStringOption(option =>
option
.setName("suggestion")
.setDescription("Suggestion")
.setRequired(true)
)

].map(command => command.toJSON());

/* ========================= */
/* REST */
/* ========================= */

const rest = new REST({
version: "10"
}).setToken(process.env.TOKEN);

/* ========================= */
/* DEPLOY */
/* ========================= */

(async () => {

try {

console.log("🚀 Deploying commands...");

await rest.put(

Routes.applicationCommands(
process.env.CLIENT_ID
),

{ body: commands }

);

console.log(
"✅ Commands deployed successfully"
);

} catch (err) {

console.error(err);

}

})();
