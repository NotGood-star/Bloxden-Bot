const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
} = require("discord.js");

module.exports = (client) => {

    // =========================
    // GIVEAWAY STORAGE
    // =========================
    client.giveaways = new Map();

    // =========================
    // START GIVEAWAY COMMAND
    // =========================
    client.on("interactionCreate", async (interaction) => {

        if (!interaction.isChatInputCommand()) return;

        // =========================
        // /gstart
        // =========================
        if (interaction.commandName === "gstart") {

            const prize = interaction.options.getString("prize");
            const duration = interaction.options.getInteger("duration"); // in minutes
            const winnersCount = interaction.options.getInteger("winners") || 1;

            const endTime = Date.now() + duration * 60000;

            const giveawayId = Date.now().toString();

            const embed = new EmbedBuilder()
                .setTitle("🎉 GIVEAWAY STARTED 🎉")
                .setDescription(
                    `**Prize:** ${prize}\n` +
                    `**Winners:** ${winnersCount}\n` +
                    `**Ends In:** <t:${Math.floor(endTime / 1000)}:R>\n\n` +
                    `Click button below to enter!`
                )
                .setColor("Gold")
                .setFooter({ text: `Giveaway ID: ${giveawayId}` });

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`join_${giveawayId}`)
                    .setLabel("🎉 Join Giveaway")
                    .setStyle(ButtonStyle.Success)
            );

            const msg = await interaction.reply({
                embeds: [embed],
                components: [button],
                fetchReply: true
            });

            client.giveaways.set(giveawayId, {
                messageId: msg.id,
                channelId: interaction.channel.id,
                guildId: interaction.guild.id,
                prize,
                winnersCount,
                endTime,
                participants: []
            });

            // Auto end system
            setTimeout(() => endGiveaway(client, giveawayId), duration * 60000);
        }

        // =========================
        // /gend
        // =========================
        if (interaction.commandName === "gend") {

            const id = interaction.options.getString("id");
            const data = client.giveaways.get(id);

            if (!data) {
                return interaction.reply({ content: "❌ Giveaway not found.", ephemeral: true });
            }

            await endGiveaway(client, id);
            interaction.reply({ content: "✅ Giveaway ended!", ephemeral: true });
        }

        // =========================
        // /greroll
        // =========================
        if (interaction.commandName === "greroll") {

            const id = interaction.options.getString("id");
            const data = client.giveaways.get(id);

            if (!data || data.participants.length === 0) {
                return interaction.reply({ content: "❌ No participants found.", ephemeral: true });
            }

            const winner = data.participants[
                Math.floor(Math.random() * data.participants.length)
            ];

            const channel = await client.channels.fetch(data.channelId);

            channel.send(`🔁 Reroll Winner: <@${winner}> for **${data.prize}**`);
            interaction.reply({ content: "🔁 Rerolled successfully!", ephemeral: true });
        }
    });

    // =========================
    // BUTTON HANDLER
    // =========================
    client.on("interactionCreate", async (interaction) => {

        if (!interaction.isButton()) return;

        const id = interaction.customId.split("_")[1];
        const giveaway = client.giveaways.get(id);

        if (!giveaway) {
            return interaction.reply({ content: "❌ Giveaway ended.", ephemeral: true });
        }

        if (giveaway.participants.includes(interaction.user.id)) {
            return interaction.reply({ content: "⚠️ You already joined!", ephemeral: true });
        }

        giveaway.participants.push(interaction.user.id);

        interaction.reply({ content: "🎉 You joined the giveaway!", ephemeral: true });
    });

    // =========================
    // END GIVEAWAY FUNCTION
    // =========================
    async function endGiveaway(client, id) {

        const data = client.giveaways.get(id);
        if (!data) return;

        const channel = await client.channels.fetch(data.channelId);

        let winnerText = "No participants";

        if (data.participants.length > 0) {

            const winners = [];

            for (let i = 0; i < data.winnersCount; i++) {
                const random = data.participants[
                    Math.floor(Math.random() * data.participants.length)
                ];
                winners.push(`<@${random}>`);
            }

            winnerText = winners.join(", ");
        }

        const endEmbed = new EmbedBuilder()
            .setTitle("🏁 GIVEAWAY ENDED")
            .setDescription(
                `**Prize:** ${data.prize}\n` +
                `**Winners:** ${winnerText}`
            )
            .setColor("Red");

        channel.send({ embeds: [endEmbed] });

        client.giveaways.delete(id);
    }
};
