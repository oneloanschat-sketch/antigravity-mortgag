const axios = require('axios');
const config = require('./config');

async function setWebhook(webhookUrl) {
    const url = `${config.GREEN_API_URL}/waInstance${config.GREEN_API_ID_INSTANCE}/setSettings/${config.GREEN_API_TOKEN_INSTANCE}`;

    console.log(`Setting webhook to: ${webhookUrl}`);
    try {
        const response = await axios.post(url, {
            webhookUrl: webhookUrl
        });
        console.log('Success!', response.data);
    } catch (error) {
        console.error('Error updating webhook:', error.response ? error.response.data : error.message);
    }
}

const newWebhookUrl = process.argv[2];
if (!newWebhookUrl) {
    console.error('Please provide a webhook URL as an argument.');
    process.exit(1);
}

setWebhook(newWebhookUrl);
