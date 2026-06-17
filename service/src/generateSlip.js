import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';
import { mapToSwissQRBillData } from './mapData.js';

/**
 * Generates a payment slip PDF (A4 page, slip positioned at the bottom).
 * Returns a Buffer containing the PDF bytes.
 */
export function generatePaymentSlipPDF(qrData) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    // A4 page — swissqrbill positions the 105mm slip at the bottom automatically
    const pdf = new PDFDocument({ size: 'A4', margin: 0 });

    pdf.on('data', chunk => chunks.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);

    try {
      const billData = mapToSwissQRBillData(qrData);
      const qrBill = new SwissQRBill(billData);
      qrBill.attachTo(pdf);
      pdf.end();
    } catch (err) {
      reject(err);
    }
  });
}
