const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '../../database.json');
function readDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}'); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Weekly operations panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('leaderboard-set')
                .setDescription('Manually seed or override structural weekly score metrics')
                .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
                .setIntegerOption(opt => opt.setName('score').setDescription('The weekly score calculation').setRequired(true))
        ),
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
