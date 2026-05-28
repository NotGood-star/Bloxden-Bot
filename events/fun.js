const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;

    try {

      // 🏓 Ping
      if (cmd === "ping") {
        const msg = await interaction.reply({ content: "🏓 Pinging...", fetchReply: true });
        const latency = msg.createdTimestamp - interaction.createdTimestamp;
        return interaction.editReply(`🏓 Pong! **${latency}ms**`);
      }

      // 📚 Help (Fun section)
      if (cmd === "help") {
        return interaction.reply({
          content:
            `🎮 **Fun Commands**\n\n` +
            `🏓 /ping - Check bot speed\n` +
            `😂 /joke - Random joke\n` +
            `🧠 /funfact - Random fact\n` +
            `🎲 /dice - Roll a dice\n` +
            `🪙 /coinflip - Heads or Tails\n` +
            `✨ /quote - Motivational quote`
        });
      }

      // 😂 Joke
      if (cmd === "joke") {
        const jokes = [
          "Why did the bot cross the road? To debug the other side!",
          "I told my code a joke... but it didn't laugh 😂",
          "Why do programmers prefer dark mode? Because light attracts bugs!"
        ];
        return interaction.reply(`😂 ${jokes[Math.floor(Math.random() * jokes.length)]}`);
      }

      // 🧠 Fun Fact
      if (cmd === "funfact") {
        const facts = [
          "Octopuses have three hearts 🐙",
          "Honey never spoils 🍯",
          "Bananas are berries, strawberries are not 🍌",
          "Sharks existed before trees 🦈"
        ];
        return interaction.reply(`🧠 ${facts[Math.floor(Math.random() * facts.length)]}`);
      }

      // 🎲 Dice
      if (cmd === "dice") {
        const roll = Math.floor(Math.random() * 6) + 1;
        return interaction.reply(`🎲 You rolled **${roll}**`);
      }

      // 🪙 Coinflip
      if (cmd === "coinflip") {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        return interaction.reply(`🪙 Result: **${result}**`);
      }

      // ✨ Quote
      if (cmd === "quote") {
        const quotes = [
          "Stay hungry, stay foolish.",
          "Code is like humor. When you have to explain it, it’s bad.",
          "Fix the cause, not the symptom.",
          "Dream big. Start small. Act now."
        ];
        return interaction.reply(`✨ "${quotes[Math.floor(Math.random() * quotes.length)]}"`);
      }

    } catch (err) {
      console.error("Fun Command Error:", err);
      return interaction.reply({
        content: "❌ Something went wrong in Fun commands!",
        ephemeral: true
      });
    }
  }
};
