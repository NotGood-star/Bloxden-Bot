const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SHOP_ITEMS } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View premium role titles you can buy for your bot profile.'),
    async execute(interaction) {
        const shopEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setTitle('🛒 Bloxden Collectible Badge Shop')
            .setDescription('Buy these special badges to show off on your bot profile! *(These do not grant server roles)*')
            .addFields(
                { name: `👑 ${SHOP_ITEMS.vip.name}`, value: `Price: \`$${SHOP_ITEMS.vip.price}\` coins`, inline: false },
                { name: `⚜️ ${SHOP_ITEMS.king.name}`, value: `Price: \`$${SHOP_ITEMS.king.price}\` coins`, inline: false },
                { name: `🛡️ ${SHOP_ITEMS.legend.name}`, value: `Price: \`$${SHOP_ITEMS.legend.price}\` coins`, inline: false },
                { name: `⚡ ${SHOP_ITEMS.god.name}`, value: `Price: \`$${SHOP_ITEMS.god.price}\` coins`, inline: false }
            )
            .setFooter({ text: 'Type /buy <item_id> to purchase!' })
            .setTimestamp();

        await interaction.reply({ embeds: [shopEmbed] });
    },
};
