const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [

new SlashCommandBuilder()
.setName("help")
.setDescription("Help menu"),

new SlashCommandBuilder()
.setName("giveaway")
.setDescription("Start a giveaway")
.addStringOption(option =>
option.setName("prize")
.setDescription("Giveaway prize")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("duration")
.setDescription("Duration in minutes")
.setRequired(true)
)
.addIntegerOption(option =>
option.setName("winners")
.setDescription("Number of winners")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("reroll")
.setDescription("Reroll a giveaway")
.addStringOption(option =>
option.setName("messageid")
.setDescription("Giveaway message ID")
.setRequired(true)
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
