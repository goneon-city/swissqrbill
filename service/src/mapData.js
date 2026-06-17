/**
 * Maps the qr_data staging JSON format to the swissqrbill Data object.
 * Creditor details come from env vars (set once in Railway, shared across all invoices).
 */
export function mapToSwissQRBillData(qrData) {
  const data = {
    creditor: {
      account: qrData.iban.replace(/\s/g, ''),
      name: process.env.CREDITOR_NAME,
      address: process.env.CREDITOR_STREET,
      city: process.env.CREDITOR_CITY,
      zip: process.env.CREDITOR_PLZ,
      country: process.env.CREDITOR_COUNTRY || 'CH',
    },
    currency: qrData.currency || 'CHF',
  };

  if (qrData.amount) {
    const amt = parseFloat(String(qrData.amount).replace(/[\s']/g, ''));
    if (!isNaN(amt)) data.amount = amt;
  }

  if (qrData.debtor_name) {
    data.debtor = {
      name: qrData.debtor_name,
      address: qrData.debtor_street || '',
      city: qrData.debtor_city || '',
      zip: qrData.debtor_plz || '',
      country: qrData.debtor_country || 'CH',
    };
  }

  if (qrData.reference && qrData.reference_type !== 'NON') {
    data.reference = qrData.reference.replace(/\s/g, '');
  }

  if (qrData.additional_info) {
    data.message = qrData.additional_info;
  }

  return data;
}
