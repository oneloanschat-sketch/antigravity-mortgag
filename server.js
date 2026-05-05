const express = require('express');
const bodyParser = require('body-parser');
const agentLogic = require('./agentLogic');
const config = require('./config');
const ultraMsgService = require('./ultraMsgService');

const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Persistent session storage
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
let sessions = {};
try {
    if (fs.existsSync(SESSIONS_FILE)) {
        sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
        console.log(`[Server] Loaded ${Object.keys(sessions).length} sessions from disk.`);
    }
} catch (err) {
    console.error("[Server] Error loading sessions file:", err);
}

function saveSessions() {
    try {
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    } catch (err) {
        console.error("[Server] Error saving sessions file:", err);
    }
}

const processedMsgIds = new Set();

// Health Check
app.get('/health', (req, res) => {
    res.send('Ayelet Agent is Online');
});

// Green API Webhook Endpoint (Now handles UltraMsg too)
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        // Super Debug Logging
        fs.appendFileSync('webhook_debug.log', `\n--- WEBHOOK RECEIVED [${new Date().toISOString()}] ---\n${JSON.stringify(body, null, 2)}\n`);

        // Log basic info about the webhook
        console.log(`[Webhook] Received event: ${body.event_type || body.event || body.typeWebhook} from ${body.data?.from || body.senderData?.chatId}`);

        // Detect incoming message format and ID
        let chatId, message, msgId;

        // UltraMsg format (Standard chat)
        if ((body.event_type === 'message_received' || body.event === 'message_received') && body.data) {
            if (body.data.type === 'chat') {
                // IMPORTANT: Ignore messages sent by the bot itself (fromMe: true)
                if (body.data.fromMe === true || body.data.fromMe === "true") {
                    console.log(`[Webhook] Skipping outgoing message from bot (ID: ${body.data.id})`);
                    return res.status(200).send('Ignored self');
                }

                chatId = body.data.from;
                msgId = body.data.id;

                // Handle different message types
                if (body.data.type === 'chat') {
                    message = body.data.body;
                } else if (['image', 'document', 'video', 'audio', 'voice'].includes(body.data.type)) {
                    // For media, we inject a placeholder so the AI knows something was received
                    const caption = body.data.caption ? ` [עם כיתוב: ${body.data.caption}]` : "";
                    message = `(הלקוח שלח קובץ/מדיה מסוג ${body.data.type}${caption})`;
                } else {
                    console.log(`[Webhook] Unsupported message type: ${body.data.type}`);
                    return res.status(200).send('Unsupported type');
                }

                // IMPORTANT: Ignore group messages — only respond to private (direct) chats
                if (chatId && chatId.endsWith('@g.us')) {
                    console.log(`[Webhook] Skipping group message from ${chatId}`);
                    return res.status(200).send('Ignored group');
                }

                console.log(`[Webhook] UltraMsg Chat from ${chatId}: "${message}" (ID: ${msgId})`);
            }
        }
        // Green API format (Keep for compatibility/backup)
        else if (body.typeWebhook === 'incomingMessageReceived' && body.messageData?.typeMessage === 'textMessage') {
            chatId = body.senderData.chatId;
            message = body.messageData.textMessageData.textMessage;
            msgId = body.idMessage;
            console.log(`[Webhook] Green API Chat from ${chatId}: "${message}" (ID: ${msgId})`);
        }

        if (chatId && message && msgId) {
            // Manual Reset Keyword
            if (message.trim().toLowerCase() === 'איפוס') {
                console.log(`[Server] Manual reset requested for ${chatId}`);
                delete sessions[chatId];
                saveSessions();
                await ultraMsgService.sendMessage(chatId, "השיחה אופסה. אפשר להתחיל מחדש! שלח/י 'היי' כדי להתחיל.");
                return res.status(200).send('Reset');
            }

            // 1. Idempotency Check
            if (processedMsgIds.has(msgId)) {
                console.log(`[Webhook] Duplicate message detected (ID: ${msgId}). Skipping.`);
                return res.status(200).send('Duplicate');
            }
            // Keep set size manageable
            if (processedMsgIds.size > 1000) processedMsgIds.clear();
            processedMsgIds.add(msgId);

            // 2. Initialize or Get Session
            if (!sessions[chatId]) {
                console.log(`[Server] Creating NEW session for ${chatId}`);
                sessions[chatId] = agentLogic.createSession(chatId);
            }
            const session = sessions[chatId];
            fs.appendFileSync('webhook_debug.log', `[Server] State Before: chatId=${chatId}, Step=${session.step}, Retry=${session.retryCount || 0}\n`);

            // --- 2.5 Notification to Group on First Contact ---
            if (!session.firstContactNotified && config.HOT_LEADS_GROUP_ID) {
                const pushName = body.data?.pushname || 'לקוח ללא שם';
                const cleanPhone = chatId.split('@')[0].replace(/\D/g, '');
                const formattedPhone = cleanPhone.startsWith('0') ? `972${cleanPhone.substring(1)}` : cleanPhone;
                const waLink = `https://wa.me/${formattedPhone}`;

                const notificationMsg = `🔔 *פנייה חדשה לבוט!* 🔔

*שם בוואטסאפ*: ${pushName}
*מספר טלפון*: ${waLink}

הבוט התחיל לענות ללקוח. 🤖`;

                try {
                    console.log(`[Server] Sending first contact notification for ${chatId}...`);
                    await ultraMsgService.sendMessage(config.HOT_LEADS_GROUP_ID, notificationMsg);
                    session.firstContactNotified = true;
                    saveSessions();
                } catch (e) {
                    console.error("[Server] First contact notification failed:", e);
                }
            }

            // 3. Concurrency Lock
            if (session.isProcessing) {
                console.log(`[Webhook] Session ${chatId} is already processing. Rejecting retry.`);
                return res.status(200).send('Locked');
            }
            session.isProcessing = true;

            try {
                const result = await agentLogic.processMessage(session, message);

                // Update session state
                sessions[chatId] = result.session;
                saveSessions();
                fs.appendFileSync('webhook_debug.log', `[Server] State After: chatId=${chatId}, NewStep=${result.session.step}, NewRetry=${result.session.retryCount}\n`);
                console.log(`[Server] After process: ${chatId} - New Step: ${result.session.step}, New Retry: ${result.session.retryCount}`);

                // Send response via UltraMsg
                if (result.response) {
                    console.log(`[Webhook] Sending response to ${chatId}...`);
                    await ultraMsgService.sendMessage(chatId, result.response);
                    // Update last bot message time for reminder logic
                    session.lastBotMessageTime = Date.now();
                    saveSessions();
                }
            } finally {
                session.isProcessing = false;
            }

            return res.status(200).send('OK');
        } else {
            return res.status(200).send('Handled');
        }

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to reset session (for testing)
app.post('/reset', (req, res) => {
    const { phone_number } = req.body;
    if (sessions[phone_number]) {
        delete sessions[phone_number];
        res.json({ message: 'Session reset' });
    } else {
        res.json({ message: 'No session found to reset' });
    }
});

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});

