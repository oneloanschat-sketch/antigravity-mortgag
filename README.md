# 🏠 Sapir - WhatsApp Mortgage Agent (TikTak Mortgages)

**Sapir** (ספיר) is an AI-powered WhatsApp chatbot for **TikTak Mortgages** (טיקטק משכנתאות).  
She qualifies leads, schedules appointments, and notifies the sales team — all in **Hebrew**, 24/7.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Conversation** | Gemini 2.5 Flash (primary, thinking disabled) + 2.0 Flash (fallback) with 10-retry persistence |
| 🇮🇱 **Hebrew Only** | Politely declines other languages |
| 🎯 **Lead Qualification** | Collects name, city, amount, purpose, property details naturally |
| 📅 **Appointment Scheduling** | Sapir sets the exact day, date & time — no "a rep will call to schedule" |
| 🔥 **Hot Lead Notifications** | Sends formatted lead summary to WhatsApp group instantly |
| 💰 **Small Loans Channel** | New! Accepts loans of 50K–199K NIS (no property needed) — collects docs, notifies separate group |
| 🔄 **Smart Updates** | If user reschedules, sends an *update* notification (not a duplicate). Casual messages ("תודה") don't trigger notifications |
| 🧠 **Thinking Disabled** | `thinkingBudget: 0` prevents costly thinking tokens + safety regex strips any THOUGHT leaks |
| 🔐 **Time-Aware Greetings** | Injects real Israel time directly into prompt — says "ערב טוב" at night, not "בוקר טוב" |
| 🛡️ **Clean Chat** | JSON payloads are 100% hidden from the client |
| 🔇 **Group Silence** | Bot ignores all group messages — responds only to private (direct) chats |
| 🖋️ **Digital Signature** | Fully automated signing workflow with custom mobile-friendly interface |
| 📄 **PDF Generation** | Real-time PDF contract creation with embedded signatures |
| 📂 **WhatsApp Delivery** | Sends signed PDF contracts directly to the admin WhatsApp group |

---

## 🏗️ Architecture

```
User (WhatsApp) → UltraMsg Webhook → server.js → agentLogic.js → Gemini API
                                          │
                                    Group msg? → SKIP
                                          │
                                   Private msg? → Process
                                          ↓
                                  Hidden JSON detected?
                                  ↓ YES              ↓ NO
                       lead_type = mortgage?    Reply to user
                       ↓ YES        ↓ NO (small_loan)
              New lead/time changed?  Send to 🔥 הלוואות קטנות group
              ↓ YES         ↓ NO
         Send to Group   Skip (no duplicate)
         + Reply clean   + Reply clean
```

### Core Files

| File | Purpose |
|---|---|
| `server.js` | Express server, webhook handler, session management, group message filter |
| `agentLogic.js` | Conversation logic, JSON extraction, smart group notifications, THOUGHT filtering |
| `geminiService.js` | Gemini API calls with 10-retry fallback chain (2.5 → 2.0), thinking disabled |
| `ultraMsgService.js` | WhatsApp message sending via UltraMsg API |
| `config.js` | Environment variable loader |
| `MD/System_Prompt.md` | Sapir's persona, rules, time-aware greeting, and hidden JSON output instructions |
| `contractTemplate.js` | Shared HTML/CSS template for consistent web and PDF contract views |
| `pdfService.js` | Server-side PDF generation using `html-pdf-node` |
| `public/signature.html` | The mobile-optimized digital signature signing page |

