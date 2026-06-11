const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Expose the last message that was deleted in this channel.'),
    async execute(interaction) {
        const snipes = interaction.client.snipes || new Map();
        const snipedData = snipes.get(interaction.channelId);

        if (!snipedData) return interaction.reply({ content: '❌ Nothing found to snipe in this room segment context.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setAuthor({ name: snipedData.author, iconURL: snipedData.avatar })
            .setDescription(snipedData.content || '*[Empty Message or Attachment Payload]*')
            .setFooter({ text: `Deleted at ${snipedData.time}` });

        return interaction.reply({ embeds: [embed] });
    }
};
