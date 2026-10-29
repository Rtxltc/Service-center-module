const crypto = require('crypto');

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const USERINFO_EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';
const MAX_IMAGE_COUNT = 6;
const MAX_IMAGE_BYTES = 500 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 2_500 * 1024;
const EMAIL_PATTERN = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
const DEFAULT_TO = ['ordernu2@gmail.com', 'ordernu4@gmail.com'];
const DEFAULT_CC = ['ordernu5@gmail.com', 'ordernu11@gmail.com', 'ordernu13@gmail.com'];

const readConfiguration = () => {
  const {
    GMAIL_OAUTH_CLIENT_ID: clientId,
    GMAIL_OAUTH_CLIENT_SECRET: clientSecret,
    GMAIL_OAUTH_REDIRECT_URI: redirectUri,
    GMAIL_OAUTH_STATE_SECRET: stateSecret,
    GMAIL_TOKEN_ENCRYPTION_KEY: encryptionKey
  } = process.env;
  const missing = [
    ['GMAIL_OAUTH_CLIENT_ID', clientId],
    ['GMAIL_OAUTH_CLIENT_SECRET', clientSecret],
    ['GMAIL_OAUTH_REDIRECT_URI', redirectUri],
    ['GMAIL_OAUTH_STATE_SECRET', stateSecret],
    ['GMAIL_TOKEN_ENCRYPTION_KEY', encryptionKey]
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing Gmail environment variables: ${missing.join(', ')}`);
  }
  if (stateSecret.length < 32) throw new Error('GMAIL_OAUTH_STATE_SECRET must be at least 32 characters.');
  if (!/^[\da-f]{64}$/i.test(encryptionKey)) {
    throw new Error('GMAIL_TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes).');
  }
  let redirect;
  try {
    redirect = new URL(redirectUri);
  } catch {
    throw new Error('GMAIL_OAUTH_REDIRECT_URI must be an absolute URL.');
  }
  if (redirect.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(redirect.hostname)) {
    throw new Error('GMAIL_OAUTH_REDIRECT_URI must use HTTPS outside localhost.');
  }
  return {
    clientId,
    clientSecret,
    redirectUri: redirect.href,
    stateSecret,
    encryptionKey: Buffer.from(encryptionKey, 'hex'),
    expectedSender: (process.env.GMAIL_SENDER_EMAIL || 'ordernu13@gmail.com').trim().toLowerCase()
  };
};

const signState = (secret, now = Date.now()) => {
  const payload = Buffer.from(JSON.stringify({
    issuedAt: now,
    nonce: crypto.randomBytes(24).toString('base64url')
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const verifyState = (state, secret, now = Date.now()) => {
  if (typeof state !== 'string' || state.length > 1000) return false;
  const [payload, signature, extra] = state.split('.');
  if (!payload || !signature || extra !== undefined) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  const supplied = Buffer.from(signature, 'base64url');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(expected, supplied)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(data.issuedAt)
      && now >= data.issuedAt
      && now - data.issuedAt <= 10 * 60 * 1000
      && typeof data.nonce === 'string';
  } catch {
    return false;
  }
};

const encryptRefreshToken = (token, key) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
};

const decryptRefreshToken = (encryptedToken, key) => {
  const payload = Buffer.from(encryptedToken, 'base64url');
  if (payload.length < 29) throw new Error('Stored Gmail authorization token is invalid.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString('utf8');
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const parseRecipients = (value, label, required) => {
  if (!Array.isArray(value) || value.length > 25) {
    throw Object.assign(new Error(`${label} must be a list of no more than 25 email addresses.`), { status: 400 });
  }
  const normalized = value.map(item => typeof item === 'string' ? item.trim().toLowerCase() : '');
  if (normalized.some(item => item.length > 320 || !EMAIL_PATTERN.test(item))) {
    throw Object.assign(new Error(`${label} contains an invalid email address.`), { status: 400 });
  }
  const unique = [...new Set(normalized)];
  if (required && unique.length === 0) {
    throw Object.assign(new Error('Add at least one To recipient.'), { status: 400 });
  }
  return unique;
};

const safeHeader = (value) => String(value ?? '').replace(/[\r\n]/g, ' ').trim();

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const buildApprovalSubject = (call) => (
  `RRL-103/Charom Enterprises, Ayodhya/${safeHeader(call.soin)}/${safeHeader(call.market_name)}/${safeHeader(call.issue_description)}`
);

const foldHeader = (name, value) => {
  const words = [];
  let current = '';
  for (const character of value) {
    if (current && Buffer.byteLength(current + character, 'utf8') > 40) {
      words.push(current);
      current = '';
    }
    current += character;
  }
  if (current) words.push(current);
  return words.map((word, index) => (
    `${index === 0 ? `${name}: ` : ' '}=?UTF-8?B?${Buffer.from(word, 'utf8').toString('base64')}?=`
  ));
};

const foldAddressHeader = (name, addresses) => {
  const lines = [];
  let line = `${name}:`;
  addresses.forEach((address, index) => {
    const item = `${index ? ',' : ' '}${address}`;
    if (line.length + item.length > 78 && line.length > name.length + 1) {
      lines.push(line);
      line = ` ${address}`;
    } else {
      line += item;
    }
  });
  if (line.length > name.length + 1) lines.push(line);
  return lines;
};

const validateApprovalEmail = (call, body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(new Error('Approval email details are invalid.'), { status: 400 });
  }
  if (!call.market_name || !call.activation_date || !call.warranty_expiry_date || !call.mtm_number) {
    throw Object.assign(new Error('Add Market name, MTM number, Activation date, and Warranty expiry date to the service call before sending.'), { status: 400 });
  }
  const to = parseRecipients(body.to, 'To', true);
  const cc = parseRecipients(body.cc || [], 'CC', false).filter(address => !to.includes(address));
  const requestText = typeof body.request_text === 'string' ? body.request_text.trim() : '';
  const remark = typeof body.remark === 'string' ? body.remark.trim() : '';
  const videoLink = typeof body.video_link === 'string' ? body.video_link.trim() : '';
  if (!requestText || requestText.length > 2000) {
    throw Object.assign(new Error('Approval request must be between 1 and 2,000 characters.'), { status: 400 });
  }
  if (!remark || remark.length > 5000) {
    throw Object.assign(new Error('Technician remark must be between 1 and 5,000 characters.'), { status: 400 });
  }
  if (videoLink) {
    let url;
    try {
      url = new URL(videoLink);
    } catch {
      throw Object.assign(new Error('Video link must be a valid HTTPS URL.'), { status: 400 });
    }
    if (url.protocol !== 'https:') {
      throw Object.assign(new Error('Video link must use HTTPS.'), { status: 400 });
    }
  }
  if (!Array.isArray(body.images) || body.images.length < 1 || body.images.length > MAX_IMAGE_COUNT) {
    throw Object.assign(new Error(`Attach between 1 and ${MAX_IMAGE_COUNT} images.`), { status: 400 });
  }
  let totalImageBytes = 0;
  const images = body.images.map((image, index) => {
    if (!image || typeof image !== 'object' || typeof image.data !== 'string') {
      throw Object.assign(new Error(`Image ${index + 1} is invalid.`), { status: 400 });
    }
    const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(image.mime_type) ? image.mime_type : '';
    const base64 = image.data.replace(/^data:image\/(?:jpeg|png|webp);base64,/i, '');
    if (!mimeType || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 === 1) {
      throw Object.assign(new Error(`Image ${index + 1} must be a valid JPEG, PNG, or WebP image.`), { status: 400 });
    }
    const data = Buffer.from(base64, 'base64');
    if (data.length === 0 || data.length > MAX_IMAGE_BYTES) {
      throw Object.assign(new Error(`Each image must be smaller than ${MAX_IMAGE_BYTES / 1024} KB.`), { status: 400 });
    }
    totalImageBytes += data.length;
    const filename = typeof image.name === 'string' ? image.name.replace(/[^\w.-]/g, '_').slice(0, 80) : `image-${index + 1}.jpg`;
    return { data, mimeType, filename: filename || `image-${index + 1}.jpg` };
  });
  if (totalImageBytes > MAX_TOTAL_IMAGE_BYTES) {
    throw Object.assign(new Error('Combined image size must be no more than 2,500 KB.'), { status: 400 });
  }
  return { to, cc, requestText, remark, videoLink, images };
};

const buildMimeMessage = (call, details, sender) => {
  const subject = buildApprovalSubject(call);
  const boundary = `charom_${crypto.randomBytes(18).toString('hex')}`;
  const alternativeBoundary = `charom_alt_${crypto.randomBytes(12).toString('hex')}`;
  const htmlRows = [
    ['SO NO', call.soin],
    ['IMEI 1', call.imei || '—'],
    ['IMEI 2', call.second_imei || '—'],
    ['Model No', call.model],
    ['Activation Date', formatDate(call.activation_date)],
    ['Warranty End Date', formatDate(call.warranty_expiry_date)]
  ].map(([label, value]) => (
    `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
  )).join('');
  const video = details.videoLink
    ? `<p>Video Link: <a href="${escapeHtml(details.videoLink)}">${escapeHtml(details.videoLink)}</a></p>`
    : '';
  const html = `<div style="font-family:Arial,sans-serif;color:#202124">
    <p>Dear Sir,</p>
    <p>Request for approval:<br>${escapeHtml(details.requestText).replace(/\n/g, '<br>')}</p>
    <p>${htmlRows}</p>
    <p>Fault Description: ${escapeHtml(call.issue_description)}</p>
    <p>Remark: ${escapeHtml(details.remark)}</p>
    ${video}
    <table style="border-collapse:collapse;text-align:center">
      <thead><tr style="background:#ffff00"><th>SL NO</th><th>MODEL</th><th>IMEI 1</th><th>IMEI 2</th><th>MTM</th><th>Activation Date</th></tr></thead>
      <tbody><tr><td>1</td><td>${escapeHtml(call.model)}</td><td>${escapeHtml(call.imei || '—')}</td><td>${escapeHtml(call.second_imei || '—')}</td><td>${escapeHtml(call.mtm_number)}</td><td>${escapeHtml(formatDate(call.activation_date))}</td></tr></tbody>
    </table>
    <p>Photos are attached with this email.</p>
  </div>`;
  const text = [
    'Dear Sir,',
    '',
    'Request for approval:',
    details.requestText,
    '',
    `SO NO: ${call.soin}`,
    `IMEI 1: ${call.imei || '—'}`,
    `IMEI 2: ${call.second_imei || '—'}`,
    `Model No: ${call.model}`,
    `Activation Date: ${formatDate(call.activation_date)}`,
    `Warranty End Date: ${formatDate(call.warranty_expiry_date)}`,
    '',
    `Fault Description: ${call.issue_description}`,
    `Remark: ${details.remark}`,
    ...(details.videoLink ? ['', `Video Link: ${details.videoLink}`] : []),
    '',
    'SL NO | MODEL | IMEI 1 | IMEI 2 | MTM | Activation Date',
    `1 | ${call.model} | ${call.imei || '—'} | ${call.second_imei || '—'} | ${call.mtm_number} | ${formatDate(call.activation_date)}`,
    '',
    'Photos are attached with this email.'
  ].join('\r\n');
  const lines = [
    `From: ${sender}`,
    ...foldAddressHeader('To', details.to),
    ...(details.cc.length ? foldAddressHeader('Cc', details.cc) : []),
    ...foldHeader('Subject', subject),
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
    '',
    `--${alternativeBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(text, 'utf8').toString('base64'),
    `--${alternativeBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf8').toString('base64'),
    `--${alternativeBoundary}--`
  ];
  details.images.forEach(image => {
    lines.push(
      `--${boundary}`,
      `Content-Type: ${image.mimeType}; name="${image.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${image.filename}"`,
      '',
      image.data.toString('base64').match(/.{1,76}/g).join('\r\n')
    );
  });
  lines.push(`--${boundary}--`, '');
  return { subject, raw: Buffer.from(lines.join('\r\n'), 'utf8').toString('base64url') };
};

