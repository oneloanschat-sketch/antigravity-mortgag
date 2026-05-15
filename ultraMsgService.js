const axios = require('axios');
const config = require('./config');

const sendMessage = async (chatId, message) => {
    if (!chatId || !message) {
        console.error('sendMessage: chatId and message are required');
        return;
    }

    const to = chatId;
    const url = `${config.ULTRAMSG_API_URL}messages/chat`;

    try {
        const data = new URLSearchParams({
            token: config.ULTRAMSG_TOKEN,
            to: to,
            body: message
        });

        console.log(`[UltraMsg] Sending message to ${to}...`);
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000
        });

        return response.data;
    } catch (error) {
        console.error('[UltraMsg] Error sending message:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const sendDocument = async (chatId, filename, document, caption = "") => {
    if (!chatId || !filename || !document) {
        console.error('sendDocument: chatId, filename, and document are required');
        return;
    }

    const to = chatId;
    const url = `${config.ULTRAMSG_API_URL}messages/document`;

    try {
        const data = new URLSearchParams({
            token: config.ULTRAMSG_TOKEN,
            to: to,
            filename: filename,
            document: document, // Can be URL or Base64
            caption: caption
        });

        console.log(`[UltraMsg] Sending document ${filename} to ${to}...`);
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 20000 // Longer timeout for files
        });

        console.log(`[UltraMsg] Document sent to ${to}:`, response.data);
        return response.data;
    } catch (error) {
        console.error('[UltraMsg] Error sending document:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    sendMessage,
    sendDocument
};
