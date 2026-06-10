// commands/utility/welcome-goodbye.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { systemChannels } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-goodbye')
        .setDescription('Configure where joining and leaving logs are sent.')
        .addChannelOption(option => option.setName('welcome').setDescription('Select the channel for welcome greetings.').setRequired(true))
        .addChannelOption(option => option.setName('goodbye').setDescription('Select the channel for exit alerts.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Admin Only
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const welcomeChannel = interaction.options.getChannel('welcome');
        const goodbyeChannel = interaction.options.getChannel('goodbye');

        // Save the channel IDs into our database map using keys
        systemChannels.set(`${guildId}-welcome`, welcomeChannel.id);
        systemChannels.set(`${guildId}-goodbye`, goodbyeChannel.id);

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('⚙️ System Channels Anchored')
            .setDescription(`Successfully linked your system events:\n\n👋 Welcome Logs: ${welcomeChannel}\n🚪 Goodbye Logs: ${goodbyeChannel}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
