// commands/fun/giveaway.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// ⏱️ Simple custom parser to replace the 'ms' dependency
function parseStringToMs(str) {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60000;
        case 'h': return value * 3600000;
        case 'd': return value * 86400000;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a timed giveaway inside the community.')
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Time duration (e.g., 10s, 5m, 2h, 1d)')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('winners')
                .setDescription('Number of winners to pull')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('prize')
                .setDescription('What item/currency is up for grabs?')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const durationStr = interaction.options.getString('duration').toLowerCase().trim();
        const winnerCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');

        const durationMs = parseStringToMs(durationStr);
        if (!durationMs || durationMs < 5000) {
            return interaction.reply({ 
                content: '❌ Invalid time format! Use formats like `30s`, `5m`, `2h`, or `1d` (Minimum 5 seconds).', 
                ephemeral: true 
            });
        }

        const endTime = Math.floor((Date.now() + durationMs) / 1000);

        // Standard fallback if client color matrix isn't globalized
        const embedColor = interaction.client.colors?.info || '#5865F2';
        const successColor = interaction.client.colors?.success || '#57F287';

        const giveawayEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🎉 NEW GIVEAWAY! 🎉')
            .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnerCount}\n**Hosted By:** ${interaction.user}\n\nEnds: <t:${endTime}:R> (<t:${endTime}:f>)\n\n**React with 🎉 to enter!**`)
            .setTimestamp();

        const message = await interaction.reply({ embeds: [giveawayEmbed], fetchReply: true });
        await message.react('🎉');

        setTimeout(async () => {
            try {
                const targetMessage = await interaction.channel.messages.fetch(message.id).catch(() => null);
                if (!targetMessage) return;

                const reaction = targetMessage.reactions.cache.get('🎉');
                if (!reaction) return;

                const users = await reaction.users.fetch();
                const entries = users.filter(user => !user.bot).map(user => user);

                if (entries.length === 0) {
                    const endEmbed = EmbedBuilder.from(giveawayEmbed)
                        .setDescription(`**Prize:** ${prize}\n\n🛑 **Giveaway Ended!**\nNo eligible users entered the drawing pool.`);
                    return await targetMessage.edit({ embeds: [endEmbed] });
                }

                const winners = [];
                const loops = Math.min(winnerCount, entries.length);
                
                for (let i = 0; i < loops; i++) {
                    const randomIndex = Math.floor(Math.random() * entries.length);
                    winners.push(entries.splice(randomIndex, 1)[0]);
                }

                const winnerMentions = winners.map(w => `${w}`).join(', ');

                const successEndEmbed = EmbedBuilder.from(giveawayEmbed)
                    .setColor(successColor)
                    .setDescription(`**Prize:** ${prize}\n\n🛑 **Giveaway Ended!**\n**Winners:** ${winnerMentions}`);

                await targetMessage.edit({ embeds: [successEndEmbed] });
                await interaction.channel.send(`🎊 Congratulations ${winnerMentions}! You won the giveaway for **${prize}**! 🎊`);

            } catch (err) {
                console.error('Giveaway timer error:', err);
            }
        }, durationMs);
    }
};
