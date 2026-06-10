const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check bot latency"),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🏓 Pong!")
            .setDescription(`Latency: ${client.ws.ping}ms`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
