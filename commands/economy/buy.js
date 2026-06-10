const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, inventories, SHOP_ITEMS } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy a role badge from the shop to put in your inventory.')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Select the item badge')
                .setRequired(true)
                .addChoices(
                    { name: 'VIP Role ($35,000)', value: 'vip' },
                    { name: 'King Role ($50,000)', value: 'king' },
                    { name: 'Legend Role ($100,000)', value: 'legend' },
                    { name: 'God Role ($200,000)', value: 'god' }
                )),
    async execute(interaction) {
        const userId = interaction.user.id;
        const itemId = interaction.options.getString('item');
        const item = SHOP_ITEMS[itemId];

        const userBalance = balances.get(userId) || 0;
        const userInv = inventories.get(userId) || [];

        if (userInv.includes(item.name)) {
            return interaction.reply({ content: `❌ You already purchased the **${item.name}** badge!`, ephemeral: true });
        }

        if (userBalance < item.price) {
            return interaction.reply({ content: `❌ You cannot afford this! You need **$${item.price}** coins.`, ephemeral: true });
        }

        // Process purchase
        balances.set(userId, userBalance - item.price);
        userInv.push(item.name);
        inventories.set(userId, userInv);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('🛍️ Item Unlocked!')
            .setDescription(`Success! You bought the **${item.name}** badge.\nIt has been safely added to your permanent profile collection.`);

        await interaction.reply({ embeds: [embed] });
    },
};
