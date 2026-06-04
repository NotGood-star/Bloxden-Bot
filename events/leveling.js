const fs = require("fs");

module.exports = (client) => {

/* ========================= */
/* DATABASE */
/* ========================= */

let data = {
    users: {},
    guilds: {}
};

if (fs.existsSync("levels.json")) {
    data = JSON.parse(fs.readFileSync("levels.json"));
}

/* ========================= */
/* SAVE SYSTEM (OPTIMIZED) */
/* ========================= */

let saving = false;

function saveData() {
    if (saving) return;

    saving = true;

    setTimeout(() => {
        fs.writeFileSync("levels.json", JSON.stringify(data, null, 2));
        saving = false;
    }, 5000);
}

/* ========================= */
/* CREATE USER */
/* ========================= */

function createUser(guildId, userId) {

    if (!data.users[guildId]) data.users[guildId] = {};
    if (!data.users[guildId][userId]) {

        data.users[guildId][userId] = {
            xp: 0,
            level: 1,
            lastMessage: 0
        };

    }
}

/* ========================= */
/* CREATE GUILD */
/* ========================= */

function createGuild(guildId) {

    if (!data.guilds[guildId]) {
        data.guilds[guildId] = {
            levelChannel: null
        };
    }
}

/* ========================= */
/* XP CALC (ARCANE STYLE CURVE) */
/* ========================= */

function requiredXP(level) {
    return level * level * 100;
}

/* ========================= */
/* MESSAGE XP SYSTEM */
/* ========================= */

client.on("messageCreate", async (message) => {

    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    createUser(guildId, userId);
    createGuild(guildId);

    const user = data.users[guildId][userId];

    /* ========================= */
    /* COOLDOWN (ANTI SPAM) */
    /* ========================= */

    const now = Date.now();
    if (now - user.lastMessage < 60000) return; // 60 sec cooldown

    user.lastMessage = now;

    /* ========================= */
    /* XP GAIN */
    /* ========================= */

    const xpGain = Math.floor(Math.random() * 15) + 10;
    user.xp += xpGain;

    /* ========================= */
    /* LEVEL UP CHECK */
    /* ========================= */

    const needed = requiredXP(user.level);

    if (user.xp >= needed) {

        user.level++;
        user.xp = 0;

        const channelId = data.guilds[guildId].levelChannel;
        const levelChannel = message.guild.channels.cache.get(channelId);

        const embed = {
            title: "🎉 Level Up!",
            description: `${message.author} reached **Level ${user.level}**`,
            color: 0x00ff00
        };

        if (levelChannel) {
            levelChannel.send({ embeds: [embed] });
        } else {
            message.channel.send({ embeds: [embed] });
        }
    }

    saveData();
});

/* ========================= */
/* INTERACTIONS */
/* ========================= */

client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    createUser(guildId, userId);
    createGuild(guildId);

    const user = data.users[guildId][userId];

    try {

        /* ========================= */
        /* RANK COMMAND (ARCANE STYLE CARD) */
        /* ========================= */

        if (interaction.commandName === "rank") {

            const needed = requiredXP(user.level);

            const embed = {
                title: `🏆 ${interaction.user.username}'s Rank Card`,
                color: 0x00c3ff,
                fields: [
                    {
                        name: "🎖 Level",
                        value: `${user.level}`,
                        inline: true
                    },
                    {
                        name: "⭐ XP",
                        value: `${user.xp}`,
                        inline: true
                    },
                    {
                        name: "📊 Progress",
                        value: `${user.xp} / ${needed}`,
                        inline: false
                    }
                ],
                footer: {
                    text: "Arcane Style Level System"
                }
            };

            return interaction.reply({ embeds: [embed] });
        }

        /* ========================= */
        /* LEADERBOARD (TOP 10 ARCANE STYLE) */
        /* ========================= */

        if (interaction.commandName === "leaderboard") {

            const guildUsers = data.users[guildId] || {};

            const sorted = Object.entries(guildUsers)
                .sort((a, b) => b[1].level - a[1].level)
                .slice(0, 10);

            let desc = "";

            for (let i = 0; i < sorted.length; i++) {

                let name = "Unknown";

                try {
                    const u = await client.users.fetch(sorted[i][0]);
                    name = u.username;
                } catch {}

                desc += `**${i + 1}.** ${name} — Level ${sorted[i][1].level}\n`;
            }

            const embed = {
                title: "🏆 BloxDen Leaderboard",
                description: desc || "No data available",
                color: 0xffd700,
                footer: {
                    text: "Top 10 Players"
                }
            };

            return interaction.reply({ embeds: [embed] });
        }

        /* ========================= */
        /* SET LEVEL CHANNEL */
        /* ========================= */

        if (interaction.commandName === "setlevelchannel") {

            if (!interaction.member.permissions.has("Administrator")) {
                return interaction.reply({
                    content: "❌ You need Administrator permission",
                    ephemeral: true
                });
            }

            const channel = interaction.options.getChannel("channel");

            data.guilds[guildId].levelChannel = channel.id;

            saveData();

            return interaction.reply(`✅ Level channel set to ${channel}`);
        }

        /* ========================= */
        /* XP ADD */
        /* ========================= */

        if (interaction.commandName === "xpadd") {

            if (!interaction.member.permissions.has("Administrator")) {
                return interaction.reply({
                    content: "❌ You need Administrator permission",
                    ephemeral: true
                });
            }

            const target = interaction.options.getUser("user");
            const amount = interaction.options.getInteger("amount");

            createUser(guildId, target.id);

            data.users[guildId][target.id].xp += amount;

            saveData();

            return interaction.reply(`✅ Added ${amount} XP to ${target.username}`);
        }

        /* ========================= */
        /* XP REMOVE */
        /* ========================= */

        if (interaction.commandName === "xpremove") {

            if (!interaction.member.permissions.has("Administrator")) {
                return interaction.reply({
                    content: "❌ You need Administrator permission",
                    ephemeral: true
                });
            }

            const target = interaction.options.getUser("user");
            const amount = interaction.options.getInteger("amount");

            createUser(guildId, target.id);

            data.users[guildId][target.id].xp -= amount;

            if (data.users[guildId][target.id].xp < 0) {
                data.users[guildId][target.id].xp = 0;
            }

            saveData();

            return interaction.reply(`✅ Removed ${amount} XP from ${target.username}`);
        }

    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: "❌ Something went wrong in leveling system",
            ephemeral: true
        });
    }
});

};
