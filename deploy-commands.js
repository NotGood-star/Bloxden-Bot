require("dotenv").config();

const {
REST,
Routes,
SlashCommandBuilder
} = require("discord.js");

const commands = [

/* FUN */

new SlashCommandBuilder()
.setName("ping")
.setDescription("Ping command"),

new SlashCommandBuilder()
.setName("help")
.setDescription("Show all commands"),

new SlashCommandBuilder()
.setName("funfact")
.setDescription("Shows fun fact"),

new SlashCommandBuilder()
.setName("joke")
.setDescription("Shows joke"),

new SlashCommandBuilder()
.setName("dice")
.setDescription("Roll dice"),

new SlashCommandBuilder()
.setName("coinflip")
.setDescription("Flip coin"),

new SlashCommandBuilder()
.setName("quote")
.setDescription("Shows quote"),

/* ECONOMY */

new SlashCommandBuilder()
.setName("balance")
.setDescription("Check balance")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("daily")
.setDescription("Claim daily reward"),

new SlashCommandBuilder()
.setName("pay")
.setDescription("Pay coins")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("amount")
.setDescription("Amount")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("shop")
.setDescription("Open shop"),

new SlashCommandBuilder()
.setName("buy")
.setDescription("Buy item")
.addStringOption(option =>
option.setName("item")
.setDescription("Item name")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("work")
.setDescription("Work for coins"),

new SlashCommandBuilder()
.setName("gamble")
.setDescription("Gamble coins")
.addIntegerOption(option =>
option.setName("amount")
.setDescription("Amount")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("rob")
.setDescription("Rob user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
),

/* LEVEL SYSTEM */

new SlashCommandBuilder()
.setName("rank")
.setDescription("Check rank"),

new SlashCommandBuilder()
.setName("leaderboard")
.setDescription("Level leaderboard"),

new SlashCommandBuilder()
.setName("setlevelchannel")
.setDescription("Set level announcement channel")
.addChannelOption(option =>
option.setName("channel")
.setDescription("Channel")
.setRequired(true)
),

/* TICKETS */

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Create ticket"),

new SlashCommandBuilder()
.setName("ticketpanel")
.setDescription("Create ticket panel"),

new SlashCommandBuilder()
.setName("closeticket")
.setDescription("Close ticket"),

/* INVITES */

new SlashCommandBuilder()
.setName("invite")
.setDescription("Check invites")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("inviteleaderboard")
.setDescription("Invite leaderboard"),

/* MESSAGES */

new SlashCommandBuilder()
.setName("messages")
.setDescription("Check messages")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
),

new SlashCommandBuilder()
.setName("messageleaderboard")
.setDescription("Message leaderboard"),

/* REACTION ROLE */

new SlashCommandBuilder()
.setName("reactionrole")
.setDescription("Create reaction role")
.addRoleOption(option =>
option.setName("role")
.setDescription("Role")
.setRequired(true)
),

/* MODERATION */

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban member")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick member")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout member")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("minutes")
.setDescription("Minutes")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("clear")
.setDescription("Clear messages")
.addIntegerOption(option =>
option.setName("amount")
.setDescription("Amount")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("warn")
.setDescription("Warn member")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
),

/* GIVEAWAY */

new SlashCommandBuilder()
.setName("giveaway")
.setDescription("Start giveaway")
.addStringOption(option =>
option.setName("prize")
.setDescription("Prize")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("duration")
.setDescription("Duration in seconds")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("winners")
.setDescription("Number of winners")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reroll")
.setDescription("Reroll giveaway"),

new SlashCommandBuilder()
.setName("endgiveaway")
.setDescription("End giveaway")

].map(command => command.toJSON());

const rest = new REST({
version: "10"
}).setToken(process.env.TOKEN);

(async () => {

try {

console.log("Registering slash commands...");

await rest.put(
Routes.applicationCommands(process.env.CLIENT_ID),
{
body: commands
}
);

console.log("Slash commands registered!");

} catch (err) {

console.error(err);

}

})();
