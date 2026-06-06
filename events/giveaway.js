const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");

module.exports = (client) => {

const FILE = "./giveaways.json";

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({}));
}

function loadData() {
  return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function parseTime(input) {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;

  const value = Number(match[1]);

  switch (match[2].toLowerCase()) {
    case "s": return value * 1000;
    case "m": return value * 60000;
    case "h": return value * 3600000;
    case "d": return value * 86400000;
  }
}

async function endGiveaway(id) {

  const giveaways = loadData();
  const g = giveaways[id];

  if (!g || g.ended) return;

  g.ended = true;

  const channel =
    await client.channels.fetch(g.channelId).catch(() => null);

  if (!channel) return;

  let winnersText = "No valid entries.";

  if (g.entries.length > 0) {

    const shuffled =
      [...g.entries].sort(() => Math.random() - 0.5);

    const winners =
      shuffled.slice(0, g.winners);

    winnersText =
      winners.map(id => `<@${id}>`).join(", ");
  }

  const embed = new EmbedBuilder()
    .setColor("#57F287")
    .setTitle("<a:gift:ID> Giveaway Ended")
    .setDescription(
`🏆 Prize: **${g.prize}**

🎉 Winner(s):
${winnersText}

👥 Entries: **${g.entries.length}**`
    )
    .setTimestamp();

  await channel.send({
    embeds: [embed]
  });

  saveData(giveaways);
}

function scheduleGiveaway(id) {

  const giveaways = loadData();
  const g = giveaways[id];

  if (!g || g.ended) return;

  const remaining =
    g.endsAt - Date.now();

  if (remaining <= 0) {
    endGiveaway(id);
    return;
  }

  setTimeout(() => {
    endGiveaway(id);
  }, remaining);
}

const giveaways = loadData();

for (const id in giveaways) {
  scheduleGiveaway(id);
}

client.on("interactionCreate", async interaction => {

  if (interaction.isButton()) {

    if (!interaction.customId.startsWith("giveaway_"))
      return;

    const giveawayId =
      interaction.customId.replace("giveaway_", "");

    const giveaways = loadData();
    const g = giveaways[giveawayId];

    if (!g || g.ended) {

      return interaction.reply({
        content: "❌ Giveaway ended.",
        ephemeral: true
      });

    }

    if (g.entries.includes(interaction.user.id)) {

      return interaction.reply({
        content: "⚠️ You already joined.",
        ephemeral: true
      });

    }

    g.entries.push(interaction.user.id);

    saveData(giveaways);

    return interaction.reply({
      content: "🎉 Giveaway joined!",
      ephemeral: true
    });

  }

  if (!interaction.isChatInputCommand()) return;

  const admin =
    interaction.memberPermissions.has(
      PermissionFlagsBits.Administrator
    );

  const cmd = interaction.commandName;

  if (
    ["gstart","gend","greroll","gdelete"]
    .includes(cmd) &&
    !admin
  ) {

    return interaction.reply({
      content: "❌ Administrator only.",
      ephemeral: true
    });

  }

  /* ===================== */
  /* GSTART */
  /* ===================== */

  if (cmd === "gstart") {

    const prize =
      interaction.options.getString("prize");

    const duration =
      interaction.options.getString("duration");

    const winners =
      interaction.options.getInteger("winners");

    const ms = parseTime(duration);

    if (!ms) {

      return interaction.reply({
        content:
          "❌ Use 10s, 5m, 1h, 1d",
        ephemeral: true
      });

    }

    const giveawayId =
      Date.now().toString();

    const endTime =
      Date.now() + ms;

    const button =
      new ButtonBuilder()
      .setCustomId(
        `giveaway_${giveawayId}`
      )
      .setLabel("🎉 Join Giveaway")
      .setStyle(ButtonStyle.Success);

    const row =
      new ActionRowBuilder()
      .addComponents(button);

    const embed =
      new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("<a:gift:ID> Giveaway")
      .setDescription(
`🏆 Prize: **${prize}**

👑 Winners: **${winners}**

⏰ Ends:
<t:${Math.floor(endTime / 1000)}:R>

🎟️ Entries: **0**`
      )
      .setFooter({
        text:
          `Hosted by ${interaction.user.username}`
      });

    const msg =
      await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
      });

    const giveaways = loadData();

    giveaways[giveawayId] = {
      id: giveawayId,
      prize,
      winners,
      channelId: interaction.channel.id,
      messageId: msg.id,
      entries: [],
      ended: false,
      endsAt: endTime
    };

    saveData(giveaways);

    scheduleGiveaway(giveawayId);
  }

  /* ===================== */
  /* GEND */
  /* ===================== */

  if (cmd === "gend") {

    const id =
      interaction.options.getString("id");

    await endGiveaway(id);

    return interaction.reply({
      content: "✅ Giveaway ended.",
      ephemeral: true
    });

  }

  /* ===================== */
  /* GREROLL */
  /* ===================== */

  if (cmd === "greroll") {

    const id =
      interaction.options.getString("id");

    const giveaways = loadData();
    const g = giveaways[id];

    if (!g) {

      return interaction.reply({
        content: "❌ Giveaway not found.",
        ephemeral: true
      });

    }

    if (!g.entries.length) {

      return interaction.reply({
        content: "❌ No entries.",
        ephemeral: true
      });

    }

    const winner =
      g.entries[
        Math.floor(
          Math.random() * g.entries.length
        )
      ];

    const embed =
      new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("🔄 Giveaway Rerolled")
      .setDescription(
`🏆 Prize: **${g.prize}**

🎉 Winner:
<@${winner}>`
      );

    return interaction.reply({
      embeds: [embed]
    });

  }

  /* ===================== */
  /* GLIST */
  /* ===================== */

  if (cmd === "glist") {

    const giveaways = loadData();

    const active =
      Object.values(giveaways)
      .filter(g => !g.ended);

    const embed =
      new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("<a:gift:ID> Active Giveaways")
      .setDescription(
        active.length
          ? active.map(g =>
              `🏆 ${g.prize}\nID: \`${g.id}\`\n👥 ${g.entries.length} entries`
            ).join("\n\n")
          : "No active giveaways."
      );

    return interaction.reply({
      embeds: [embed]
    });

  }

  /* ===================== */
  /* GINFO */
  /* ===================== */

  if (cmd === "ginfo") {

    const id =
      interaction.options.getString("id");

    const giveaways = loadData();
    const g = giveaways[id];

    if (!g) {

      return interaction.reply({
        content: "❌ Giveaway not found.",
        ephemeral: true
      });

    }

    const embed =
      new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📊 Giveaway Info")
      .addFields(
        {
          name: "Prize",
          value: g.prize
        },
        {
          name: "Entries",
          value: String(g.entries.length)
        },
        {
          name: "Winners",
          value: String(g.winners)
        },
        {
          name: "Ended",
          value: String(g.ended)
        }
      );

    return interaction.reply({
      embeds: [embed]
    });

  }

  /* ===================== */
  /* GDELETE */
  /* ===================== */

  if (cmd === "gdelete") {

    const id =
      interaction.options.getString("id");

    const giveaways = loadData();

    if (!giveaways[id]) {

      return interaction.reply({
        content: "❌ Giveaway not found.",
        ephemeral: true
      });

    }

    delete giveaways[id];

    saveData(giveaways);

    return interaction.reply({
      content: "🗑️ Giveaway deleted.",
      ephemeral: true
    });

  }

});

};;
