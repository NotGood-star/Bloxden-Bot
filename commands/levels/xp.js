const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Helper to manage JSON DB paths dynamically
const dbPath = path.join(__dirname, '../../database.json');
function readDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}'); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage user XP levels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Give XP to a user')
                .addUserOption(opt => opt.setName('user').setDescription('The target user').setRequired(true))
                .setIntegerOption(opt => opt.setName('amount').setDescription('Amount of XP to add').setRequired(true).setMinValue(1))
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Take XP away from a user')
                .addUserOption(opt => opt.setName('user').setDescription('The target user').setRequired(true))
                .setIntegerOption(opt => opt.setName('amount').setDescription('Amount of XP to remove').setRequired(true).setMinValue(1))
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        
        const db = readDB();
        if (!db.levels) db.levels = {};
        if (!db.levels[target.id]) db.levels[target.id] = { xp: 0, level: 1 };

        let currentXP = db.levels[target.id].xp;

        if (sub === 'add') {
            currentXP += amount;
            // Formula to calculate leveling up dynamically
            let currentLevel = db.levels[target.id].level;
            let xpNeeded = currentLevel * 500;
            while (currentXP >= xpNeeded) {
                currentXP -= xpNeeded;
                currentLevel++;
                xpNeeded = currentLevel * 500;
            }
            db.levels[target.id].xp = currentXP;
            db.levels[target.id].level = currentLevel;
            
            writeDB(db);
            return interaction.reply({ content: `✅ Added **${amount} XP** to ${target}. They are now Level **${currentLevel}** (${currentXP} XP)!` });
        }

        if (sub === 'remove') {
            currentXP = Math.max(0, currentXP - amount);
            db.levels[target.id].xp = currentXP;
            
            writeDB(db);
            return interaction.reply({ content: `✅ Removed **${amount} XP** from ${target}. Current XP pool: **${currentXP}**.` });
        }
    }
};
