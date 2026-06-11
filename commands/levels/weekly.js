const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '../../database.json');
function readDB() { 
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}'); 
    } catch (e) {
        return {};
    }
}
function writeDB(data) { 
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); 
    } catch (e) {}
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Weekly operations panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => {
            subcommand.setName('leaderboard-set');
            subcommand.setDescription('Manually seed or override structural weekly score metrics');
            subcommand.addUserOption(option => option.setName('user').setDescription('Target user').setRequired(true));
            subcommand.setIntegerOption(option => option.setName('score').setDescription('The weekly score calculation').setRequired(true));
            return subcommand;
        }),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const score = interaction.options.getInteger('score');
        const db = readDB();

        if (!db.weeklyScores) db.weeklyScores = {};
        db.weeklyScores[target.id] = score;

        writeDB(db);
        return interaction.reply({ content: `📊 Modified operational values: ${target} set to **${score} points** for the active weekly tracking loop.` });
    }
};
