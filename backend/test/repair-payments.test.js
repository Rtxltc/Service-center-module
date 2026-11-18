const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCollectedAmounts } = require('../repair-payments');

test('collected amounts support separate cash and QR payments', () => {
  assert.deepEqual(parseCollectedAmounts({
    cash_collected: '125.50',
    qr_collected: '300'
  }), {
    cash: 125.5,
    qr: 300,
    total: 425.5
  });
});

test('legacy amount_collected remains cash unless QR is explicitly selected', () => {
  assert.deepEqual(parseCollectedAmounts({ amount_collected: '250' }), {
    cash: 250,
    qr: 0,
    total: 250
  });
  assert.deepEqual(parseCollectedAmounts({
    amount_collected: '250',
    payment_method: 'QR'
  }), {
    cash: 0,
    qr: 250,
    total: 250
  });
});

test('QR-only collected amounts are separate and excluded from profit totals', () => {
  assert.deepEqual(parseCollectedAmounts({
    cash_collected: '0',
    qr_collected: '750'
  }), {
    cash: 0,
    qr: 750,
    total: 750
  });
});

test('collected amounts reject invalid and excessive values', () => {
  assert.throws(() => parseCollectedAmounts({
    cash_collected: '-1',
    qr_collected: '0'
  }), /Cash received must be a non-negative amount/);
  assert.throws(() => parseCollectedAmounts({
    cash_collected: '99999999.99',
    qr_collected: '0.01'
  }), /Combined amount collected cannot exceed/);
});
