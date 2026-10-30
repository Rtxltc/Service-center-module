const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createActionToken,
  readActionToken,
  buildReminderEmail,
  registerServiceCallReminderRoutes
} = require('../service-call-reminders');
const { parseCall } = require('../service-calls');

test('reminder health endpoint verifies scheduler authorization without sending email', async () => {
  const routes = new Map();
  registerServiceCallReminderRoutes({
    get: (path, handler) => routes.set(`GET ${path}`, handler),
    post: (path, handler) => routes.set(`POST ${path}`, handler)
  }, {});
  const previousEnvironment = {
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    APP_URL: process.env.APP_URL,
    EMAIL_ACTION_SECRET: process.env.EMAIL_ACTION_SECRET
  };
  const cronSecret = 'cron-secret-used-only-for-the-health-check';
  Object.assign(process.env, {
    CRON_SECRET: cronSecret,
    RESEND_API_KEY: 'test-resend-key',
    RESEND_FROM_EMAIL: 'sender@example.com',
    APP_URL: 'https://api.example.com',
    EMAIL_ACTION_SECRET: 'email-action-secret-that-is-long-enough'
  });
  const invoke = async (authorization) => {
    const response = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };
    await routes.get('GET /api/service-calls/reminders/health')({
      get: () => authorization
    }, response);
    return response;
  };

  try {
    const valid = await invoke(`Bearer ${cronSecret}`);
    assert.equal(valid.statusCode, 200);
    assert.equal(valid.body.status, 'ok');
    assert.equal(valid.body.email_sent, false);
    assert.equal(Object.values(valid.body).includes(cronSecret), false);

    const invalid = await invoke('Bearer wrong-secret');
    assert.equal(invalid.statusCode, 401);
  } finally {
    Object.entries(previousEnvironment).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

test('scheduled reminders are sent to the documented mailbox', async () => {
  const routes = new Map();
  registerServiceCallReminderRoutes({
    get: (path, handler) => routes.set(`GET ${path}`, handler),
    post: (path, handler) => routes.set(`POST ${path}`, handler)
  }, {
    serviceCalls: {
      claimDueReminders: async () => [{
        id: 7,
        reminder_cycle: 0,
        reminder_stage: 0,
        soin: 'SO-123',
        customer_name: 'Charom',
        model: 'Moto Edge',
        submission_at: '2026-10-27T05:45:00.000Z',
        relog_due_at: '2026-10-29T04:45:00.000Z'
      }],
      completeReminder: async () => true
    }
  });
  const previousEnvironment = {
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    APP_URL: process.env.APP_URL,
    EMAIL_ACTION_SECRET: process.env.EMAIL_ACTION_SECRET
  };
  const cronSecret = 'cron-secret-used-only-for-the-delivery-test';
  Object.assign(process.env, {
    CRON_SECRET: cronSecret,
    RESEND_API_KEY: 'test-resend-key',
    RESEND_FROM_EMAIL: 'sender@example.com',
    APP_URL: 'https://api.example.com',
    EMAIL_ACTION_SECRET: 'email-action-secret-used-only-for-the-test'
  });
  const previousFetch = global.fetch;
  let requestBody;
  global.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, text: async () => '' };
  };
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };

  try {
    await routes.get('GET /api/service-calls/reminders')({
      get: () => `Bearer ${cronSecret}`
    }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { sent: 1 });
    assert.deepEqual(requestBody.to, ['charom.ram.ayodhya@gmail.com']);
  } finally {
    global.fetch = previousFetch;
    Object.entries(previousEnvironment).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

test('email SOIN action token is signed and bound to a reminder cycle', () => {
  const secret = 'a-secure-test-secret-that-is-at-least-32-characters';
  const token = createActionToken('42', 3, secret);

  assert.deepEqual(readActionToken(token, secret), { id: '42', cycle: 3 });
  assert.equal(readActionToken(token, 'a-different-secret-with-32-characters'), null);
  assert.equal(readActionToken(`${token}x`, secret), null);
  assert.equal(readActionToken('not-a-token', secret), null);
});

test('reminder email sends one 47-hour reminder with an escaped SOIN update link', () => {
  const call = {
    id: 7,
    reminder_cycle: 2,
    soin: '<SOIN&>',
    customer_name: 'Charom',
    model: 'Moto <Edge>',
    submission_at: '2026-10-27T05:45:00.000Z',
    relog_due_at: '2026-10-29T04:45:00.000Z'
  };
  const email = buildReminderEmail(call, 'signed-token', 'https://api.example.com');

  assert.match(email.subject, /47-hour reminder/);
  assert.match(email.html, /&lt;SOIN&amp;&gt;/);
  assert.match(email.html, /Moto &lt;Edge&gt;/);
  assert.match(email.html, /https:\/\/api\.example\.com\/api\/service-calls\/email-update\/signed-token/);
  assert.doesNotMatch(email.subject, /follow-up/);
  assert.doesNotMatch(email.text, /One hour has passed/);
});

test('47-hour deadline and manual parts-approval email status remain independent', () => {
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
  assert.equal(call.mail_sent, true);

  const updatedCall = parseCall({ mail_sent: false }, call);
  assert.equal(updatedCall.mail_sent, false);
  assert.equal(updatedCall.relog_due_at, call.relog_due_at);
});
