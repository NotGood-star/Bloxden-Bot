const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Bet your money in a double-or-nothing game.')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount to gamble').setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('amount');
        const currentBal = balances.get(userId) || 0;

        if (bet <= 0) return interaction.reply({ content: '❌ Please enter a valid amount to bet.', ephemeral: true });
        if (currentBal < bet) return interaction.reply({ content: '❌ You don\'t have enough coins in your wallet!', ephemeral: true });

        const win = Math.random() > 0.5;
        const embed = new EmbedBuilder().setTimestamp();

        if (win) {
            balances.set(userId, currentBal + bet);
            embed.setColor(interaction.client.colors.success)
                 .setTitle('🎲 Winner Winner!')
                 .setDescription(`You rolled lucky and doubled your money! You gained **$${bet}** coins.`)
                 .addFields({ name: 'New Balance', value: `🪙 \`$${balances.get(userId)}\`` });
        } else {
            balances.set(userId, currentBal - bet);
            embed.setColor(interaction.client.colors.error)
                 .setTitle('🎲 House Wins!')
                 .setDescription(`You lost your bet of **$${bet}** coins. Better luck next time!`)
                 .addFields({ name: 'New Balance', value: `🪙 \`$${balances.get(userId)}\`` });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
