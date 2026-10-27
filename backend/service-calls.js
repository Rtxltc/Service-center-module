const { buildServiceCallsWorkbook } = require('./service-calls-xlsx');

const WARRANTY_STATUSES = ['In Warranty', 'Out of Warranty'];
const CALL_TYPES = ['Hardware', 'Software'];
const PART_STATUSES = ['Ordered', 'Not Yet Ordered'];
const PAYMENT_METHODS = ['Cash', 'QR'];
const DEVICE_TYPES = ['Mobile', 'Laptop'];
const TAT_STATUSES = ['IN TAT', 'TAT Missed'];
const MAX_PAGE_SIZE = 100;
const APPROACHING_TAT_MS = 6 * 60 * 60 * 1000;

const isDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const indiaDayBoundary = (day) => new Date(`${day}T00:00:00+05:30`);

const parseFilters = (query) => {
  const filters = {};
  const dateFrom = query.date_from;
  const dateTo = query.date_to;
  if (dateFrom !== undefined) {
    if (!isDateOnly(dateFrom)) throw Object.assign(new Error('date_from must be a valid YYYY-MM-DD date'), { status: 400 });
    filters.dateFrom = indiaDayBoundary(dateFrom).toISOString();
  }
  if (dateTo !== undefined) {
    if (!isDateOnly(dateTo)) throw Object.assign(new Error('date_to must be a valid YYYY-MM-DD date'), { status: 400 });
    const exclusiveDay = new Date(indiaDayBoundary(dateTo).getTime() + 24 * 60 * 60 * 1000);
    filters.dateToExclusive = exclusiveDay.toISOString();
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw Object.assign(new Error('date_from must be on or before date_to'), { status: 400 });
  }
  if (query.warranty_status !== undefined) {
    if (!WARRANTY_STATUSES.includes(query.warranty_status)) {
      throw Object.assign(new Error('Invalid warranty_status'), { status: 400 });
    }
    filters.warrantyStatus = query.warranty_status;
  }
  if (query.tat_status !== undefined) {
    if (!TAT_STATUSES.includes(query.tat_status)) {
      throw Object.assign(new Error('Invalid tat_status'), { status: 400 });
    }
    filters.tatStatus = query.tat_status;
  }
  if (query.approaching_tat !== undefined) {
    if (query.approaching_tat !== 'true') throw Object.assign(new Error('approaching_tat must be true'), { status: 400 });
    filters.approachingTat = true;
  }
  if (query.call_type !== undefined) {
    if (!CALL_TYPES.includes(query.call_type)) throw Object.assign(new Error('Invalid call_type'), { status: 400 });
    filters.callType = query.call_type;
  }
  if (query.part_order_status !== undefined) {
    if (!PART_STATUSES.includes(query.part_order_status)) {
      throw Object.assign(new Error('Invalid part_order_status'), { status: 400 });
    }
    filters.partOrderStatus = query.part_order_status;
  }
  if (query.mail_sent !== undefined) {
    if (query.mail_sent !== 'true' && query.mail_sent !== 'false') {
      throw Object.assign(new Error('mail_sent must be true or false'), { status: 400 });
    }
    filters.mailSent = query.mail_sent === 'true';
  }
  if (query.search !== undefined) {
    if (typeof query.search !== 'string' || query.search.length > 150) {
      throw Object.assign(new Error('search must be 150 characters or fewer'), { status: 400 });
    }
    filters.search = query.search.trim();
  }
  return filters;
};

