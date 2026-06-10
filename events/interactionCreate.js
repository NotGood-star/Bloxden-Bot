module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.log(err);
            return interaction.reply({
                content: "❌ Error running command!",
                ephemeral: true
            });
        }
    }
};
