const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const fs = require("fs");

// =========================
// SIMPLE DATABASE FILE
// =========================
const FILE = "./giveaways.json";

let db = fs.existsSync(FILE)
  ? JSON.parse(fs.readFileSync(FILE))
  : {};

const save = () => fs.writeFileSync(FILE, JSON.stringify(db, null, 2));

// =========================
// TIME PARSER
// =========================
function parseTime(t) {
  const m = t.match(/(\d+)(s|m|h)/);
  if (!m) return null;

  const n = parseInt(m[1]);
  if (m[2] === "s") return n * 1000;
  if (m[2] === "m") return n * 60 * 1000;
  if (m[2] === "h") return n * 60 * 60 * 1000;
}

// =========================
// MODULE
// =========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("🎁 Giveaway System")
    .addSubcommand(s =>
      s.setName("start")
        .addStringOption(o => o.setName("duration").setRequired(true))
        .addIntegerOption(o => o.setName("winners").setRequired(true))
        .addStringOption(o => o.setName("prize").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("end")
        .addStringOption(o => o.setName("id").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("reroll")
        .addStringOption(o => o.setName("id").setRequired(true))
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
      if (!ms) return interaction.reply({ content: "❌ Invalid time", ephemeral: true });

      const end = Date.now() + ms;

      const embed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY")
        .setColor("#a855f7")
        .setDescription(`
💎 Prize: **${prize}**
🏆 Winners: **${winners}**
⏰ Ends: <t:${Math.floor(end / 1000)}:R>

Press button to join!
        `);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("gw_join")
          .setLabel("Join")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("gw_leave")
          .setLabel("Leave")
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

      db[msg.id] = {
        channelId: interaction.channel.id,
        prize,
        winners,
        end,
        users: []
      };

      save();

      setTimeout(() => endGiveaway(client, msg.id), ms);

      return interaction.reply({ content: "✅ Giveaway started!", ephemeral: true });
    }

    // =========================
    // END
    // =========================
    if (sub === "end") {
      await endGiveaway(client, interaction.options.getString("id"));
      return interaction.reply({ content: "✅ Ended", ephemeral: true });
    }

    // =========================
    // REROLL
    // =========================
    if (sub === "reroll") {

      const id = interaction.options.getString("id");
      const g = db[id];

      if (!g) return interaction.reply({ content: "❌ Not found", ephemeral: true });

      const users = g.users;
      if (!users.length) return interaction.reply({ content: "❌ No users", ephemeral: true });

      const winner = users[Math.floor(Math.random() * users.length)];

      return interaction.reply(`🎉 New Winner: <@${winner}>`);
    }
  }
};

// =========================
// BUTTONS (JOIN / LEAVE)
// =========================
module.exports.buttonHandler = async (interaction) => {

  const g = db[interaction.message.id];
  if (!g) return;

  if (interaction.customId === "gw_join") {
    if (!g.users.includes(interaction.user.id)) {
      g.users.push(interaction.user.id);
      save();
    }

    return interaction.reply({ content: "🎉 Joined!", ephemeral: true });
  }

  if (interaction.customId === "gw_leave") {
    g.users = g.users.filter(u => u !== interaction.user.id);
    save();

    return interaction.reply({ content: "❌ Left", ephemeral: true });
  }
};

// =========================
// END GIVEAWAY
// =========================
async function endGiveaway(client, id) {

  const g = db[id];
  if (!g) return;

  const channel = await client.channels.fetch(g.channelId);
  const msg = await channel.messages.fetch(id).catch(() => null);

  if (!msg) return;

  const users = g.users;

  if (!users.length) {
    return channel.send("❌ No participants.");
  }

  const winners = [];

  for (let i = 0; i < g.winners; i++) {
    winners.push(users[Math.floor(Math.random() * users.length)]);
  }

  const embed = new EmbedBuilder()
    .setTitle("🎉 GIVEAWAY ENDED")
    .setColor("#a855f7")
    .setDescription(
      `🏆 Winners:\n${winners.map(w => `<@${w}>`).join("\n")}`
    );

  channel.send({ embeds: [embed] });

  delete db[id];
  save();
}