const parseCall = (input, existing = null, administratorId = null) => {
  const merged = { ...(existing || {}), ...input };
  const requiredText = ['soin', 'customer_name', 'customer_contact', 'model', 'issue_description'];
  for (const field of requiredText) {
    if (typeof merged[field] !== 'string' || !merged[field].trim()) {
      throw Object.assign(new Error(`${field} is required`), { status: 400 });
    }
  }

  const soin = merged.soin.trim();
  if (soin.length > 100 || /[\u0000-\u001f\u007f]/.test(soin)) {
    throw Object.assign(new Error('SOIN must be 100 characters or fewer'), { status: 400 });
  }
  const customerName = merged.customer_name.trim();
  const contact = merged.customer_contact.trim();
  const model = merged.model.trim();
  const issue = merged.issue_description.trim();
  if (!DEVICE_TYPES.includes(merged.device_type)) {
    throw Object.assign(new Error('device_type must be Mobile or Laptop'), { status: 400 });
  }
  const digits = contact.replace(/\D/g, '');
  if (customerName.length > 150 || model.length > 150 || !/^\+?[\d\s()-]{7,25}$/.test(contact) || digits.length < 7 || digits.length > 15) {
    throw Object.assign(new Error('Customer name, contact, or model is invalid'), { status: 400 });
  }
  if (issue.length > 10000) throw Object.assign(new Error('Issue description is too long'), { status: 400 });
  if (merged.imei !== undefined && merged.imei !== null && String(merged.imei).trim() !== ''
    && !/^\d{15}$/.test(String(merged.imei).trim())) {
    throw Object.assign(new Error('IMEI must contain exactly 15 digits'), { status: 400 });
  }
  if (merged.device_type === 'Mobile' && !/^\d{15}$/.test(String(merged.imei || '').trim())) {
    throw Object.assign(new Error('IMEI is required for mobile devices and must contain exactly 15 digits'), { status: 400 });
  }
  if (!WARRANTY_STATUSES.includes(merged.warranty_status)) {
    throw Object.assign(new Error('warranty_status must be In Warranty or Out of Warranty'), { status: 400 });
  }
  if (!CALL_TYPES.includes(merged.call_type)) {
    throw Object.assign(new Error('call_type must be Hardware or Software'), { status: 400 });
  }
  if (!PART_STATUSES.includes(merged.part_order_status)) {
    throw Object.assign(new Error('part_order_status must be Ordered or Not Yet Ordered'), { status: 400 });
  }
  if (typeof merged.mail_sent !== 'boolean') {
    throw Object.assign(new Error('mail_sent must be a boolean'), { status: 400 });
  }
  const submissionAt = new Date(merged.submission_at);
  if (!merged.submission_at || Number.isNaN(submissionAt.getTime())) {
    throw Object.assign(new Error('submission_at must be a valid date and time'), { status: 400 });
  }

  const amountValue = (value, field) => {
    if (value === null || value === undefined || value === '') return null;
    const text = String(value);
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(text) || !Number.isFinite(Number(text))) {
      throw Object.assign(new Error(`${field} must be a non-negative amount with up to two decimal places`), { status: 400 });
    }
    return Number(text).toFixed(2);
  };
  const financialValue = (field) => (
    existing && merged.warranty_status === 'In Warranty'
      && (input[field] === null || input[field] === '' || input[field] === undefined)
      && existing[field] != null
      ? existing[field]
      : merged[field]
  );
  const quotationAmount = amountValue(financialValue('quotation_amount'), 'quotation_amount');
  const submittedAmount = amountValue(financialValue('submitted_amount'), 'submitted_amount');
  const paymentMethod = financialValue('payment_method') || null;
  if (merged.warranty_status === 'Out of Warranty') {
    if (quotationAmount === null || submittedAmount === null || !PAYMENT_METHODS.includes(paymentMethod)) {
      throw Object.assign(new Error('Out-of-warranty calls require quotation_amount, submitted_amount, and Cash or QR payment_method'), { status: 400 });
    }
  } else if (paymentMethod !== null && !PAYMENT_METHODS.includes(paymentMethod)) {
    throw Object.assign(new Error('payment_method must be Cash or QR'), { status: 400 });
  }

  return {
    soin,
    device_type: merged.device_type,
    imei: merged.imei ? String(merged.imei).trim() : null,
    customer_name: customerName,
    customer_contact: contact,
    model,
    issue_description: issue,
    warranty_status: merged.warranty_status,
    call_type: merged.call_type,
    part_order_status: merged.part_order_status,
    mail_sent: merged.mail_sent,
    submission_at: submissionAt.toISOString(),
    relog_due_at: new Date(submissionAt.getTime() + 47 * 60 * 60 * 1000).toISOString(),
    quotation_amount: quotationAmount,
    submitted_amount: submittedAmount,
    payment_method: paymentMethod,
    created_by: existing ? existing.created_by : administratorId,
    updated_by: administratorId
  };
};

