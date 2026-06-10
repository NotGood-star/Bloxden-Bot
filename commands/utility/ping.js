const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s current latency.'),
    async execute(interaction) {
        // Initial reply to fetch execution time
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        const pingEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'API Latency', value: `\`${latency}ms\``, inline: true },
                { name: 'WebSocket Latency', value: `\`${interaction.client.ws.ping}ms\``, inline: true }
            )
            .setFooter({ text: 'Bloxden Bot Systems Operational' })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [pingEmbed] });
    },
};
