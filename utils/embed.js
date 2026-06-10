const { EmbedBuilder } = require("discord.js");

module.exports = (client, data = {}) => {
    return new EmbedBuilder()
        .setColor(data.color || "#00AEEF")
        .setTitle(data.title || "")
        .setDescription(data.description || " ")
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
            text: "BloxDen Bot",
            iconURL: client.user.displayAvatarURL()
        });
};
