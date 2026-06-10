// commands/fun/giveaway.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms'); // Ensure 'ms' is installed, or we can use raw minutes parsing. 

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Staff Only
    async execute(interaction) {
        const durationStr = interaction.options.getString('duration');
        const winnerCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');

        // Convert duration string to milliseconds
        let durationMs;
        try {
            durationMs = ms(durationStr);
            if (!durationMs || durationMs < 5000) throw new Error();
        } catch (e) {
            return interaction.reply({ 
                content: '❌ Invalid time format! Use formats like `30s`, `5m`, `2h`, or `1d` (Minimum 5 seconds).', 
                ephemeral: true 
            });
        }

        const endTime = Math.floor((Date.now() + durationMs) / 1000);

        const giveawayEmbed = new EmbedBuilder()
            .setColor(interaction.client.colors.info)
            .setTitle('🎉 NEW GIVEAWAY! 🎉')
            .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnerCount}\n**Hosted By:** ${interaction.user}\n\nEnds: <t:${endTime}:R> (<t:${endTime}:f>)\n\n**React with 🎉 to enter!**`)
            .setTimestamp();

        // Reply to the interaction and fetch the message block
        const message = await interaction.reply({ embeds: [giveawayEmbed], fetchReply: true });
        await message.react('🎉');

        // Setup an automatic countdown timer execution block
        setTimeout(async () => {
            try {
                // Fetch the latest state of the message and reactions
                const targetMessage = await interaction.channel.messages.fetch(message.id);
                const reaction = targetMessage.reactions.cache.get('🎉');
                
                if (!reaction) return interaction.channel.send(`❌ Could not resolve reactions for the **${prize}** giveaway.`);

                // Fetch all users who reacted (excluding the bot itself)
                const users = await reaction.users.fetch();
                const entries = users.filter(user => !user.bot).map(user => user);

                if (entries.length === 0) {
                    const endEmbed = EmbedBuilder.from(giveawayEmbed)
                        .setDescription(`**Prize:** ${prize}\n\n🛑 **Giveaway Ended!**\nNo eligible users entered the drawing pool.`);
                    return await targetMessage.edit({ embeds: [endEmbed] });
                }

                // Randomly draw winners from the pool
                const winners = [];
                const loops = Math.min(winnerCount, entries.length);
                
                for (let i = 0; i < loops; i++) {
                    const randomIndex = Math.floor(Math.random() * entries.length);
                    winners.push(entries.splice(randomIndex, 1)[0]);
                }

                const winnerMentions = winners.map(w => `${w}`).join(', ');

                const successEndEmbed = EmbedBuilder.from(giveawayEmbed)
                    .setColor(interaction.client.colors.success)
                    .setDescription(`**Prize:** ${prize}\n\n🛑 **Giveaway Ended!**\n**Winners:** ${winnerMentions}`);

                await targetMessage.edit({ embeds: [successEndEmbed] });
                await interaction.channel.send(`🎊 Congratulations ${winnerMentions}! You won the giveaway for **${prize}**! 🎊`);

            } catch (err) {
                console.error('Giveaway completion error:', err);
            }
        }, durationMs);
    }
};
