const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('BloxDen Online'));
app.listen(process.env.PORT || 10000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => console.log(`🚀 Online: ${client.user.tag}`));

client.on('messageCreate', async message => {
    if (message.author.bot || !message.mentions.has(client.user.id)) return;
    await message.channel.sendTyping();

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim() || "Yo, what's good?";

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }] })
        });

        const data = await response.json();
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Yo, Google isn't responding. Check your API key at Google AI Studio.";

        // THE CLEAN EMBED FORMAT
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setAuthor({ name: 'BloxDen Buddy Core', iconURL: client.user.displayAvatarURL() })
            .setDescription(aiResponse.substring(0, 4000))
            .setFooter({ text: `Replying to ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        await message.reply("My circuits are fried, check the logs bro!");
    }
});

client.login(process.env.TOKEN);
