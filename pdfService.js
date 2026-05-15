const html_to_pdf = require('html-pdf-node');
const { getContractHtml } = require('./contractTemplate');

const generateContractPdf = async (clientName, clientId, signatureData) => {
    const date = new Date().toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
    const time = new Date().toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' });

    // Generate HTML for PDF using the shared template
    const contractHtml = getContractHtml(clientName, clientId, date, time, signatureData);

    try {
        console.log(`[PdfService] Generating PDF for ${clientName}...`);
        
        let options = { 
            format: 'A4',
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
            printBackground: true
        };
        let file = { content: contractHtml };

        const pdfBuffer = await html_to_pdf.generatePdf(file, options);
        console.log(`[PdfService] PDF Generated.`);
        
        return pdfBuffer;
    } catch (error) {
        console.error('[PdfService] Error in PDF generation:', error);
        throw error;
    }
};

module.exports = {
    generateContractPdf
};
