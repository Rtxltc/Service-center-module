const test = require('node:test');
const assert = require('node:assert/strict');
const {
  signState,
  verifyState,
  encryptRefreshToken,
  decryptRefreshToken,
  buildApprovalSubject,
  buildMimeMessage,
  validateApprovalEmail
} = require('../gmail-approval');

const call = {
  id: 17,
  soin: 'SOIN-123',
  market_name: 'Ayodhya',
  mtm_number: 'MTM-456',
  activation_date: '2026-10-27',
  warranty_expiry_date: '2027-10-26',
  imei: '123456789012345',
  second_imei: '543210987654321',
  model: 'Moto Edge',
  issue_description: 'Display is not working'
};

const emailDetails = () => validateApprovalEmail(call, {
  to: ['tech@example.com', 'other@example.com'],
  cc: ['copy@example.com'],
  request_text: 'Please approve the display replacement.',
  remark: 'Checked by the technician.',
  video_link: 'https://example.com/video',
  images: [{ name: 'display.jpg', mime_type: 'image/jpeg', data: 'AQID' }]
});

test('OAuth state is signed, tamper-resistant, and expires after ten minutes', () => {
  const secret = 'a-state-secret-that-is-long-enough-for-this-test';
  const now = 1_800_000_000_000;
  const state = signState(secret, now);

  assert.equal(verifyState(state, secret, now + 60_000), true);
  assert.equal(verifyState(`${state}tampered`, secret, now + 60_000), false);
  assert.equal(verifyState(state, 'a-different-secret-that-is-long-enough', now + 60_000), false);
  assert.equal(verifyState(state, secret, now + 10 * 60 * 1000 + 1), false);
  assert.equal(verifyState(state, secret, now - 1), false);
});

test('Gmail refresh tokens are encrypted with authenticated AES-GCM', () => {
  const key = Buffer.alloc(32, 7);
  const encrypted = encryptRefreshToken('refresh-token-value', key);

  assert.notEqual(encrypted, 'refresh-token-value');
  assert.equal(decryptRefreshToken(encrypted, key), 'refresh-token-value');
  assert.throws(() => decryptRefreshToken(encrypted, Buffer.alloc(32, 8)));
});

test('parts approval subject follows the configured subject template', () => {
  assert.equal(
    buildApprovalSubject(call),
    'RRL-103/Charom Enterprises, Ayodhya/SOIN-123/Ayodhya/Display is not working'
  );
});

test('approval email validation normalizes recipients and rejects unsafe video links', () => {
  const details = emailDetails();
  assert.deepEqual(details.to, ['tech@example.com', 'other@example.com']);
  assert.deepEqual(details.cc, ['copy@example.com']);
  assert.equal(details.images.length, 1);
  assert.throws(() => validateApprovalEmail(call, {
    to: ['tech@example.com'],
    cc: [],
    request_text: 'Approve',
    remark: 'Checked',
    video_link: 'javascript:alert(1)',
    images: [{ name: 'display.jpg', mime_type: 'image/jpeg', data: 'AQID' }]
  }), /HTTPS/);
  assert.throws(() => validateApprovalEmail(call, {
    to: [],
    cc: [],
    request_text: 'Approve',
    remark: 'Checked',
    images: [{ name: 'display.jpg', mime_type: 'image/jpeg', data: 'AQID' }]
  }), /To recipient/);
});

test('Gmail MIME message contains the email preview and image attachment', () => {
  const details = emailDetails();
  const message = buildMimeMessage(call, details, 'sender@example.com');
  const mime = Buffer.from(message.raw, 'base64url').toString('utf8');
  const plainPart = mime.match(/Content-Type: text\/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+/=\r\n]+)/)?.[1];

  assert.equal(message.subject, buildApprovalSubject(call));
  assert.match(mime, /From: sender@example\.com/);
  assert.match(mime, /tech@example\.com/);
  assert.match(mime, /Content-Type: image\/jpeg; name="display\.jpg"/);
  assert.ok(plainPart);
  const plainText = Buffer.from(plainPart.replace(/\s/g, ''), 'base64').toString('utf8');
  assert.match(plainText, /SO NO: SOIN-123/);
  assert.match(plainText, /Display is not working/);
});
