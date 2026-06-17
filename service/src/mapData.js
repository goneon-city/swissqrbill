/**
 * Maps the qr_data + creditor payload to the swissqrbill Data object.
 * Creditor details come from the request body (sent by Apps Script),
 * with env vars as fallback.
 */
export function mapToSwissQRBillData(qrData, creditor) {
  const c = creditor || {};
  const data = {
    creditor: {
      account: qrData.iban.replace(/\s/g, ''),
      name:    c.name    || process.env.CREDITOR_NAME,
      address: c.street  || process.env.CREDITOR_STREET,
      city:    c.city    || process.env.CREDITOR_CITY,
      zip:     c.plz     || process.env.CREDITOR_PLZ,
      country: c.country || process.env.CREDITOR_COUNTRY || 'CH',
    },
    currency: qrData.currency || 'CHF',
  };

  if (qrData.amount) {
    const amt = parseFloat(String(qrData.amount).replace(/[\s']/g, ''));
    if (!isNaN(amt)) data.amount = amt;
  }

  if (qrData.debtor_name) {
    data.debtor = {
      name:    qrData.debtor_name,
      address: qrData.debtor_street || '',
      city:    qrData.debtor_city   || '',
      zip:     qrData.debtor_plz    || '',
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
