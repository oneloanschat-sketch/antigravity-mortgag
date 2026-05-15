const getContractHtml = (name, id, date, time, sigImage) => {
    return `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Assistant', sans-serif; padding: 40px; margin: 0; direction: rtl; }
            .paper { background: white; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #eee; }
            .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1e3a8a; margin: 0; font-size: 24px; letter-spacing: 1px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; }
            .meta span { font-weight: 700; }
            .content { line-height: 1.8; text-align: right; font-size: 16px; margin-bottom: 50px; unicode-bidi: plaintext; }
            .signature-box { border-top: 1px solid #e2e8f0; padding-top: 30px; }
            .signature-img { max-width: 300px; border: 1px solid #e2e8f0; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="paper">
            <div class="header">
                <p style="margin: 0 0 10px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">חתימה דיגיטלית</p>
                <h1>אדמתנו ביתנו בע"מ</h1>
                <p style="margin-top: 5px; font-weight: 600; color: #1e3a8a;">משכנתאות I הלוואות I פתרונות מימון לעסקים</p>
                <h3 style="margin-top: 20px; text-decoration: underline;">הנדון: הסכם התקשרות</h3>
            </div>

            <div class="meta">
                <div><span>שם הלקוח/ה:</span> ${name}</div>
                <div><span>תעודת זהות:</span> ${id}</div>
                <div><span>תאריך חתימה:</span> ${date}</div>
                <div><span>שעת חתימה:</span> ${time}</div>
            </div>

            <div class="content">
                1. אני מבקש/ת את סיוע החברה בקבלת אישור עקרוני להלוואה.<br>
                2. ידוע לי כי שכר הטרחה בגין קבלת האישור הינו 9% (כולל מע"מ) מסך ההלוואה שאושרה, והוא ישולם לחברה עם קבלת האישור.<br>
                3. אני מצהיר/ה כי כל המידע שמסרתי הוא נכון ומדויק.<br>
                4. ידוע לי כי החברה אינה מתחייבת להצלחה בקבלת האישור וכי ההחלטה הסופית היא בידי הגורם המממן.<br>
                5. חתימתי באמצעי דיגיטלי זה מחייבת אותי לכל דבר ועניין ומהווה הסכמה מלאה לכל תנאי ההתקשרות לעיל.
            </div>

            <div class="signature-box">
                <strong>חתימת הלקוח/ה:</strong><br>
                <img src="${sigImage}" class="signature-img" alt="Signature">
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getContractHtml };
