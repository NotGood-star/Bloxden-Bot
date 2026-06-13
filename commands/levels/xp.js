const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { xp, levels, saveDatabase } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage user XP levels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Give XP to a user')
                .addUserOption(opt => opt.setName('user').setDescription('The target user').setRequired(true))
                .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of XP to add').setRequired(true).setMinValue(1))
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Take XP away from a user')
                .addUserOption(opt => opt.setName('user').setDescription('The target user').setRequired(true))
                .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of XP to remove').setRequired(true).setMinValue(1))
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const userId = target.id;

        let currentXP = xp.get(userId) || 0;
        let currentLevel = levels.get(userId) || 1;

        if (sub === 'add') {
            currentXP += amount;
            // Leveling logic
            while (currentXP >= (currentLevel * 500)) {
                currentXP -= (currentLevel * 500);
                currentLevel++;
            }
            xp.set(userId, currentXP);
            levels.set(userId, currentLevel);
        } else if (sub === 'remove') {
            currentXP = Math.max(0, currentXP - amount);
            xp.set(userId, currentXP);
        }

        saveDatabase();
        return interaction.reply({ content: `✅ Successfully updated ${target}'s XP.` });
    }
};