---

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key
ULTRAMSG_INSTANCE_ID=your_instance_id
ULTRAMSG_TOKEN=your_token
HOT_LEADS_GROUP_ID=your_hot_leads_group_id@g.us
SMALL_LOANS_GROUP_ID=your_small_loans_group_id@g.us # For loan leads and signed PDFs
BASE_URL=https://your-app.onrender.com
PORT=3002
```

---

## 🚀 How It Works

1. **User messages** the bot on WhatsApp (private chat only — groups are ignored).
2. **Sapir responds** naturally in Hebrew, collecting info one question at a time.
3. **Amount routing:**
   - **≥ 200,000 NIS** → Mortgage track: sets a meeting, notifies the "🔥 לידים חמים" group.
   - **50,001–199,999 NIS** → Small loans track: collects ID, bank statements, pay slips/tax assessment, notifies the "🔥 הלוואות קטנות" group.
   - **≤ 50,000 NIS** → Politely declined.
4. **Hidden JSON** — The AI outputs a structured payload (with `lead_type: mortgage` or `lead_type: small_loan`) after the friendly closing message.
5. **Server detects** the JSON, strips it from the user’s view, and routes to the correct WhatsApp group.
6. **User continues** — The conversation stays open. Casual messages get natural replies without triggering notifications.
7. **Digital Signature Loop** (Small Loans):
   - Once docs are "sent", Sapir sends a unique link: `{{BASE_URL}}/sign/{{chatId}}`.
   - User signs on their mobile device.
   - Server generates a **PDF contract** with the user's name, ID, and signature.
   - The PDF is sent immediately to the `SMALL_LOANS_GROUP_ID` WhatsApp group.
8. **Reschedule** (mortgage only) — If the user explicitly changes the meeting time, a 🔄 update notification is sent to the group.

---

## 💰 Small Loans Group Message Format

```
💰 *בקשת הלוואה קטנה חדשה!* 💰

*שם*: ישראל ישראלי
*טלפון*: wa.me/972501234567
*פרטים*: לקוח ישראל. מבקש 120,000 ש"ח למטרת שיפוצ. שכיר. שלח את כל המסמכים.

✅ הלקוח שלח את כל המסמכים הנדרשים.
*נא לבחון את הבקשה בהקדם!* 🚀
```

---

## 🔥 Hot Leads Group Message Format

**New Lead:**
```
🔥 *ליד חם חדש (אש)!* 🔥

*שם*: ישראל ישראלי
*טלפון*: wa.me/972501234567
*פרטים*: לקוח ישראל, גר בחולון. מבקש 1.2M למטרת רכישה.
*מועד פגישה*: יום ראשון 23.2 ב-10:00

*סוכן, נא לחזור אל הלקוח!* 🚀
```

**Updated Meeting:**
```
🔄 *עדכון מועד פגישה* 🔄

*שם*: ישראל ישראלי
*טלפון*: wa.me/972501234567
*פרטים*: לקוח ישראל, גר בחולון. מבקש 1.2M למטרת רכישה.
*מועד פגישה*: יום שלישי 25.2 ב-14:00

*סוכן, נא לעדכן ביומן!* 📅
```

---

## 🛠️ Maintenance & Utility Tools

The repository includes several utility scripts for configuration and maintenance:

| Script | Purpose |
|---|---|
| `list_groups.js` | Lists all WhatsApp groups the bot is in (use to find `HOT_LEADS_GROUP_ID`) |
| `find_group.js` | Search for a specific group by name |
| `update_webhook.js` | Quickly update the UltraMsg webhook URL |
| `list_models.js` | Checks available Gemini models and API connectivity |
| `clear_sessions.js` | Clears all active chat sessions (useful for testing) |
| `get_ultramsg_settings.js` | Verifies UltraMsg instance configuration |
| `fix_and_start.js` | A recovery script that attempts to fix environment issues and start the server |

---

## 🚀 Local Development

```bash
npm install
node server.js
```

## ☁️ Deployment (Render)

1. Push to GitHub.
2. Deploy on [Render](https://render.com).
3. Set environment variables in the Render Dashboard.
4. Set UltraMsg Webhook URL: `https://your-app.onrender.com/webhook`

---

## ⚠️ Important Notes

- **Do NOT remove** the hidden JSON instruction from `System_Prompt.md` — it triggers the group notifications.
- **Reset command:** Users can type `אפס את השיחה` or `איפוס` to start fresh.
- **Model fallback:** If Gemini 2.5 Flash is unavailable, the system retries 10 times (≈45s) before falling back to 2.0 Flash.
- **Thinking disabled:** `thinkingBudget: 0` in `geminiService.js` prevents THOUGHT token generation and reduces API costs.
- **Group filter:** `server.js` skips all messages from `@g.us` addresses — the bot only responds to private chats.
- **Two group IDs required:** `HOT_LEADS_GROUP_ID` for mortgage leads (≥200K), `SMALL_LOANS_GROUP_ID` for small loan leads (50K–199K) and PDF contracts.
- **Privacy:** Signed contracts and session data (`sessions.json`) are stored locally on the server and are **excluded from Git** (`.gitignore`) for data security.
- **Testing PDF:** View the most recently generated PDF at `http://localhost:PORT/test-pdf` during local development.
