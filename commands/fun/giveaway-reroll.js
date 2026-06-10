// commands/fun/giveaway-reroll.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-reroll')
        .setDescription('Roll a new winner from an existing giveaway message.')
        .addStringOption(option => 
            option.setName('message-id')
                .setDescription('The Message ID of the ended giveaway embed')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ You need `Manage Messages` permissions to reroll giveaways.', ephemeral: true });
        }

        const messageId = interaction.options.getString('message-id');

        try {
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            
            // Check if it's actually an ended giveaway embed
            if (!targetMessage.embeds[0] || !targetMessage.embeds[0].description.includes('Ended')) {
                return interaction.reply({ content: '❌ This giveaway hasn\'t ended yet, or it isn\'t a giveaway message!', ephemeral: true });
            }

            await interaction.deferReply();

            // Fetch users from the original reaction cache (Discord saves them unless cleared)
            const reaction = targetMessage.reactions.cache.get('🎉');
            
            // If the reactions were cleared by an end command, try to refetch from history cache context
            let users;
            if (!reaction) {
                return interaction.editReply('❌ Could not read user entry cache. Reactions might have been fully scrubbed.');
            } else {
                users = await reaction.users.fetch();
            }

            const entries = users.filter(user => !user.bot).map(user => user);

            if (entries.length === 0) {
                return interaction.editReply('❌ No eligible entries found to execute a reroll pool action.');
            }

            // Pick one random profile
            const rerolledWinner = entries[Math.floor(Math.random() * entries.length)];

            // Extract the original prize name safely
            const embedDesc = targetMessage.embeds[0].description || '';
            const prizeMatch = embedDesc.match(/\*\*Prize:\*\*\s*(.*)/);
            const prize = prizeMatch ? prizeMatch[1] : 'the prize';

            const rerollEmbed = new EmbedBuilder()
                .setColor(interaction.client.colors.info)
                .setDescription(`🎲 **New Winner Rerolled!**\n\n**New Winner:** ${rerolledWinner}\n**Prize:** ${prize}`);

            await interaction.editReply({ embeds: [rerollEmbed] });
            await interaction.channel.send(`🎉 **Reroll Success!** ${rerolledWinner} has won the reroll drawing for **${prize}**!`);

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: '❌ Unable to process reroll. Verify the Message ID matches a message in this channel context.', ephemeral: true });
        }
    }
};
