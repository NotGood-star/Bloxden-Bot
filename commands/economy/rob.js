const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balances, robCooldowns } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Attempt to rob cash out of another player\'s wallet.')
        .addUserOption(option => option.setName('target').setDescription('The user to rob').setRequired(true)),
    async execute(interaction) {
        const attacker = interaction.user.id;
        const victim = interaction.options.getUser('target');
        const now = Date.now();

        if (victim.id === attacker) return interaction.reply({ content: '❌ You can\'t rob yourself!', ephemeral: true });

        if (robCooldowns.has(attacker) && (now - robCooldowns.get(attacker) < 600000)) {
            return interaction.reply({ content: '⏱️ Chill! Take a break before launching another robbery.', ephemeral: true });
        }

        const victimBal = balances.get(victim.id) || 0;
        const attackerBal = balances.get(attacker) || 0;

        if (victimBal < 1000) {
            return interaction.reply({ content: '❌ This target doesn\'t have enough money to be worth it. Leave them alone!', ephemeral: true });
        }

        robCooldowns.set(attacker, now);
        const success = Math.random() > 0.5; // 50% chance
        const embed = new EmbedBuilder().setTimestamp();

        if (success) {
            const stolen = Math.floor(Math.random() * (victimBal * 0.35)) + 200; // up to 35%
            balances.set(victim.id, victimBal - stolen);
            balances.set(attacker, attackerBal + stolen);

            embed.setColor(interaction.client.colors.success)
                 .setTitle('🥷 Quick Hands!')
                 .setDescription(`You sneaked up on ${victim} and successfully stole **$${stolen}** directly from their wallet!`);
        } else {
            const fine = 500;
            balances.set(attacker, Math.max(0, attackerBal - fine));
            embed.setColor(interaction.client.colors.error)
                 .setTitle('🚨 Caught!')
                 .setDescription(`You tripped while running away! ${victim} caught you, and you paid them **$${fine}** in damages.`);
            balances.set(victim.id, victimBal + fine);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