const decorateCall = (call, now = Date.now()) => {
  const due = new Date(call.relog_due_at).getTime();
  const remaining = due - now;
  return {
    ...call,
    tat_status: remaining > 0 ? 'IN TAT' : 'TAT Missed',
    tat_as_of: new Date(now).toISOString(),
    remaining_ms: remaining > 0 ? remaining : 0,
    overdue_ms: remaining <= 0 ? Math.abs(remaining) : 0
  };
};

const safeError = (res, error, fallback = 'Service call request failed') => {
  if (error.status && !error.code) return res.status(error.status).json({ error: error.message });
  if (error.code === '23505') {
    return res.status(409).json({ error: 'That SOIN is already in use.' });
  }
  console.error(fallback, error);
  return res.status(500).json({ error: fallback });
};

const indiaDate = (date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};
const rupeesToPaise = (value) => Math.round(Number(value || 0) * 100);

const registerServiceCallRoutes = (app, db, checkAdminAuth) => {
  const base = '/api/service-calls';

  app.get(`${base}/dashboard`, checkAdminAuth, async (req, res) => {
    try {
      const calls = await db.serviceCalls.all();
      const now = Date.now();
      const today = indiaDate(new Date(now));
      const enriched = calls.map(call => decorateCall(call, now));
      const upcoming = enriched.filter(call => call.tat_status === 'IN TAT' && call.remaining_ms <= APPROACHING_TAT_MS);
      const missed = enriched.filter(call => call.tat_status === 'TAT Missed');
      const alerts = [
        ...missed.sort((a, b) => new Date(a.relog_due_at) - new Date(b.relog_due_at)),
        ...upcoming.sort((a, b) => new Date(a.relog_due_at) - new Date(b.relog_due_at))
      ].slice(0, 50);
      const count = (predicate) => calls.filter(predicate).length;
      res.json({
        stats: {
          total: calls.length,
          submitted_today: count(call => indiaDate(new Date(call.submission_at)) === today),
          in_tat: enriched.filter(call => call.tat_status === 'IN TAT').length,
          tat_missed: missed.length,
          approaching_tat: upcoming.length,
          hardware: count(call => call.call_type === 'Hardware'),
          software: count(call => call.call_type === 'Software'),
          in_warranty: count(call => call.warranty_status === 'In Warranty'),
          out_of_warranty: count(call => call.warranty_status === 'Out of Warranty'),
          parts_ordered: count(call => call.part_order_status === 'Ordered'),
          parts_not_ordered: count(call => call.part_order_status === 'Not Yet Ordered'),
          mail_sent: count(call => call.mail_sent),
          mail_not_sent: count(call => !call.mail_sent),
          quoted_total: calls.filter(call => call.warranty_status === 'Out of Warranty')
            .reduce((sum, call) => sum + rupeesToPaise(call.quotation_amount), 0) / 100,
          submitted_total: calls.filter(call => call.warranty_status === 'Out of Warranty')
            .reduce((sum, call) => sum + rupeesToPaise(call.submitted_amount), 0) / 100
        },
        alerts
      });
    } catch (error) {
      safeError(res, error, 'Failed to load service call dashboard');
    }
  });

  app.get(`${base}/export`, checkAdminAuth, async (req, res) => {
    try {
      const filters = parseFilters(req.query);
      if (filters.approachingTat) filters.tatStatus = 'IN TAT';
      const calls = (await db.serviceCalls.all(filters)).map(call => decorateCall(call));
      if (calls.length === 0) return res.status(404).json({ error: 'No service calls match the selected filters.' });
      const workbook = buildServiceCallsWorkbook(calls);
      const date = indiaDate(new Date());
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="CharomResQ_ServiceCalls_${date}.xlsx"`);
      res.setHeader('Content-Length', workbook.length);
      return res.send(workbook);
    } catch (error) {
      return safeError(res, error, 'Failed to export service calls');
    }
  });

  app.get(`${base}`, checkAdminAuth, async (req, res) => {
    try {
      const filters = parseFilters(req.query);
      if (filters.approachingTat) filters.tatStatus = 'IN TAT';
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.page_size || 25);
      if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
        return res.status(400).json({ error: `page must be positive and page_size must be between 1 and ${MAX_PAGE_SIZE}` });
      }
      const sortBy = req.query.sort_by || 'submission_at';
      if (!['submission_at', 'soin', 'relog_due_at'].includes(sortBy)) {
        return res.status(400).json({ error: 'sort_by must be submission_at, soin, or relog_due_at' });
      }
      const sortDirection = req.query.sort_direction || 'desc';
      if (!['asc', 'desc'].includes(sortDirection)) return res.status(400).json({ error: 'sort_direction must be asc or desc' });
      const result = await db.serviceCalls.list(filters, {
        page,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sortBy,
        sortDirection
      });
      res.json({
        calls: result.rows.map(call => decorateCall(call)),
        total: Number(result.total),
        page,
        page_size: pageSize,
        pages: Math.ceil(Number(result.total) / pageSize)
      });
    } catch (error) {
      safeError(res, error, 'Failed to list service calls');
    }
  });

  app.post(`${base}`, checkAdminAuth, async (req, res) => {
    try {
      const record = parseCall(req.body, null, req.adminUser || 'admin');
      const call = await db.serviceCalls.create(record);
      res.status(201).json(decorateCall(call));
    } catch (error) {
      safeError(res, error, 'Failed to create service call');
    }
  });

  app.get(`${base}/:id/history`, checkAdminAuth, async (req, res) => {
    try {
      const call = await db.serviceCalls.get(req.params.id);
      if (!call) return res.status(404).json({ error: 'Service call not found' });
      res.json(await db.serviceCalls.history(req.params.id));
    } catch (error) {
      safeError(res, error, 'Failed to load SOIN history');
    }
  });

  app.get(`${base}/:id`, checkAdminAuth, async (req, res) => {
    try {
      const call = await db.serviceCalls.get(req.params.id);
      if (!call) return res.status(404).json({ error: 'Service call not found' });
      res.json(decorateCall(call));
    } catch (error) {
      safeError(res, error, 'Failed to load service call');
    }
  });

  app.patch(`${base}/:id/soin`, checkAdminAuth, async (req, res) => {
    try {
      const soin = typeof req.body.soin === 'string' ? req.body.soin.trim() : '';
      if (!soin || soin.length > 100 || /[\u0000-\u001f\u007f]/.test(soin)) {
        return res.status(400).json({ error: 'A valid SOIN of 100 characters or fewer is required' });
      }
      const reason = req.body.reason === undefined || req.body.reason === '' ? null : String(req.body.reason).trim();
      if (reason && reason.length > 500) return res.status(400).json({ error: 'reason must be 500 characters or fewer' });
      const current = await db.serviceCalls.get(req.params.id);
      if (!current) return res.status(404).json({ error: 'Service call not found' });
      if (current.soin === soin) return res.json({ call: decorateCall(current), history: null });
      const result = await db.serviceCalls.updateSoin(req.params.id, soin, req.adminUser || 'admin', reason);
      if (!result) return res.status(404).json({ error: 'Service call not found' });
      res.json({ call: decorateCall(result.call), history: result.history });
    } catch (error) {
      safeError(res, error, 'Failed to update SOIN');
    }
  });

  app.put(`${base}/:id`, checkAdminAuth, async (req, res) => {
    try {
      const existing = await db.serviceCalls.get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Service call not found' });
      if (req.body.soin !== undefined && String(req.body.soin).trim() !== existing.soin) {
        return res.status(400).json({ error: 'Use the dedicated SOIN update action to change a SOIN.' });
      }
      const record = parseCall({ ...req.body, soin: existing.soin }, existing, req.adminUser || 'admin');
      const updated = await db.serviceCalls.update(req.params.id, record);
      if (!updated) return res.status(404).json({ error: 'Service call not found' });
      res.json(decorateCall(updated));
    } catch (error) {
      safeError(res, error, 'Failed to update service call');
    }
  });
};

module.exports = registerServiceCallRoutes;
