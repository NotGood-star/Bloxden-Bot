const fs = require("fs");

module.exports = (client) => {
    const folders = fs.readdirSync("./commands");

    for (const folder of folders) {
        const files = fs.readdirSync(`./commands/${folder}`);

        for (const file of files) {
            const command = require(`../commands/${folder}/${file}`);
            client.commands.set(command.data.name, command);
        }
    }
};
