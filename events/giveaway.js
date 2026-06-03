const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

// =========================
// STORAGE (NO DATABASE)
// =========================
const giveaways = new Map();

// =========================
// MAIN EXPORT
// =========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("🎁 Ultimate Giveaway System")
    .addSubcommand(cmd =>
      cmd.setName("start")
        .setDescription("Start giveaway")
        .addStringOption(o => o.setName("duration").setRequired(true))
        .addIntegerOption(o => o.setName("winners").setRequired(true))
        .addStringOption(o => o.setName("prize").setRequired(true))
    )
    .addSubcommand(cmd =>
      cmd.setName("end")
        .setDescription("End giveaway")
        .addStringOption(o => o.setName("messageid").setRequired(true))
    )
    .addSubcommand(cmd =>
      cmd.setName("reroll")
        .setDescription("Reroll giveaway")
        .addStringOption(o => o.setName("messageid").setRequired(true))
    ),

  async execute(interaction, client) {

    const sub = interaction.options.getSubcommand();

    // =========================
    // START
    // =========================
    if (sub === "start") {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
      }

      const duration = interaction.options.getString("duration");
      const winners = interaction.options.getInteger("winners");
      const prize = interaction.options.getString("prize");

      const ms = parseTime(duration);
      if (!ms) return interaction.reply({ content: "❌ Invalid time format", ephemeral: true });

      const endTime = Date.now() + ms;

      const embed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY")
        .setColor("#a855f7")
        .setDescription(`
💎 **Prize:** ${prize}
🏆 **Winners:** ${winners}
⏰ **Ends:** <t:${Math.floor(endTime / 1000)}:R>

Click buttons below to participate!
        `)
        .setFooter({ text: "BloxDen Giveaways" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("gw_join")
          .setLabel("Join")
          .setStyle(ButtonStyle.Success)
          .setEmoji("🎉"),

        new ButtonBuilder()
          .setCustomId("gw_leave")
          .setLabel("Leave")
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

      giveaways.set(msg.id, {
        prize,
        winners,
        endTime,
        channelId: interaction.channel.id,
        participants: new Set()
      });

      setTimeout(() => endGiveaway(client, msg.id), ms);

      return interaction.reply({ content: "✅ Giveaway started!", ephemeral: true });
    }

    // =========================
    // END
    // =========================
    if (sub === "end") {

      const id = interaction.options.getString("messageid");
      await endGiveaway(client, id);

      return interaction.reply({ content: "✅ Ended", ephemeral: true });
    }

    // =========================
    // REROLL
    // =========================
    if (sub === "reroll") {

      const id = interaction.options.getString("messageid");

      const g = giveaways.get(id);
      if (!g) return interaction.reply({ content: "❌ Not found", ephemeral: true });

      const users = [...g.participants];
      if (!users.length) return interaction.reply({ content: "❌ No participants", ephemeral: true });

      const winner = users[Math.floor(Math.random() * users.length)];

      return interaction.reply(`🎉 New Winner: <@${winner}>`);
    }
  }
};

// =========================
// BUTTON SYSTEM (IMPORTANT)
// =========================
module.exports.buttonHandler = async (interaction) => {

  if (!interaction.isButton()) return;

  const g = giveaways.get(interaction.message.id);
  if (!g) return;

  // JOIN
  if (interaction.customId === "gw_join") {
    g.participants.add(interaction.user.id);

    return interaction.reply({
      content: "🎉 You joined the giveaway!",
      ephemeral: true
    });
  }

  // LEAVE
  if (interaction.customId === "gw_leave") {
    g.participants.delete(interaction.user.id);

    return interaction.reply({
      content: "❌ You left the giveaway",
      ephemeral: true
    });
  }
};

// =========================
// END GIVEAWAY
// =========================
async function endGiveaway(client, messageId) {

  const g = giveaways.get(messageId);
  if (!g) return;

  const channel = await client.channels.fetch(g.channelId);
  const msg = await channel.messages.fetch(messageId).catch(() => null);
  if (!msg) return;

  const users = [...g.participants];

  if (users.length === 0) {
    return channel.send("❌ No participants in giveaway.");
  }

  const winners = [];

  for (let i = 0; i < g.winners; i++) {
    const w = users[Math.floor(Math.random() * users.length)];
    winners.push(w);
  }

  const embed = new EmbedBuilder()
    .setTitle("🎉 GIVEAWAY ENDED")
    .setColor("#a855f7")
    .setDescription(`
💎 **Prize:** ${g.prize}

🏆 **Winner(s):**
${winners.map(w => `<@${w}>`).join("\n")}
    `);

  channel.send({ embeds: [embed] });

  giveaways.delete(messageId);
}

// =========================
// TIME PARSER
// =========================
function parseTime(str) {
  const match = str.match(/(\d+)(s|m|h)/);
  if (!match) return null;

  const num = parseInt(match[1]);
  const type = match[2];

  if (type === "s") return num * 1000;
  if (type === "m") return num * 60 * 1000;
  if (type === "h") return num * 60 * 60 * 1000;
}
