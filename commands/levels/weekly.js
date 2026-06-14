const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
// Import the central database object
const db = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Weekly operations panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => 
            subcommand
                .setName('leaderboard-set')
                .setDescription('Manually seed or override structural weekly score metrics')
                .addUserOption(option => option.setName('user').setDescription('Target user').setRequired(true))
                .addIntegerOption(option => option.setName('score').setDescription('The weekly score calculation').setRequired(true))
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const score = interaction.options.getInteger('score');

        // Update the central weeklyScores Map
        db.weeklyScores.set(target.id, score);

        // Persist the change to your database.json file
        db.saveDatabase();

        return interaction.reply({ 
            content: `📊 Modified operational values: ${target} set to **${score} points** for the active weekly tracking loop.` 
        });
    }
};
