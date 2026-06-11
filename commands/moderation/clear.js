const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk purge an indexed amount of chat statements from history.')
        .addIntegerOption(option => option.setName('amount').setDescription('Total elements to scrub (1-99)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 99) {
            return interaction.reply({ content: '❌ Range parameter must be configured between 1 and 99.', ephemeral: true });
        }

        const purged = await interaction.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            return null;
        });

        if (!purged) {
            return interaction.reply({ content: '❌ Critical Failure: Messages older than 14 days cannot be mass purged due to Discord structural rules.', ephemeral: true });
        }

        return interaction.reply({ content: `🧹 Cleared **${purged.size}** old messaging logs from room view execution contexts.`, ephemeral: true });
    }
};
