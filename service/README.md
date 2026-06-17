# goNEON Payment Slip Service

Express microservice that generates SIX-compliant Swiss QR payment slips using [swissqrbill](https://github.com/goneon-city/swissqrbill). Deployed on Railway.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check (no auth) |
| `POST` | `/payment-slip` | Returns A4 PDF with just the payment slip |
| `POST` | `/invoice` | Merges an invoice PDF + payment slip, returns combined PDF |

All endpoints except `/health` require `Authorization: Bearer <API_KEY>`.

## POST /invoice (primary endpoint)

**Request body:**
```json
{
  "qr_data": {
    "iban": "CH5604835012345678009",
    "amount": "1800.00",
    "currency": "CHF",
    "reference_type": "NON",
    "reference": "",
    "debtor_name": "Client AG",
    "debtor_street": "Bahnhofstrasse 42",
    "debtor_plz": "3000",
    "debtor_city": "Bern",
    "debtor_country": "CH",
    "additional_info": ""
  },
  "invoice_pdf": "<base64-encoded PDF bytes>"
}
```

**Response:** `application/pdf` — merged PDF with invoice pages + SIX payment slip appended.

If `invoice_pdf` is omitted, returns just the payment slip PDF.

## Railway deployment

1. Fork this repo (already done: `goneon-city/swissqrbill`)
2. Create a new Railway project → connect to this GitHub repo
3. Set **Root Directory** to `service` in Railway project settings
4. Add environment variables (see `.env.example`):
   - `API_KEY` — generate a strong random key
   - `CREDITOR_NAME`, `CREDITOR_STREET`, `CREDITOR_PLZ`, `CREDITOR_CITY`, `CREDITOR_COUNTRY`
5. Deploy — Railway auto-detects Node.js and runs `npm start`
6. Copy the Railway public URL into `Code.gs` → `CONFIG.PAYMENT_SLIP_URL`
7. Store the same `API_KEY` in Apps Script → **Project Settings → Script Properties** as `PAYMENT_SLIP_API_KEY`

## Local development

```bash
cd service
cp .env.example .env
# Edit .env with real values
npm install
npm run dev
```

Test with curl:
```bash
curl -X POST http://localhost:3000/payment-slip \
  -H "Authorization: Bearer your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"qr_data":{"iban":"CH5604835012345678009","amount":"1800.00","currency":"CHF","reference_type":"NON","reference":"","debtor_name":"Test AG","debtor_street":"Teststrasse 1","debtor_plz":"8001","debtor_city":"Zürich","debtor_country":"CH"}}' \
  --output payment-slip.pdf
```
