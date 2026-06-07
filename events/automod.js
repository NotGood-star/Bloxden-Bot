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

/* ========================= */
/* /AUTOMOD SETUP */
/* ========================= */

if (
    interaction.commandName ===
    "automod"
) {

    const logChannel =
        interaction.options.getChannel(
            "logchannel"
        );

    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags
                .Administrator
        )
    ) {

        return interaction.reply({
            embeds: [
                createEmbed(
                    "❌ Missing Permission",
                    "Administrator permission required.",
                    "#ED4245"
                )
            ],
            ephemeral: true
        });

    }

    automod[
        interaction.guild.id
    ] = {

        enabled: true,

        logChannel:
            logChannel.id,

        antiSpam: true,

        antiLinks: true,

        antiInvites: true,

        antiCaps: true,

        mentionSpam: true

    };

    saveAutomod();

    return interaction.reply({
        embeds: [
            createEmbed(
                "🛡 AutoMod Enabled",
                `✅ Anti Spam\n✅ Anti Links\n✅ Anti Invites\n✅ Anti Caps\n✅ Mention Spam\n\n📜 Log Channel: ${logChannel}`,
                "#57F287"
            )
        ]
    });

}

/* ========================= */
/* /MUTE */
/* ========================= */

if (
    interaction.commandName ===
    "mute"
) {

    const target =
        interaction.options.getMember(
            "user"
        );

    const duration =
        interaction.options.getInteger(
            "minutes"
        );

    const reason =
        interaction.options.getString(
            "reason"
        ) || "No reason provided";

    if (!target) {

        return interaction.reply({
            embeds: [
                createEmbed(
                    "❌ User Not Found",
                    "Could not find that member.",
                    "#ED4245"
                )
            ],
            ephemeral: true
        });

    }

    await target.timeout(
        duration * 60 * 1000,
        reason
    );

    addLog(
        interaction.guild.id,
        interaction.user.tag,
        "Mute",
        target.user.tag,
        reason
    );

    return interaction.reply({
        embeds: [
            createEmbed(
                "🔇 Member Muted",
                `👤 User: ${target}

⏱ Duration: ${duration} minute(s)

📝 Reason: ${reason}`,
                "#ED4245"
            )
        ]
    });

}

/* ========================= */
/* /UNMUTE */
/* ========================= */

if (
    interaction.commandName ===
    "unmute"
) {

    const target =
        interaction.options.getMember(
            "user"
        );

    if (!target) {

        return interaction.reply({
            embeds: [
                createEmbed(
                    "❌ User Not Found",
                    "Could not find that member.",
                    "#ED4245"
                )
            ],
            ephemeral: true
        });

    }

    await target.timeout(null);

    addLog(
        interaction.guild.id,
        interaction.user.tag,
        "Unmute",
        target.user.tag,
        "Timeout Removed"
    );

    return interaction.reply({
        embeds: [
            createEmbed(
                "🔊 Member Unmuted",
                `👤 User: ${target}

🛡 Moderator: ${interaction.user}`,
                "#57F287"
            )
        ]
    });

}

/* ========================= */
/* /SLOWMODE */
/* ========================= */

if (
    interaction.commandName ===
    "slowmode"
) {

    const seconds =
        interaction.options.getInteger(
            "seconds"
        );

    await interaction.channel.setRateLimitPerUser(
        seconds
    );

    addLog(
        interaction.guild.id,
        interaction.user.tag,
        "Slowmode",
        interaction.channel.name,
        `${seconds}s`
    );

    return interaction.reply({
        embeds: [
            createEmbed(
                "🐢 Slowmode Updated",
                `#️⃣ Channel: ${interaction.channel}

⏱ Slowmode: ${seconds} second(s)`,
                "#5865F2"
            )
        ]
    });

}

/* ========================= */
/* /LOCK */
/* ========================= */

if (
    interaction.commandName ===
    "lock"
) {

    await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
            SendMessages: false
        }
    );

    addLog(
        interaction.guild.id,
        interaction.user.tag,
        "Lock",
        interaction.channel.name,
        "Channel Locked"
    );

    return interaction.reply({
        embeds: [
            createEmbed(
                "🔒 Channel Locked",
                `${interaction.channel} has been locked.`,
                "#ED4245"
            )
        ]
    });

}

/* ========================= */
/* /UNLOCK */
/* ========================= */

if (
    interaction.commandName ===
    "unlock"
) {

    await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
            SendMessages: null
        }
    );

    addLog(
        interaction.guild.id,
        interaction.user.tag,
        "Unlock",
        interaction.channel.name,
        "Channel Unlocked"
    );

    return interaction.reply({
        embeds: [
            createEmbed(
                "🔓 Channel Unlocked",
                `${interaction.channel} has been unlocked.`,
                "#57F287"
            )
        ]
    });

}

/* ========================= */
/* /AUDITLOG */
/* ========================= */

if (
    interaction.commandName ===
    "auditlog"
) {

    const data =
        auditLogs.filter(
            log =>
                log.guildId ===
                interaction.guild.id
        );

    if (data.length === 0) {

        return interaction.reply({
            embeds: [
                createEmbed(
                    "📜 Audit Logs",
                    "No logs found for this server.",
                    "#FEE75C"
                )
            ],
            ephemeral: true
        });

    }

    const logsText = data
        .slice(-10)
        .map(
            log =>
                `**${log.action}**\n👤 ${log.target}\n🛡 ${log.moderator}\n📝 ${log.reason}\n⏰ <t:${Math.floor(log.timestamp / 1000)}:R>`
        )
        .join("\n\n");

    return interaction.reply({
        embeds: [
            createEmbed(
                "📜 Audit Logs",
                logsText,
                "#5865F2"
            )
        ],
        ephemeral: true
    });

}
