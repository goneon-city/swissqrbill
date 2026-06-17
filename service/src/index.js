import express from 'express';
import { PDFDocument } from 'pdf-lib';
import { generatePaymentSlipPDF } from './generateSlip.js';

const app = express();
app.use(express.json({ limit: '25mb' }));

// ── AUTH MIDDLEWARE ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY environment variable not set.' });
  }
  if (req.headers['authorization'] !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
});

// ── GET /health ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'goneon-payment-slip' });
});

// ── POST /payment-slip ─────────────────────────────────────────────────────────
app.post('/payment-slip', async (req, res) => {
  try {
    const { qr_data, creditor } = req.body;
    if (!qr_data || !qr_data.iban) {
      return res.status(400).json({ error: 'Missing or incomplete qr_data. Required: iban.' });
    }
    const pdfBuffer = await generatePaymentSlipPDF(qr_data, creditor);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="payment-slip.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('POST /payment-slip error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /invoice ──────────────────────────────────────────────────────────────
app.post('/invoice', async (req, res) => {
  try {
    const { qr_data, creditor, invoice_pdf } = req.body;
    if (!qr_data || !qr_data.iban) {
      return res.status(400).json({ error: 'Missing or incomplete qr_data. Required: iban.' });
    }

    const slipBuffer = await generatePaymentSlipPDF(qr_data, creditor);

    if (!invoice_pdf) {
      res.set('Content-Type', 'application/pdf');
      res.send(slipBuffer);
      return;
    }

    const invoiceBytes = Buffer.from(invoice_pdf, 'base64');
    const merged = await PDFDocument.create();

    const invoiceDoc = await PDFDocument.load(invoiceBytes);
    const slipDoc = await PDFDocument.load(slipBuffer);

    const invoicePages = await merged.copyPages(invoiceDoc, invoiceDoc.getPageIndices());
    invoicePages.forEach(p => merged.addPage(p));

    const [slipPage] = await merged.copyPages(slipDoc, [0]);
    merged.addPage(slipPage);

    const mergedBytes = await merged.save();
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.send(Buffer.from(mergedBytes));
  } catch (err) {
    console.error('POST /invoice error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── START ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`goNEON payment slip service listening on port ${PORT}`);
});
