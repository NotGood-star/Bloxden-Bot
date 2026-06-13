// database.js
const fs = require('fs');
const path = './database.json';

// --- 1. CORE DATA MAPS (Memory) ---
const balances = new Map();
const userJobs = new Map();
const inventories = new Map();
const xp = new Map();
const levels = new Map();
const systemChannels = new Map();

// --- 2. PERSISTENCE LOGIC (File I/O) ---
function saveDatabase() {
    const data = {
        balances: Object.fromEntries(balances),
        userJobs: Object.fromEntries(userJobs),
        inventories: Object.fromEntries(inventories),
        xp: Object.fromEntries(xp),
        levels: Object.fromEntries(levels),
        systemChannels: Object.fromEntries(systemChannels)
    };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function loadDatabase() {
    if (!fs.existsSync(path)) return;
    try {
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        
        // Load data into Maps
        Object.entries(data.balances || {}).forEach(([k, v]) => balances.set(k, v));
        Object.entries(data.userJobs || {}).forEach(([k, v]) => userJobs.set(k, v));
        Object.entries(data.inventories || {}).forEach(([k, v]) => inventories.set(k, v));
        Object.entries(data.xp || {}).forEach(([k, v]) => xp.set(k, v));
        Object.entries(data.levels || {}).forEach(([k, v]) => levels.set(k, v));
        Object.entries(data.systemChannels || {}).forEach(([k, v]) => systemChannels.set(k, v));
        
        console.log('✅ Database loaded successfully.');
    } catch (err) {
        console.error('❌ Failed to load database:', err);
    }
}

// --- 3. EXPORTS ---
module.exports = {
    balances,
    userJobs,
    inventories,
    xp,
    levels,
    systemChannels,
    saveDatabase,
    loadDatabase,
    // Add your static configurations here so they are accessible
    JOB_LIST: {
        astronaut: { name: 'Astronaut 🚀', min: 800, max: 1500 },
        developer: { name: 'Developer 💻', min: 500, max: 1000 },
        // ... rest of your jobs
    },
    SHOP_ITEMS: {
        vip: { name: 'VIP Role', price: 35000 },
        // ... rest of your shop items
    }
};
