// commands/utility/welcome-goodbye.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { systemChannels, saveDatabase } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-goodbye')
        .setDescription('Configure where joining and leaving logs are sent.')
        .addChannelOption(option => option.setName('welcome').setDescription('Select the channel for welcome greetings.'))
        .addChannelOption(option => option.setName('goodbye').setDescription('Select the channel for exit alerts.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const welcomeChannel = interaction.options.getChannel('welcome');
        const goodbyeChannel = interaction.options.getChannel('goodbye');

        if (!welcomeChannel && !goodbyeChannel) {
            return await interaction.reply({ content: '❌ You must provide at least one channel to configure.', ephemeral: true });
        }

        let desc = 'Successfully updated system channels:\n\n';

        if (welcomeChannel) {
            systemChannels.set(`${guildId}-welcome`, welcomeChannel.id);
            desc += `👋 Welcome: ${welcomeChannel}\n`;
        }
        
        if (goodbyeChannel) {
            systemChannels.set(`${guildId}-goodbye`, goodbyeChannel.id);
            desc += `🚪 Goodbye: ${goodbyeChannel}\n`;
        }

        // Persist the change to JSON immediately
        saveDatabase();

        const embed = new EmbedBuilder()
            .setColor(interaction.client.colors.success)
            .setTitle('⚙️ System Channels Updated')
            .setDescription(desc)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
