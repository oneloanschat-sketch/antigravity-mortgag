const axios = require('axios');
const config = require('./config');

async function getSettings() {
    const url = `${config.ULTRAMSG_API_URL}instance/settings?token=${config.ULTRAMSG_TOKEN}`;

    console.log(`[UltraMsg] Getting settings from: ${url}`);
    try {
        const response = await axios.get(url);
        console.log('[UltraMsg] Current Settings:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('[UltraMsg] Error getting settings:', error.response ? error.response.data : error.message);
    }
}

getSettings();
