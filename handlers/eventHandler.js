const fs = require("fs");

module.exports = (client) => {
    const eventFolders = fs.readdirSync("./events");

    for (const file of eventFolders) {
        const event = require(`../events/${file}`);

        if (event.once) {
            client.once(event.name, (...args) =>
                event.execute(...args, client)
            );
        } else {
            client.on(event.name, (...args) =>
                event.execute(...args, client)
            );
        }
    }
};
