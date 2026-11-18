const parseCollectedAmounts = (record) => {
  const parseAmount = (value, label) => {
    const text = value == null || value === '' ? '0' : String(value);
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(text)) {
      throw Object.assign(new Error(`${label} must be a non-negative amount with up to two decimals`), { status: 400 });
    }
    return Number(text);
  };

  if (record.cash_collected !== undefined || record.qr_collected !== undefined) {
    const cash = parseAmount(record.cash_collected, 'Cash received');
    const qr = parseAmount(record.qr_collected, 'QR received');
    if (cash + qr > 99999999.99) {
      throw Object.assign(new Error('Combined amount collected cannot exceed 99,999,999.99'), { status: 400 });
    }
    return { cash, qr, total: cash + qr };
  }

  const total = parseAmount(record.amount_collected, 'Amount collected');
  const method = record.payment_method || 'Cash';
  if (!['Cash', 'QR'].includes(method)) {
    throw Object.assign(new Error('Payment method must be Cash or QR'), { status: 400 });
  }
  return { cash: method === 'Cash' ? total : 0, qr: method === 'QR' ? total : 0, total };
};

module.exports = { parseCollectedAmounts };
