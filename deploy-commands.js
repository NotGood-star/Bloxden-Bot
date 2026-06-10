// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

// Load environment configurations from your hidden .env file
dotenv.config();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

// Read categories (e.g., moderation, economy, fun)
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    
    // Safety check to ensure we are scanning a directory, not a rogue file
    if (!fs.statSync(commandsPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        
        try {
            const command = require(filePath);
            
            // Validate that the command file exports the mandatory Discord structure
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`⚠️ [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (error) {
            // This prevents internal database paths from interrupting registration operations
            console.error(`❌ [ERROR] Could not load command file at ${filePath}:`, error.message);
        }
    }
}

// Instantiate the REST transmission engine with your bot token
const rest = new REST().setToken(process.env.TOKEN);

// Run the registration cycle
(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);
        
        // Push payload to Discord Global API
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        
        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('💥 Registration Failed:', error);
    }
})();
