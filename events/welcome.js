const fs = require("fs");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let welcomeData = {};

if (fs.existsSync("welcome.json")) {
  welcomeData = JSON.parse(fs.readFileSync("welcome.json", "utf8"));
}

/* ========================= */
/* SAVE FUNCTION */
/* ========================= */

function saveData() {
  fs.writeFileSync("welcome.json", JSON.stringify(welcomeData, null, 2));
}

/* ========================= */
/* INIT GUILD */
/* ========================= */

function createGuild(id) {
  if (!welcomeData[id]) {
    welcomeData[id] = {
      welcomeChannel: null,
      goodbyeChannel: null
    };
  }
}

/* ========================= */
/* MEMBER JOIN (WELCOME) */
/* ========================= */

client.on("guildMemberAdd", async (member) => {

  createGuild(member.guild.id);

  const channelId = welcomeData[member.guild.id].welcomeChannel;
  if (!channelId) return;

  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("👋 Welcome to the Server!")
    .setDescription(`Hey ${member}, welcome to **${member.guild.name}** 🎉`)
    .addFields(
      { name: "👥 Members", value: `${member.guild.memberCount}`, inline: true },
      { name: "📜 Rule Reminder", value: "Please read rules & enjoy!", inline: false }
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: "We’re happy to have you here!" });

  channel.send({ embeds: [embed] });
});

/* ========================= */
/* MEMBER LEAVE (GOODBYE) */
/* ========================= */

client.on("guildMemberRemove", async (member) => {

  createGuild(member.guild.id);

  const channelId = welcomeData[member.guild.id].goodbyeChannel;
  if (!channelId) return;

  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("👋 Member Left")
    .setDescription(`**${member.user.tag}** left the server 😢`)
    .addFields(
      { name: "👥 Current Members", value: `${member.guild.memberCount}`, inline: true }
    )
    .setFooter({ text: "We hope they come back!" });

  channel.send({ embeds: [embed] });
});

/* ========================= */
/* INTERACTION COMMANDS */
/* ========================= */

client.on("interactionCreate", async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  try {

    /* ========================= */
    /* SET WELCOME CHANNEL */
    /* ========================= */

    if (interaction.commandName === "welcomesetchannel") {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
          content: "❌ You need Administrator permission",
          ephemeral: true
        });
      }

      const channel = interaction.options.getChannel("channel");

      createGuild(interaction.guild.id);
      welcomeData[interaction.guild.id].welcomeChannel = channel.id;
      saveData();

      return interaction.reply(`✅ Welcome channel set to ${channel}`);
    }

    /* ========================= */
    /* SET GOODBYE CHANNEL */
    /* ========================= */

    if (interaction.commandName === "goodbyesetchannel") {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
          content: "❌ You need Administrator permission",
          ephemeral: true
        });
      }

      const channel = interaction.options.getChannel("channel");

      createGuild(interaction.guild.id);
      welcomeData[interaction.guild.id].goodbyeChannel = channel.id;
      saveData();

      return interaction.reply(`✅ Goodbye channel set to ${channel}`);
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ System error occurred",
        ephemeral: true
      });
    }
  }
});

/* ========================= */
/* AUTO SAVE SAFETY */
/* ========================= */

process.on("exit", saveData);
process.on("SIGINT", saveData);
process.on("SIGTERM", saveData);

};
