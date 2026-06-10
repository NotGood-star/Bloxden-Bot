const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Broadcast a custom message embed through the bot.')
        .addStringOption(option => option.setName('title').setDescription('Embed Heading Title').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Main descriptive text block').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Admin/Staff only
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const messageText = interaction.options.getString('message');

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setTitle(title)
            .setDescription(messageText)
            .setTimestamp();

        await interaction.reply({ content: '✅ Broadcast delivered.', ephemeral: true });
        await interaction.channel.send({ embeds: [embed] });
    }
};
