// commands/fun/giveaway-end.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-end')
        .setDescription('Force-end an active giveaway immediately.')
        .addStringOption(option => 
            option.setName('message-id')
                .setDescription('The Message ID of the active giveaway embed')
                .setRequired(true)),
    async execute(interaction) {
        // Check permissions manually if not using global command permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ You need `Manage Messages` permissions to end giveaways.', ephemeral: true });
        }

        const messageId = interaction.options.getString('message-id');
        
        try {
            // Fetch the giveaway message
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            
            // Check if it's actually an active giveaway embed
            if (!targetMessage.embeds[0] || !targetMessage.embeds[0].title.includes('NEW GIVEAWAY')) {
                return interaction.reply({ content: '❌ This message doesn\'t look like an active giveaway!', ephemeral: true });
            }

            // Defer reply since fetching reactions might take a brief second
            await interaction.deferReply();

            const reaction = targetMessage.reactions.cache.get('🎉');
            if (!reaction) {
                return interaction.editReply('❌ Could not find any reactions on that giveaway message.');
            }

            // Parse setup out of the existing embed description using regular expressions or splits
            const embedDesc = targetMessage.embeds[0].description || '';
            const prizeMatch = embedDesc.match(/\*\*Prize:\*\*\s*(.*)/);
            const winnerMatch = embedDesc.match(/\*\*Winners:\*\*\s*(\d+)/);
            
            const prize = prizeMatch ? prizeMatch[1] : 'Unknown Reward';
            const winnerCount = winnerMatch ? parseInt(winnerMatch[1], 10) : 1;

            const users = await reaction.users.fetch();
            const entries = users.filter(user => !user.bot).map(user => user);

            if (entries.length === 0) {
                const endEmbed = EmbedBuilder.from(targetMessage.embeds[0])
                    .setDescription(`**Prize:** ${prize}\n\n🛑 **Giveaway Ended Early!**\nNo eligible users entered the drawing pool.`);
                await targetMessage.edit({ embeds: [endEmbed] });
                return interaction.editReply('🛑 Giveaway ended, but nobody entered.');
            }

            const winners = [];
            const loops = Math.min(winnerCount, entries.length);
            
            for (let i = 0; i < loops; i++) {
                const randomIndex = Math.floor(Math.random() * entries.length);
                winners.push(entries.splice(randomIndex, 1)[0]);
            }

            const winnerMentions = winners.map(w => `${w}`).join(', ');

            const successEndEmbed = EmbedBuilder.from(targetMessage.embeds[0])
                .setColor(interaction.client.colors.success)
                .setDescription(`**Prize:** ${prize}\n\n🛑 **Giveaway Ended Early!**\n**Winners:** ${winnerMentions}`);

            await targetMessage.edit({ embeds: [successEndEmbed] });
            await targetMessage.reactions.removeAll().catch(() => null); // Clean reactions up

            await interaction.editReply(`🛑 Giveaway forced to close!`);
            await interaction.channel.send(`🎊 Early Draw: Congratulations ${winnerMentions}! You won the giveaway for **${prize}**! 🎊`);

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: '❌ Could not find that message. Make sure you are running this command in the same channel the giveaway is in!', ephemeral: true });
        }
    }
};
