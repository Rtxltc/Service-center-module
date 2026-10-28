const crypto = require('crypto');

const RECIPIENT = 'gyashu428@gmail.com';
const SENDER_NAME = 'Charom Helper Automation';
const MAX_SOIN_LENGTH = 100;

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const createActionToken = (id, cycle, secret) => {
  const payload = Buffer.from(`${id}:${cycle}`).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const readActionToken = (token, secret) => {
  if (typeof token !== 'string' || token.length > 300) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return null;

  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  let decoded;
  try {
    decoded = Buffer.from(payload, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const match = /^([1-9]\d*):(0|[1-9]\d*)$/.exec(decoded);
  if (!match) return null;
  return { id: match[1], cycle: Number(match[2]) };
};

const formatIndiaDateTime = (value) => new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(value));

const getEmailConfiguration = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.APP_URL;
  const actionSecret = process.env.EMAIL_ACTION_SECRET;
  if (!apiKey || !fromEmail || !appUrl || !actionSecret) {
    throw new Error('RESEND_API_KEY, RESEND_FROM_EMAIL, APP_URL, and EMAIL_ACTION_SECRET must be configured.');
  }
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(fromEmail)) {
    throw new Error('RESEND_FROM_EMAIL must be a verified sender email address.');
  }
  if (actionSecret.length < 32) throw new Error('EMAIL_ACTION_SECRET must be at least 32 characters long.');
  if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 32) {
    throw new Error('CRON_SECRET must be at least 32 characters long.');
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(appUrl);
  } catch {
    throw new Error('APP_URL must be an absolute URL for the deployed backend.');
  }
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== 'https:' && !isLocalHost) {
    throw new Error('APP_URL must use HTTPS outside localhost.');
  }
  return {
    apiKey,
    from: `${SENDER_NAME} <${fromEmail}>`,
    appUrl: parsedUrl.origin,
    actionSecret
  };
};

const buildReminderEmail = (call, token, appUrl) => {
  const subject = `47-hour reminder: update SOIN ${call.soin}`;
  const heading = '47-hour service-call reminder';
  const intro = 'The 47-hour service-call turnaround time has passed. Please update the SOIN.';
  const updateUrl = `${appUrl}/api/service-calls/email-update/${token}`;
  const details = [
    ['SOIN', call.soin],
    ['Customer', call.customer_name],
    ['Device', call.model],
    ['Phone submission', formatIndiaDateTime(call.submission_at)],
    ['TAT deadline', formatIndiaDateTime(call.relog_due_at)]
  ];
  const rows = details.map(([label, value]) => (
    `<tr><th align="left" style="padding:8px 12px 8px 0">${escapeHtml(label)}</th><td style="padding:8px 0">${escapeHtml(value)}</td></tr>`
  )).join('');
  const safeUrl = escapeHtml(updateUrl);
  return {
    subject,
    text: `${heading}\n\n${intro}\n\n${details.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nUpdate SOIN: ${updateUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#202124">
      <h2>${heading}</h2><p>${intro}</p>
      <table>${rows}</table>
      <p style="margin:24px 0"><a href="${safeUrl}" style="background:#1769aa;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Update SOIN</a></p>
      <p>Updating the SOIN starts a new 47-hour reminder cycle.</p>
      <p style="color:#666;font-size:12px">Charom Helper Automation</p>
    </div>`
  };
};

const sendResendEmail = async (configuration, call, token) => {
  const message = buildReminderEmail(call, token, configuration.appUrl);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    headers: {
      Authorization: `Bearer ${configuration.apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `service-call-${call.id}-cycle-${call.reminder_cycle}-stage-1`
    },
    body: JSON.stringify({
      from: configuration.from,
      to: [RECIPIENT],
      subject: message.subject,
      text: message.text,
      html: message.html
    })
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Resend request failed (${response.status}): ${responseText.slice(0, 500)}`);
  }
};

