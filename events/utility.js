const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;

    try {

      // 🏓 Ping (utility version)
      if (cmd === "ping") {
        const msg = await interaction.reply({ content: "🏓 Checking ping...", fetchReply: true });
        const latency = msg.createdTimestamp - interaction.createdTimestamp;

        return interaction.editReply(`🏓 Pong! **${latency}ms**`);
      }

      // 👤 User Info
      if (cmd === "userinfo") {
        const user = interaction.user;

        return interaction.reply({
          content:
            `👤 **User Info**\n` +
            `Name: **${user.username}**\n` +
            `ID: **${user.id}**\n` +
            `Created: <t:${Math.floor(user.createdTimestamp / 1000)}:R>`
        });
      }

      // 🖼️ Avatar
      if (cmd === "avatar") {
        const user = interaction.user;

        return interaction.reply({
          content: `🖼️ ${user.displayAvatarURL({ dynamic: true, size: 512 })}`
        });
      }

      // 🏠 Server Info
      if (cmd === "serverinfo") {
        const guild = interaction.guild;

        return interaction.reply({
          content:
            `🏠 **Server Info**\n` +
            `Name: **${guild.name}**\n` +
            `Members: **${guild.memberCount}**\n` +
            `ID: **${guild.id}**`
        });
      }

      // 📊 Bot Info
      if (cmd === "botinfo") {
        return interaction.reply({
          content:
            `🤖 **Bot Info**\n` +
            `Developer: You\n` +
            `Bot Name: BloxDen Bot\n` +
            `Library: Discord.js`
        });
      }

    } catch (err) {
      console.error("Utility Command Error:", err);

      return interaction.reply({
        content: "❌ Something went wrong in Utility commands!",
        ephemeral: true
      });
    }
  }
};
