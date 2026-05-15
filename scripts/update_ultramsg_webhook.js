const axios = require('axios');
const config = require('./config');

async function setWebhook(webhookUrl) {
    const url = `${config.ULTRAMSG_API_URL}instance/settings`;

    console.log(`[UltraMsg] Setting webhook to: ${webhookUrl}`);
    try {
        const response = await axios.post(url, {
            token: config.ULTRAMSG_TOKEN,
            webhook_url: webhookUrl,
            webhook_message_received: "true", // Try string "true"
            webhook_message_create: "false",
            webhook_message_ack: "false"
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log('[UltraMsg] Success!', response.data);
    } catch (error) {
        console.error('[UltraMsg] Error updating webhook:', error.response ? error.response.data : error.message);
    }
}

const newWebhookUrl = process.argv[2];
if (!newWebhookUrl) {
    console.error('Please provide a webhook URL as an argument.');
    process.exit(1);
}

setWebhook(newWebhookUrl);
