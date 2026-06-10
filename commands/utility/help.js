const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a complete list of Bloxden infrastructure commands.'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setTitle('📚 Bloxden Bot Command Directory')
            .setDescription('Here is a list of all operational Slash (`/`) interactions built into the core framework.')
            .addFields(
                { 
                    name: '💼 Economy Engine Commands', 
                    value: '`/profile` - Check card profile statistics.\n`/balance` - Current wallet balances.\n`/work-apply` - Get a job contract.\n`/work` - Work shifts.\n`/shop` - Browse premium badge list.\n`/buy` - Buy premium profile item roles.\n`/pay` - Send money directly to users.' 
                },
                { 
                    name: '🎲 High Risk & Gambling', 
                    value: '`/beg` - Ask for coins.\n`/gamble` - Risk coins on a 50/50 bet.\n`/crime` - Breach security.\n`/rob` - Pickpocket targets.' 
                },
                { 
                    name: '🎟️ Support Tickets', 
                    value: '`/ticket` - Generate private help query channels.\n`/close` - Purge support channels.' 
                },
                { 
                    name: '📈 Experience & Levels', 
                    value: '`/rank` - Look up your chat interaction level tier.' 
                },
                { 
                    name: '🎮 Entertainment & Fun', 
                    value: '`/meme` - Stream trending subreddits.\n`/8ball` - Ask questions.\n`/say` - Emulate bot text embeds.' 
                }
            )
            .setFooter({ text: 'Bloxden Production Environment v14.5' })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    }
};
