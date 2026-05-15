const ngrok = require('ngrok');
const axios = require('axios');
const { spawn } = require('child_process');
require('dotenv').config();
const config = require('./config');

async function fixEverything() {
    console.log('[Fix] Stopping all ngrok sessions...');
    try {
        await ngrok.kill();
    } catch (e) { }

    console.log('[Fix] Starting new ngrok tunnel on port 3001...');
    let url;
    try {
        url = await ngrok.connect(3001);
        console.log('[Fix] New Ngrok URL:', url);
    } catch (err) {
        console.error('[Fix] Ngrok failed:', err.message);
        return;
    }

    const webhookUrl = url + '/webhook';
    console.log('[Fix] Updating UltraMsg settings...');
    try {
        const settingsUrl = `${config.ULTRAMSG_API_URL}instance/settings`;
        const response = await axios.post(settingsUrl, {
            token: config.ULTRAMSG_TOKEN,
            webhook_url: webhookUrl,
            webhook_message_received: "true",
            webhook_message_create: "false",
            webhook_message_ack: "false"
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log('[Fix] UltraMsg settings updated:', response.data.webhook_url);
    } catch (err) {
        console.error('[Fix] UltraMsg update failed:', err.message);
    }

    console.log('[Fix] Starting server...');
    const server = spawn('node', ['server.js'], { stdio: 'inherit' });

    server.on('close', (code) => {
        console.log(`[Fix] Server process exited with code ${code}`);
    });
}

fixEverything();
