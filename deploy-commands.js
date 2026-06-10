require("dotenv").config();
const fs = require("fs");
const { REST, Routes } = require("discord.js");

const commands = [];
const folders = fs.readdirSync("./commands");

for (const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`);

    for (const file of files) {
        const command = require(`./commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🚀 Deploying slash commands...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("✅ Commands deployed!");
    } catch (err) {
        console.log(err);
    }
})();
