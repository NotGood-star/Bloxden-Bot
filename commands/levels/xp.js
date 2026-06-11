const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Helper to access the local JSON file database
const dbPath = path.join(__dirname, '../../database.json');
function readDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}'); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage user configuration levels and experience points.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Grant bonus experience points to a community member.')
            .addUserOption(opt => opt.setName('target').setDescription('The user receiving the points').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of XP to add').setRequired(true).setMinValue(1)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Deduct experience points from a community member.')
            .addUserOption(opt => opt.setName('target').setDescription('The user losing the points').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of XP to remove').setRequired(true).setMinValue(1))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        
        const db = readDB();
        if (!db.xp) db.xp = {};
        if (!db.xp[target.id]) db.xp[target.id] = { points: 0, weeklyPoints: 0 };

        const embed = new EmbedBuilder().setTimestamp();

        if (sub === 'add') {
            db.xp[target.id].points += amount;
            db.xp[target.id].weeklyPoints += amount;
            
            embed.setColor(interaction.client.colors.success)
                .setTitle('✨ XP Granted')
                .setDescription(`Successfully added **${amount} XP** to ${target}.\nTotal points: \`${db.xp[target.id].points}\``);
        } else if (sub === 'remove') {
            db.xp[target.id].points = Math.max(0, db.xp[target.id].points - amount);
            db.xp[target.id].weeklyPoints = Math.max(0, db.xp[target.id].weeklyPoints - amount);
            
            embed.setColor(interaction.client.colors.error)
                .setTitle('📉 XP Removed')
                .setDescription(`Successfully removed **${amount} XP** from ${target}.\nTotal points: \`${db.xp[target.id].points}\``);
        }

        writeDB(db);
        return interaction.reply({ embeds: [embed] });
    }
};
