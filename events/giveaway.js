const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = (client) => {

    // =========================
    // GIVEAWAY STORAGE
    // =========================
    client.giveaways = new Map();

    // =========================
    // INTERACTIONS
    // =========================
    client.on("interactionCreate", async (interaction) => {

        // =========================
        // SLASH COMMANDS
        // =========================
        if (interaction.isChatInputCommand()) {

            const { commandName } = interaction;

            // -------------------------
            // /gstart
            // -------------------------
            if (commandName === "gstart") {

                const prize = interaction.options.getString("prize");
                const time = interaction.options.getInteger("time"); // minutes
                const winnersCount = interaction.options.getInteger("winners") || 1;

                const end = Date.now() + time * 60000;
                const id = Date.now().toString();

                const embed = new EmbedBuilder()
                    .setTitle("🎉 GIVEAWAY LIVE 🎉")
                    .setDescription(
                        `🎁 **Prize:** ${prize}\n` +
                        `🏆 **Winners:** ${winnersCount}\n` +
                        `⏰ **Ends:** <t:${Math.floor(end / 1000)}:R>\n\n` +
                        `Click 🎉 button to join!`
                    )
                    .setColor("Gold")
                    .setFooter({ text: `Giveaway ID: ${id}` });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gw_join_${id}`)
                        .setLabel("🎉 Join Giveaway")
                        .setStyle(ButtonStyle.Success)
                );

                const msg = await interaction.reply({
                    embeds: [embed],
                    components: [row],
                    fetchReply: true
                });

                client.giveaways.set(id, {
                    messageId: msg.id,
                    channelId: interaction.channel.id,
                    guildId: interaction.guild.id,
                    prize,
                    winnersCount,
                    end,
                    participants: []
                });

                setTimeout(() => endGiveaway(client, id), time * 60000);
            }

            // -------------------------
            // /gend
            // -------------------------
            if (commandName === "gend") {

                const id = interaction.options.getString("id");
                const data = client.giveaways.get(id);

                if (!data) {
                    return interaction.reply({ content: "❌ Giveaway not found!", ephemeral: true });
                }

                await endGiveaway(client, id);
                return interaction.reply({ content: "🏁 Giveaway ended!", ephemeral: true });
            }

            // -------------------------
            // /greroll
            // -------------------------
            if (commandName === "greroll") {

                const id = interaction.options.getString("id");
                const data = client.giveaways.get(id);

                if (!data || data.participants.length === 0) {
                    return interaction.reply({ content: "❌ No participants found!", ephemeral: true });
                }

                const winner = data.participants[
                    Math.floor(Math.random() * data.participants.length)
                ];

                const channel = await client.channels.fetch(data.channelId);

                channel.send(`🔁 New Winner (Reroll): <@${winner}> for **${data.prize}**`);

                return interaction.reply({ content: "🔁 Rerolled successfully!", ephemeral: true });
            }

            // -------------------------
            // /gleaderboard
            // -------------------------
            if (commandName === "gleaderboard") {

                const id = interaction.options.getString("id");
                const data = client.giveaways.get(id);

                if (!data) {
                    return interaction.reply({ content: "❌ Giveaway not found!", ephemeral: true });
                }

                if (data.participants.length === 0) {
                    return interaction.reply({ content: "No participants yet.", ephemeral: true });
                }

                // Simple leaderboard (top 10 random display order)
                const list = data.participants.slice(0, 10);

                const embed = new EmbedBuilder()
                    .setTitle("🏆 Giveaway Leaderboard")
                    .setDescription(
                        list.map((u, i) => `**${i + 1}.** <@${u}>`).join("\n")
                    )
                    .setColor("Blue");

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        // =========================
        // BUTTON SYSTEM
        // =========================
        if (interaction.isButton()) {

            if (!interaction.customId.startsWith("gw_join_")) return;

            const id = interaction.customId.split("_")[2];
            const data = client.giveaways.get(id);

            if (!data) {
                return interaction.reply({ content: "❌ Giveaway ended.", ephemeral: true });
            }

            if (data.participants.includes(interaction.user.id)) {
                return interaction.reply({ content: "⚠️ Already joined!", ephemeral: true });
            }

            data.participants.push(interaction.user.id);

            return interaction.reply({ content: "🎉 Joined successfully!", ephemeral: true });
        }
    });

    // =========================
    // END GIVEAWAY FUNCTION
    // =========================
    async function endGiveaway(client, id) {

        const data = client.giveaways.get(id);
        if (!data) return;

        const channel = await client.channels.fetch(data.channelId);

        let winnersText = "No participants";

        if (data.participants.length > 0) {

            const winners = [];

            for (let i = 0; i < data.winnersCount; i++) {
                const pick = data.participants[
                    Math.floor(Math.random() * data.participants.length)
                ];
                winners.push(`<@${pick}>`);
            }

            winnersText = winners.join(", ");
        }

        const embed = new EmbedBuilder()
            .setTitle("🏁 GIVEAWAY ENDED")
            .setDescription(
                `🎁 **Prize:** ${data.prize}\n` +
                `🏆 **Winners:** ${winnersText}`
            )
            .setColor("Red");

        channel.send({ embeds: [embed] });

        client.giveaways.delete(id);
    }
};