const exchangeAuthorizationCode = async (configuration, code) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: configuration.clientId,
      client_secret: configuration.clientSecret,
      redirect_uri: configuration.redirectUri,
      grant_type: 'authorization_code'
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Google OAuth token exchange failed (${response.status}): ${data.error_description || data.error || 'unknown error'}`);
  if (!data.refresh_token) throw new Error('Google did not return a refresh token. Revoke the app access in Google Account permissions and connect again.');
  return data;
};

const getGoogleEmail = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000)
  });
  const data = await response.json();
  if (!response.ok || !data.email || data.verified_email !== true) {
    throw new Error(`Unable to verify the authorized Google account (${response.status}).`);
  }
  return String(data.email).toLowerCase();
};

const getAccessToken = async (configuration, refreshToken) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: configuration.clientId,
      client_secret: configuration.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(`Gmail authorization refresh failed (${response.status}): ${data.error_description || data.error || 'Reconnect Gmail.'}`);
  }
  return data.access_token;
};

const registerGmailApprovalRoutes = (app, db, checkAdminAuth) => {
  app.get('/api/admin/gmail/status', checkAdminAuth, async (req, res) => {
    try {
      const saved = await db.gmailOAuth.getCredentials();
      res.json({
        connected: Boolean(saved),
        email: saved?.email || null,
        expected_email: process.env.GMAIL_SENDER_EMAIL || 'ordernu13@gmail.com'
      });
    } catch (error) {
      console.error('Failed to load Gmail connection status:', error);
      res.status(500).json({ error: 'Failed to load Gmail connection status.' });
    }
  });

  app.post('/api/admin/gmail/connect', checkAdminAuth, (req, res) => {
    try {
      const configuration = readConfiguration();
      const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authorizationUrl.search = new URLSearchParams({
        client_id: configuration.clientId,
        redirect_uri: configuration.redirectUri,
        response_type: 'code',
        scope: `openid email ${USERINFO_EMAIL_SCOPE} ${GMAIL_SEND_SCOPE}`,
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        state: signState(configuration.stateSecret)
      }).toString();
      res.json({ authorization_url: authorizationUrl.toString(), redirect_uri: configuration.redirectUri });
    } catch (error) {
      console.error('Unable to start Gmail OAuth connection:', error.message);
      res.status(503).json({ error: error.message });
    }
  });

  app.get('/api/admin/gmail/oauth/callback', async (req, res) => {
    let configuration;
    try {
      configuration = readConfiguration();
      if (!verifyState(req.query.state, configuration.stateSecret)) {
        return res.status(400).type('text').send('Gmail authorization state is invalid or expired. Start the connection again from the admin portal.');
      }
      if (req.query.error) {
        return res.status(400).type('text').send(`Google authorization was not completed: ${safeHeader(req.query.error_description || req.query.error)}`);
      }
      if (typeof req.query.code !== 'string') return res.status(400).type('text').send('Google did not return an authorization code.');

      const tokenData = await exchangeAuthorizationCode(configuration, req.query.code);
      const email = await getGoogleEmail(tokenData.access_token);
      if (email !== configuration.expectedSender) {
        return res.status(403).type('text').send(`Connected Google account ${escapeHtml(email)} does not match configured sender ${escapeHtml(configuration.expectedSender)}. No credentials were saved.`);
      }
      const encrypted = encryptRefreshToken(tokenData.refresh_token, configuration.encryptionKey);
      await db.gmailOAuth.saveCredentials(email, encrypted);
      return res.status(200).type('html').send(
        '<!doctype html><html><head><meta charset="utf-8"><title>Gmail connected</title></head><body style="font:16px Arial,sans-serif;padding:32px"><h1>Gmail connected</h1><p>The approval-mail sender account is connected. You can close this tab and return to the service calls page.</p></body></html>'
      );
    } catch (error) {
      console.error('Gmail OAuth callback failed:', error);
      return res.status(500).type('text').send('Gmail connection failed. Check the backend logs and OAuth configuration, then try again.');
    }
  });

  app.post('/api/service-calls/:id/approval-email/retry', checkAdminAuth, async (req, res) => {
    try {
      if (req.body?.confirmed_not_sent !== true) {
        return res.status(400).json({ error: 'Confirm that you checked Gmail Sent and verified the message was not sent.' });
      }
      const call = await db.serviceCalls.get(req.params.id);
      if (!call) return res.status(404).json({ error: 'Service call not found.' });
      if (call.mail_sent) return res.status(409).json({ error: 'This approval email is already marked as sent.' });
      if (!call.approval_email_sending) return res.status(409).json({ error: 'There is no unresolved approval-email send to retry.' });
      await db.serviceCalls.releaseApprovalEmailClaim(call.id);
      return res.json({ success: true, message: 'Send lock cleared. You can prepare and send the approval email again.' });
    } catch (error) {
      console.error('Failed to clear approval-email send lock:', error);
      return res.status(500).json({ error: 'Failed to clear the approval-email send lock.' });
    }
  });

  app.get('/api/service-calls/:id/approval-email', checkAdminAuth, async (req, res) => {
    try {
      const call = await db.serviceCalls.get(req.params.id);
      if (!call) return res.status(404).json({ error: 'Service call not found.' });
      if (call.approval_email_sending) {
        return res.status(409).json({ error: 'An approval-email send is already in progress or needs its outcome checked.' });
      }
      if (!call.market_name || !call.activation_date || !call.warranty_expiry_date || !call.mtm_number) {
        return res.status(400).json({ error: 'Add Market name, MTM number, Activation date, and Warranty expiry date to the service call before preparing the email.' });
      }
      const connection = await db.gmailOAuth.getCredentials();
      const defaultTo = (process.env.GMAIL_APPROVAL_DEFAULT_TO || DEFAULT_TO.join(','))
        .split(',').map(value => value.trim()).filter(Boolean);
      const defaultCc = (process.env.GMAIL_APPROVAL_DEFAULT_CC || DEFAULT_CC.join(','))
        .split(',').map(value => value.trim()).filter(Boolean);
      res.json({
        call,
        connected: Boolean(connection),
        sender: connection?.email || process.env.GMAIL_SENDER_EMAIL || 'ordernu13@gmail.com',
        to: call.approval_email_to || defaultTo,
        cc: call.approval_email_cc || defaultCc,
        request_text: call.approval_request_text || 'Request for APPROVAL: ',
        remark: call.approval_remark || 'Physically opened and checked by technician; no trace of physical or liquid damage found, as shown in the attached photos and video.',
        video_link: call.approval_video_link || '',
        subject: buildApprovalSubject(call)
      });
    } catch (error) {
      console.error('Failed to prepare parts-approval email:', error);
      res.status(500).json({ error: 'Failed to prepare parts-approval email.' });
    }
  });

  app.post('/api/service-calls/:id/approval-email/send', checkAdminAuth, async (req, res) => {
    let claimed = false;
    let emailSent = false;
    let sendAttempted = false;
    let safeToReleaseClaim = true;
    try {
      const configuration = readConfiguration();
      const call = await db.serviceCalls.get(req.params.id);
      if (!call) return res.status(404).json({ error: 'Service call not found.' });
      if (call.mail_sent) return res.status(409).json({ error: 'Parts-approval email is already marked as sent.' });
      const details = validateApprovalEmail(call, req.body);
      const connection = await db.gmailOAuth.getCredentials();
      if (!connection) return res.status(409).json({ error: 'Connect the Gmail sender account before sending an approval email.' });
      if (connection.email !== configuration.expectedSender) {
        return res.status(409).json({ error: 'The connected Gmail account does not match GMAIL_SENDER_EMAIL. Reconnect the configured sender account.' });
      }
      claimed = await db.serviceCalls.claimApprovalEmail(call.id);
      if (!claimed) return res.status(409).json({ error: 'This approval email was already sent or another send is in progress.' });

      const refreshToken = decryptRefreshToken(connection.encrypted_refresh_token, configuration.encryptionKey);
      const accessToken = await getAccessToken(configuration, refreshToken);
      const message = buildMimeMessage(call, details, connection.email);
      sendAttempted = true;
      safeToReleaseClaim = false;
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        signal: AbortSignal.timeout(20000),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: message.raw })
      });
      if (!response.ok) {
        safeToReleaseClaim = response.status < 500;
        const responseBody = await response.text();
        let providerMessage = responseBody || 'unknown error';
        try {
          const parsed = JSON.parse(responseBody);
          providerMessage = parsed.error?.message || parsed.error || providerMessage;
        } catch {
          providerMessage = responseBody || 'unknown error';
        }
        throw new Error(`Gmail send failed (${response.status}): ${providerMessage}`);
      }
      emailSent = true;
      await response.text();
      const updatedCall = await db.serviceCalls.completeApprovalEmail(call.id, {
        subject: message.subject,
        to: details.to,
        cc: details.cc,
        requestText: details.requestText,
        remark: details.remark,
        videoLink: details.videoLink
      }, req.adminUser || 'admin');
      if (!updatedCall) {
        return res.status(502).json({ error: 'Gmail accepted the message, but the service-call approval status could not be saved. Do not retry until the call status has been checked.' });
      }
      return res.json({ success: true, message: 'Parts-approval email sent.', call: updatedCall });
    } catch (error) {
      console.error('Failed to send parts-approval email:', error);
      if (claimed && !emailSent && safeToReleaseClaim) {
        try {
          await db.serviceCalls.releaseApprovalEmailClaim(req.params.id);
        } catch (releaseError) {
          console.error('Failed to release parts-approval email send claim:', releaseError);
        }
      }
      const message = sendAttempted && !emailSent && !safeToReleaseClaim
        ? 'Gmail did not confirm the send result. Check the sender account’s Sent folder and the service-call status before retrying.'
        : error.message || 'Failed to send parts-approval email.';
      return res.status(error.status || 502).json({ error: message });
    }
  });
};

module.exports = {
  registerGmailApprovalRoutes,
  signState,
  verifyState,
  encryptRefreshToken,
  decryptRefreshToken,
  buildApprovalSubject,
  buildMimeMessage,
  validateApprovalEmail
};
