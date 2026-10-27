const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createActionToken,
  readActionToken,
  buildReminderEmail
} = require('../service-call-reminders');
const { parseCall } = require('../service-calls');

test('email SOIN action token is signed and bound to a reminder cycle', () => {
  const secret = 'a-secure-test-secret-that-is-at-least-32-characters';
  const token = createActionToken('42', 3, secret);

  assert.deepEqual(readActionToken(token, secret), { id: '42', cycle: 3 });
  assert.equal(readActionToken(token, 'a-different-secret-with-32-characters'), null);
  assert.equal(readActionToken(`${token}x`, secret), null);
  assert.equal(readActionToken('not-a-token', secret), null);
});

test('reminder email content distinguishes the 47-hour reminder and TAT follow-up', () => {
  const call = {
    id: 7,
    reminder_cycle: 2,
    soin: '<SOIN&>',
    customer_name: 'Charom',
    model: 'Moto <Edge>',
    submission_at: '2026-10-27T05:45:00.000Z',
    relog_due_at: '2026-10-29T04:45:00.000Z'
  };
  const first = buildReminderEmail(call, 1, 'signed-token', 'https://api.example.com');
  const followUp = buildReminderEmail(call, 2, 'signed-token', 'https://api.example.com');

  assert.match(first.subject, /47-hour reminder/);
  assert.match(first.html, /&lt;SOIN&amp;&gt;/);
  assert.match(first.html, /Moto &lt;Edge&gt;/);
  assert.match(first.html, /https:\/\/api\.example\.com\/api\/service-calls\/email-update\/signed-token/);
  assert.match(followUp.subject, /TAT missed follow-up/);
  assert.match(followUp.text, /One hour has passed/);
});

test('phone submission timestamp is the source of the exact 47-hour deadline', () => {
  const call = parseCall({
    soin: 'SO-123',
    device_type: 'Laptop',
    customer_name: 'Charom',
    customer_contact: '9876543210',
    model: 'Moto Edge',
    issue_description: 'Test issue',
    warranty_status: 'In Warranty',
    call_type: 'Hardware',
    part_order_status: 'Not Yet Ordered',
    mail_sent: true,
    submission_at: '2026-10-27T05:45:00.000Z'
  });

  assert.equal(call.relog_due_at, '2026-10-29T04:45:00.000Z');
  assert.equal(call.mail_sent, false);
});
