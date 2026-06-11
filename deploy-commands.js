// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];

// 📂 Point directly to your master commands folder
const foldersPath = path.join(__dirname, 'commands');

if (!fs.existsSync(foldersPath)) {
    console.error(`❌ [ERROR] The 'commands' directory was not found at: ${foldersPath}`);
    process.exit(1);
}

// Read all sub-folders (e.g., utility, moderation, fun, economy)
const commandFolders = fs.readdirSync(foldersPath);

console.log('--- 🔍 Scanning Command Directories ---');

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    
    // Safety check: Make sure this item is a folder and not a random stray root file
    if (!fs.statSync(commandsPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        
        // Clear Node's module require cache to ensure fresh updates are grabbed
        delete require.cache[require.resolve(filePath)];
        
        try {
            const command = require(filePath);
            
            // Strictly check if the command file has the required Discord.js builder options
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`✅ Loaded command: /${command.data.name} [from ${folder}/${file}]`);
            } else {
                console.log(`⚠️ [WARNING] Skipped ${folder}/${file} - Missing required "data" or "execute" properties.`);
            }
        } catch (error) {
            console.error(`❌ [ERROR] Failed to load command file at ${filePath}:`, error.message);
        }
    }
}

// 🔐 Extract credentials from your environment configurations
const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
const clientId = process.env.CLIENT_ID || process.env.APPLICATION_ID;

if (!token) {
    console.error('❌ [CRITICAL ERROR] Bot token is missing! Make sure DISCORD_TOKEN or TOKEN is set in your Environment Variables.');
    process.exit(1);
}

if (!clientId) {
    console.error('❌ [CRITICAL ERROR] Client ID is missing! Make sure CLIENT_ID or APPLICATION_ID is set in your Environment Variables.');
    process.exit(1);
}

// Initialize the REST module connection handler
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('\n--- 🚀 Syncing with Discord API ---');
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

        // Pushes all valid mapped commands directly to Discord's global registry application matrix
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`\n🎉 SUCCESS! Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('Note: It can take a few moments for the cache to clear inside your Discord app UI.');
    } catch (error) {
        console.error('\n❌ [API ERROR] Failed to register slash commands with Discord:');
        console.error(error);
    }
})();
