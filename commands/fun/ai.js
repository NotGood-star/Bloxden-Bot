const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ai")
        .setDescription("Ask BloxDen AI anything.")
        .addStringOption(option =>
            option
                .setName("prompt")
                .setDescription("What do you want to ask?")
                .setRequired(true)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString("prompt");

        await interaction.deferReply();

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash"
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let aiReply = response.text();

            if (!aiReply) {
                aiReply = "I couldn't generate a response.";
            }

            if (aiReply.length > 1024) {
                aiReply = aiReply.substring(0, 1021) + "...";
            }

            const embed = new EmbedBuilder()
                .setColor("#9B59B6")
                .setTitle("🤖 BloxDen AI")
                .addFields(
                    {
                        name: "❓ Your Prompt",
                        value: prompt.length > 1024
                            ? prompt.substring(0, 1021) + "..."
                            : prompt
                    },
                    {
                        name: "✨ AI Response",
                        value: aiReply
                    }
                )
                .setFooter({
                    text: `Requested by ${interaction.user.username}`
                })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {
            console.error("Gemini AI Error:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ AI Error")
                .setDescription(
                    "The AI service is currently unavailable. Please try again later."
                )
                .setTimestamp();

            await interaction.editReply({
                embeds: [errorEmbed]
            });
        }
    }
};
