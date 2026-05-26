const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [

new SlashCommandBuilder()
.setName("help")
.setDescription("Help menu"),

new SlashCommandBuilder()
.setName("ping")
.setDescription("Check ping"),

new SlashCommandBuilder()
.setName("joke")
.setDescription("Funny joke"),

new SlashCommandBuilder()
.setName("dice")
.setDescription("Roll dice"),

new SlashCommandBuilder()
.setName("coinflip")
.setDescription("Flip coin"),

new SlashCommandBuilder()
.setName("quote")
.setDescription("Random quote"),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Server info"),

new SlashCommandBuilder()
.setName("rps")
.setDescription("Rock Paper Scissors")
.addStringOption(option =>
option.setName("choice")
.setDescription("Choice")
.setRequired(true)
.addChoices(
{ name: "rock", value: "rock" },
{ name: "paper", value: "paper" },
{ name: "scissors", value: "scissors" }
)
),

new SlashCommandBuilder()
.setName("guess")
.setDescription("Guess number")
.addIntegerOption(option =>
option.setName("number")
.setDescription("1-10")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
),

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout user")
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
.setName("warn")
.setDescription("Warn user")
.addUserOption(option =>
option.setName("user")
.setDescription("User")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
),

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
.setDescription("Minutes")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("winners")
.setDescription("Winners")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reroll")
.setDescription("Reroll giveaway")
.addStringOption(option =>
option.setName("messageid")
.setDescription("Message ID")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reactionrole")
.setDescription("Create reaction role")
.addRoleOption(option =>
option.setName("role")
.setDescription("Role")
.setRequired(true)
),

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
.setName("rank")
.setDescription("Check level"),

new SlashCommandBuilder()
.setName("leaderboard")
.setDescription("Leaderboard"),

new SlashCommandBuilder()
.setName("ticket")
.setDescription("Create support ticket")

].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {

try {

console.log("Registering slash commands...");

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{ body: commands }
);

console.log("Slash commands registered!");

process.exit(0);

} catch (error) {

console.error(error);

}

})();
