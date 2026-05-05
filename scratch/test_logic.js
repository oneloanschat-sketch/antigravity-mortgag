const geminiService = require('../geminiService');
const config = require('../config');

const mockAiResponse = `תודה רבה! נחזור אליך בקרוב. 🙏

|||json_start|||
{
  "lead_type": "small_loan",
  "full_name": "ישראל ישראלי",
  "summary_sentence": "מבקש 100,000 שח לשיפוץ. שכיר. שלח הכל."
}`;

console.log('--- Step 1: Testing JSON Extraction ---');
const leadSummary = geminiService.extractJson(mockAiResponse);
console.log('Parsed JSON:', JSON.stringify(leadSummary, null, 2));

if (leadSummary && leadSummary.lead_type === 'small_loan') {
    console.log('✅ SUCCESS: Lead type identified as small_loan');
    
    console.log('--- Step 2: Testing Message Formatting ---');
    const fullName = leadSummary.full_name || 'לקוח';
    const details = leadSummary.summary_sentence || '';
    const waLink = `wa.me/972501234567`;
    
    const groupMessage = `💰 *בקשת הלוואה קטנה חדשה!* 💰\n\n*שם*: ${fullName}\n*טלפון*: ${waLink}\n*פרטים*: ${details}\n\n✅ הלקוח שלח את כל המסמכים הנדרשים.\n*נא לבחון את הבקשה בהקדם!* 🚀`;
    
    console.log('Generated Message:\n' + groupMessage);
} else {
    console.log('❌ FAIL: Could not identify small_loan lead type');
}
