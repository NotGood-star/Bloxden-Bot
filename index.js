client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  message.channel.send("✅ Bot is reading messages");
});
