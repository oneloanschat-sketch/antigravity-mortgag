const fs = require('fs');
const path = require('path');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
if (fs.existsSync(SESSIONS_FILE)) {
    fs.unlinkSync(SESSIONS_FILE);
    console.log("Sessions cleared.");
} else {
    console.log("No sessions to clear.");
}
