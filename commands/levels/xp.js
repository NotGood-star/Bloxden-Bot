const// commands/levels/xp.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { xp, levels, saveDatabase } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage user XP levels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub => sub.setName('add')... ) // keep your existing structure
        .addSubcommand(sub => sub.setName('remove')... ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const userId = target.id;

        // Get current values from the shared memory Map
        let currentXP = xp.get(userId) || 0;
        let currentLevel = levels.get(userId) || 1;

        if (sub === 'add') {
            currentXP += amount;
            // Level up logic
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

        // Save to JSON file so it persists after restart
        saveDatabase();

        await interaction.reply({ content: `✅ Successfully updated ${target}'s XP.` });
    }
};
