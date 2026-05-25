const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [

new SlashCommandBuilder()
.setName("help")
.setDescription("Help menu"),

new SlashCommandBuilder()
.setName("ping")
.setDescription("Check bot ping"),

new SlashCommandBuilder()
.setName("joke")
.setDescription("Get a funny joke"),

new SlashCommandBuilder()
.setName("dice")
.setDescription("Roll a dice"),

new SlashCommandBuilder()
.setName("coinflip")
.setDescription("Flip a coin"),

new SlashCommandBuilder()
.setName("quote")
.setDescription("Get a random quote"),

new SlashCommandBuilder()
.setName("serverinfo")
.setDescription("Show server info"),

new SlashCommandBuilder()
.setName("rps")
.setDescription("Rock Paper Scissors")
.addStringOption(option =>
option.setName("choice")
.setDescription("rock / paper / scissors")
.setRequired(true)
.addChoices(
{ name: "rock", value: "rock" },
{ name: "paper", value: "paper" },
{ name: "scissors", value: "scissors" }
)
),

new SlashCommandBuilder()
.setName("guess")
.setDescription("Guess number 1-10")
.addIntegerOption(option =>
option.setName("number")
.setDescription("Choose a number")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban a user")
.addUserOption(option =>
option.setName("user")
.setDescription("User to ban")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
.setRequired(false)
),

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick a user")
.addUserOption(option =>
option.setName("user")
.setDescription("User to kick")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
.setRequired(false)
),

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout a user")
.addUserOption(option =>
option.setName("user")
.setDescription("User to timeout")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("minutes")
.setDescription("Timeout minutes")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("warn")
.setDescription("Warn a user")
.addUserOption(option =>
option.setName("user")
.setDescription("User to warn")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("Reason")
.setRequired(false)
)

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
process.exit(1);

}

})();
