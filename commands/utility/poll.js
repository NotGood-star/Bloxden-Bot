const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a structured multiple-choice poll with auto-reactions')
        .addStringOption(opt => opt.setName('question').setDescription('The query you want answered').setRequired(true))
        .addStringOption(opt => opt.setName('option1').setDescription('Choice A').setRequired(true))
        .addStringOption(opt => opt.setName('option2').setDescription('Choice B').setRequired(true))
        .addStringOption(opt => opt.setName('option3').setDescription('Choice C').setRequired(false))
        .addStringOption(opt => opt.setName('option4').setDescription('Choice D').setRequired(false)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const op1 = interaction.options.getString('option1');
        const op2 = interaction.options.getString('option2');
        const op3 = interaction.options.getString('option3');
        const op4 = interaction.options.getString('option4');

        const embed = new EmbedBuilder()
            .setTitle(`📊 Community Poll: ${question}`)
            .setColor('#3498DB')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        let desc = `1️⃣ ${op1}\n\n2️⃣ ${op2}`;
        if (op3) desc += `\n\n3️⃣ ${op3}`;
        if (op4) desc += `\n\n4️⃣ ${op4}`;

        embed.setDescription(desc);

        const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
        
        await pollMessage.react('1️⃣');
        await pollMessage.react('2️⃣');
        if (op3) await pollMessage.react('3️⃣');
        if (op4) await pollMessage.react('4️⃣');
    }
};