const htmlPage = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>${escapeHtml(title)}</title>
<style>body{font:16px Arial,sans-serif;background:#f4f6f8;color:#202124;margin:0;padding:32px}.card{max-width:520px;margin:8vh auto;background:white;padding:28px;border-radius:12px;box-shadow:0 4px 20px #0001}label{display:block;margin:20px 0 8px}input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #bbb;border-radius:6px;font-size:16px}button{padding:12px 18px;background:#1769aa;color:white;border:0;border-radius:6px;font-size:16px;cursor:pointer}.brand{color:#555;font-size:13px}</style>
</head><body><main class="card"><p class="brand">${SENDER_NAME}</p>${body}</main></body></html>`;

const sendNoStorePage = (res, status, title, body) => res
  .status(status)
  .set('Cache-Control', 'no-store')
  .set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'")
  .type('html')
  .send(htmlPage(title, body));

const registerServiceCallReminderRoutes = (app, db) => {
  app.get('/api/service-calls/reminders/health', (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return res.status(503).json({ error: 'CRON_SECRET is not configured.' });
    const authorization = req.get('Authorization') || '';
    const expected = Buffer.from(`Bearer ${cronSecret}`);
    const supplied = Buffer.from(authorization);
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      getEmailConfiguration();
      return res.json({
        status: 'ok',
        message: 'Cron request authenticated; reminder email configuration is present.',
        email_sent: false,
        checked_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Service-call reminder health check failed:', error.message);
      return res.status(503).json({ error: error.message });
    }
  });

  app.get('/api/service-calls/reminders', async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return res.status(503).json({ error: 'CRON_SECRET is not configured.' });
    const authorization = req.get('Authorization') || '';
    const expected = Buffer.from(`Bearer ${cronSecret}`);
    const supplied = Buffer.from(authorization);
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let configuration;
    try {
      configuration = getEmailConfiguration();
    } catch (error) {
      console.error('Service-call reminder email configuration error:', error.message);
      return res.status(503).json({ error: error.message });
    }

    let dueCalls;
    try {
      dueCalls = await db.serviceCalls.claimDueReminders();
    } catch (error) {
      console.error('Failed to claim due service-call reminders:', error);
      return res.status(500).json({ error: 'Failed to load due service-call reminders.' });
    }

    let sent = 0;
    const failures = [];
    for (const call of dueCalls) {
      const token = createActionToken(call.id, call.reminder_cycle, configuration.actionSecret);
      try {
        await sendResendEmail(configuration, call, token);
        await db.serviceCalls.completeReminder(
          call.id,
          call.reminder_cycle,
          call.reminder_stage
        );
        sent += 1;
      } catch (error) {
        failures.push(String(call.id));
        console.error(`Failed to send service-call reminder for call ${call.id}:`, error);
        try {
          await db.serviceCalls.releaseReminderClaim(call.id, call.reminder_cycle, call.reminder_stage);
        } catch (releaseError) {
          console.error(`Failed to release reminder claim for call ${call.id}:`, releaseError);
        }
      }
    }

    if (failures.length) {
      return res.status(502).json({ sent, failed_call_ids: failures });
    }
    return res.json({ sent });
  });

  app.get('/api/service-calls/email-update/:token', async (req, res) => {
    const secret = process.env.EMAIL_ACTION_SECRET;
    if (!secret) return sendNoStorePage(res, 503, 'Unavailable', '<h1>Update unavailable</h1><p>Email SOIN updates are not configured.</p>');
    const action = readActionToken(req.params.token, secret);
    if (!action) return sendNoStorePage(res, 404, 'Link unavailable', '<h1>Link unavailable</h1><p>This SOIN update link is invalid or has expired.</p>');
    try {
      const call = await db.serviceCalls.get(action.id);
      if (!call || Number(call.reminder_cycle) !== action.cycle || Number(call.reminder_stage) < 1) {
        return sendNoStorePage(res, 404, 'Link unavailable', '<h1>Link unavailable</h1><p>This SOIN update link is invalid or has expired.</p>');
      }
      const body = `<h1>Update SOIN</h1><p>Enter the new SOIN for ${escapeHtml(call.customer_name)} — ${escapeHtml(call.model)}.</p>
        <form method="post" action="/api/service-calls/email-update/${encodeURIComponent(req.params.token)}">
          <label for="soin">New SOIN</label>
          <input id="soin" name="soin" value="${escapeHtml(call.soin)}" maxlength="${MAX_SOIN_LENGTH}" required autocomplete="off">
          <p><button type="submit">Update SOIN</button></p>
        </form>`;
      return sendNoStorePage(res, 200, 'Update SOIN', body);
    } catch (error) {
      console.error('Failed to open service-call SOIN email action:', error);
      return sendNoStorePage(res, 500, 'Unable to load', '<h1>Unable to load</h1><p>Please try again later.</p>');
    }
  });

  app.post('/api/service-calls/email-update/:token', async (req, res) => {
    const secret = process.env.EMAIL_ACTION_SECRET;
    if (!secret) return sendNoStorePage(res, 503, 'Unavailable', '<h1>Update unavailable</h1><p>Email SOIN updates are not configured.</p>');
    const action = readActionToken(req.params.token, secret);
    if (!action) return sendNoStorePage(res, 404, 'Link unavailable', '<h1>Link unavailable</h1><p>This SOIN update link is invalid or has expired.</p>');
    const soin = typeof req.body.soin === 'string' ? req.body.soin.trim() : '';
    if (!soin || soin.length > MAX_SOIN_LENGTH || /[\u0000-\u001f\u007f]/.test(soin)) {
      return sendNoStorePage(res, 400, 'Invalid SOIN', '<h1>Invalid SOIN</h1><p>Enter a SOIN of 1–100 characters without control characters, then return to the form and try again.</p>');
    }
    try {
      const current = await db.serviceCalls.get(action.id);
      if (!current || Number(current.reminder_cycle) !== action.cycle || Number(current.reminder_stage) < 1) {
        return sendNoStorePage(res, 404, 'Link unavailable', '<h1>Link unavailable</h1><p>This SOIN update link is invalid or has expired.</p>');
      }
      if (current.soin === soin) {
        return sendNoStorePage(res, 400, 'SOIN unchanged', '<h1>SOIN unchanged</h1><p>Enter a different SOIN to restart the reminder timer.</p>');
      }
      const result = await db.serviceCalls.updateSoinFromEmail(action.id, action.cycle, soin);
      if (!result) {
        return sendNoStorePage(res, 409, 'Link already used', '<h1>SOIN was not changed</h1><p>This link is no longer active. The SOIN may already have been updated.</p>');
      }
      return sendNoStorePage(res, 200, 'SOIN updated', `<h1>SOIN updated</h1><p>The SOIN is now <strong>${escapeHtml(result.call.soin)}</strong>.</p><p>A new 47-hour reminder timer has started.</p>`);
    } catch (error) {
      if (error.code === '23505') {
        return sendNoStorePage(res, 409, 'SOIN already in use', '<h1>SOIN already in use</h1><p>That SOIN belongs to another service call. Go back and enter a different SOIN.</p>');
      }
      console.error('Failed to update SOIN from reminder email:', error);
      return sendNoStorePage(res, 500, 'Unable to update SOIN', '<h1>Unable to update SOIN</h1><p>Please try again later.</p>');
    }
  });
};

module.exports = {
  registerServiceCallReminderRoutes,
  createActionToken,
  readActionToken,
  buildReminderEmail
};
