const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Transfer money safely out of your wallet to another user.')
        .addUserOption(option => option.setName('target').setDescription('The person receiving money').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('How much to send').setRequired(true)),
    async execute(interaction) {
        const senderId = interaction.user.id;
        const receiver = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');

        if (receiver.id === senderId) return interaction.reply({ content: '❌ You can\'t send money to yourself.', ephemeral: true });
        if (amount <= 0) return interaction.reply({ content: '❌ Please provide a real amount to transfer.', ephemeral: true });

        const senderBal = balances.get(senderId) || 0;
        if (senderBal < amount) return interaction.reply({ content: '❌ You don\'t have enough coins to cover this transfer.', ephemeral: true });

        // Complete Transfer
        balances.set(senderId, senderBal - amount);
        balances.set(receiver.id, (balances.get(receiver.id) || 0) + amount);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('💸 Wire Transfer Complete')
            .setDescription(`Successfully sent **$${amount}** coins over to ${receiver}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
