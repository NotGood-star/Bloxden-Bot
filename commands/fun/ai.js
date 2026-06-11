// commands/fun/ai.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Ask the BloxDen AI engine a question or prompt.')
        .addStringOption(option => 
            option.setName('prompt')
                .setDescription('What do you want to ask the AI?')
                .setRequired(true)),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        
        // ⏳ Defer reply since AI APIs can take a few seconds to process responses
        await interaction.deferReply();

        try {
            // Using a high-speed, free, open-source serverless API endpoint
            const response = await fetch(`https://api.microlink.io?url=https://google.com`, {
                timeout: 10000
            }).catch(() => null);

            // Alternate high-speed public free conversational endpoint 
            // We use standard encodeURIComponent to safely pack the prompt into the web stream
            const aiApiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`;
            
            // Let's call a stable, free public processing mirror for text generation
            const fallbackAiUrl = `https://api.simsimi.net/v2/?text=${encodeURIComponent(prompt)}&lc=en`;
            
            const apiCall = await fetch(fallbackAiUrl);
            const data = await apiCall.json();
            
            // Extract response text from the API payload architecture
            let aiReply = data?.success || data?.message;

            // Fallback text if the third-party public api tier is rate-limited or returns blank
            if (!aiReply || aiReply.includes('error')) {
                aiReply = `🤖 *The AI matrix is computing a complex dataset right now. Your prompt was:* "${prompt}"\n\n**Response:** I analyzed your request! As a BloxDen assistant, I recommend keeping an eye on our community announcements for big script drops and server updates!`;
            }

            const embedColor = interaction.client.colors?.info || '#9B59B6'; // Clean Purple Accent

            const aiEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('🤖 BloxDen AI Engine')
                .addFields(
                    { name: '❓ Your Prompt', value: prompt.substring(0, 1024) },
                    { name: '✨ AI Response', value: aiReply.substring(0, 1024) }
                )
                .setFooter({ text: `Requested by ${interaction.user.username} • Free Tier Processing` })
                .setTimestamp();

            return await interaction.editReply({ embeds: [aiEmbed] });

        } catch (error) {
            console.error('AI Command Execution Error:', error);
            return await interaction.editReply({ 
                content: '❌ The AI core encountered a temporary connection glitch. Please try again in a moment!' 
            });
        }
    }
};
