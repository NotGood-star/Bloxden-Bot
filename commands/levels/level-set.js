const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
// Import the central database system
const db = require('../../database.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Configure leveling announcement variables')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('set-channel')
                .setDescription('Set the channel where level-up alerts are posted')
                .addChannelOption(opt => 
                    opt.setName('channel')
                        .setDescription('The chat feed channel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        // Use the centralized systemChannels map
        // We store it using the guild ID to support multiple servers
        db.systemChannels.set(`${guildId}-level`, channel.id);
        
        // Persist the changes to the JSON file immediately
        db.saveDatabase();
        
        return interaction.reply({ 
            content: `🎯 Level up announcements will now be directed to ${channel}!`,
            ephemeral: true 
        });
    }
};