// --- Reminder Logic (Runs every hour) ---
setInterval(async () => {
    console.log('[Reminder] Checking for idle sessions...');
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

    for (const chatId in sessions) {
        const session = sessions[chatId];

        // Check if session qualifies for a reminder:
        // 1. Not completed
        // 2. Reminder not yet sent
        // 3. Has history and last message was from bot (assistant)
        // 4. Last bot message was between 24h and 14 days ago
        if (
            !session.completed &&
            !session.reminderSent &&
            session.history &&
            session.history.length > 0 &&
            session.history[session.history.length - 1].role === 'assistant' &&
            session.lastBotMessageTime &&
            (now - session.lastBotMessageTime) > TWENTY_FOUR_HOURS &&
            (now - session.lastBotMessageTime) < TWO_WEEKS
        ) {
            console.log(`[Reminder] Sending reminder to ${chatId}`);
            const reminderMsg = "היי, מה נשמע? רציתי לראות אם אפשר להתקדם עם מה שדיברנו עליו, חבל לפספס את ההזדמנות. אני כאן לכל שאלה! 😊";

            try {
                await ultraMsgService.sendMessage(chatId, reminderMsg);
                session.reminderSent = true;
                // Add to history so AI has context if user replies
                session.history.push({ role: 'assistant', content: reminderMsg });
                session.lastBotMessageTime = Date.now(); // Update time to prevent immediate double-reminders (though flag handles it)
                saveSessions();
            } catch (err) {
                console.error(`[Reminder] Failed to send to ${chatId}:`, err.message);
            }
        }
    }
}, 60 * 60 * 1000); // Check every hour
