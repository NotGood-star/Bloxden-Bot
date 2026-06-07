const fs = require("fs");

const {
    EmbedBuilder,
    PermissionsBitField,
    ChannelType
} = require("discord.js");

module.exports = (client) => {

/* ========================= */
/* AUTOMOD DATABASE */
/* ========================= */

let automod = {};

if (fs.existsSync("./automod.json")) {

    automod = JSON.parse(
        fs.readFileSync("./automod.json")
    );

}

/* ========================= */
/* AUDIT LOG DATABASE */
/* ========================= */

let auditLogs = [];

if (fs.existsSync("./auditlogs.json")) {

    auditLogs = JSON.parse(
        fs.readFileSync("./auditlogs.json")
    );

}

/* ========================= */
/* SAVE AUTOMOD */
/* ========================= */

function saveAutomod() {

    fs.writeFileSync(
        "./automod.json",
        JSON.stringify(
            automod,
            null,
            2
        )
    );

}

/* ========================= */
/* SAVE AUDIT LOGS */
/* ========================= */

function saveAuditLogs() {

    fs.writeFileSync(
        "./auditlogs.json",
        JSON.stringify(
            auditLogs,
            null,
            2
        )
    );

}

/* ========================= */
/* ADD AUDIT LOG */
/* ========================= */

function addLog(
    guildId,
    moderator,
    action,
    target,
    reason
) {

    auditLogs.push({

        guildId,

        moderator,

        action,

        target,

        reason,

        timestamp:
            Date.now()

    });

    saveAuditLogs();

}

/* ========================= */
/* EMBED HELPER */
/* ========================= */

function createEmbed(
    title,
    description,
    color
) {

    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();

}

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on(
    "interactionCreate",
    async interaction => {

        if (
            !interaction.isChatInputCommand()
        ) return;
