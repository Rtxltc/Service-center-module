const test = require('node:test');
const assert = require('node:assert/strict');
const registerServiceCallRoutes = require('../service-calls');

test('service-call SOIN filter is trimmed and passed to the list query', async () => {
  const routes = new Map();
  const app = {
    get: (path, ...handlers) => routes.set(`GET ${path}`, handlers[handlers.length - 1]),
    post() {},
    patch() {},
    put() {}
  };
  let receivedFilters;
  registerServiceCallRoutes(app, {
    serviceCalls: {
      list: async (filters) => {
        receivedFilters = filters;
        return { rows: [], total: 0 };
      }
    }
  }, () => {});

  const response = {
    json(body) {
      this.body = body;
      return this;
    }
  };
  await routes.get('GET /api/service-calls')({
    query: { soin: '  SO-123  ', page: '1', page_size: '25' }
  }, response);

  assert.equal(receivedFilters.soin, 'SO-123');
  assert.deepEqual(response.body, { calls: [], total: 0, page: 1, page_size: 25, pages: 0 });
});

test('service-call creation reports a cross-tracker duplicate SOIN as a conflict', async () => {
  const routes = new Map();
  const app = {
    get() {},
    post: (path, ...handlers) => routes.set(`POST ${path}`, handlers[handlers.length - 1]),
    patch() {},
    put() {}
  };
  registerServiceCallRoutes(app, {
    serviceCalls: {
      create: async () => {
        const error = new Error('SOIN is already in use.');
        error.code = '23505';
        throw error;
      }
    }
  }, () => {});

  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  await routes.get('POST /api/service-calls')({
    body: {
      soin: 'SO-123',
      device_type: 'Mobile',
      imei: '123456789012345',
      customer_name: 'Customer',
      customer_contact: '9876543210',
      model: 'Moto Edge',
      issue_description: 'Screen issue',
      warranty_status: 'In Warranty',
      call_type: 'Hardware',
      part_order_status: 'Not Yet Ordered',
      submission_at: '2026-10-27T09:00:00.000Z'
    }
  }, response);

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.error, 'That SOIN is already in use by another record.');
});

test('service-call SOIN filter rejects values over 100 characters', () => {
  assert.throws(
    () => registerServiceCallRoutes.parseFilters({ soin: 'S'.repeat(101) }),
    { status: 400, message: 'soin must be 100 characters or fewer' }
  );
});

test('service-call SOIN filter is passed to the export query', async () => {
  const routes = new Map();
  const app = {
    get: (path, ...handlers) => routes.set(`GET ${path}`, handlers[handlers.length - 1]),
    post() {},
    patch() {},
    put() {}
  };
  let receivedFilters;
  registerServiceCallRoutes(app, {
    serviceCalls: {
      all: async (filters) => {
        receivedFilters = filters;
        return [];
      }
    }
  }, () => {});

  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  await routes.get('GET /api/service-calls/export')({ query: { soin: 'SO-123' } }, response);

  assert.equal(receivedFilters.soin, 'SO-123');
  assert.equal(response.statusCode, 404);
});

test('service-call AWB update trims the tracking number and persists it', async () => {
  const routes = new Map();
  const app = {
    get() {},
    post() {},
    patch: (path, ...handlers) => routes.set(`PATCH ${path}`, handlers[handlers.length - 1]),
    put() {}
  };
  const existing = {
    id: 12,
    soin: 'SO-123',
    device_type: 'Mobile',
    imei: '123456789012345',
    customer_name: 'Customer',
    customer_contact: '9876543210',
    model: 'Moto Edge',
    issue_description: 'Screen issue',
    warranty_status: 'In Warranty',
    call_type: 'Hardware',
    part_order_status: 'Ordered',
    part_awb: null,
    mail_sent: false,
    submission_at: '2026-10-27T09:00:00.000Z',
    relog_due_at: '2026-10-29T08:00:00.000Z'
  };
  let updatedRecord;
  registerServiceCallRoutes(app, {
    serviceCalls: {
      get: async () => existing,
      update: async (id, record) => {
        updatedRecord = record;
        return { ...existing, ...record };
      }
    }
  }, () => {});

  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  await routes.get('PATCH /api/service-calls/:id/awb')({
    params: { id: '12' },
    body: { part_awb: '  AWB-12345  ' }
  }, response);

  assert.equal(response.body.part_awb, 'AWB-12345');
  assert.equal(updatedRecord.part_awb, 'AWB-12345');
});

test('service-call AWB update rejects values over 100 characters', async () => {
  const routes = new Map();
  const app = {
    get() {},
    post() {},
    patch: (path, ...handlers) => routes.set(`PATCH ${path}`, handlers[handlers.length - 1]),
    put() {}
  };
  const existing = {
    id: 12,
    soin: 'SO-123',
    device_type: 'Mobile',
    imei: '123456789012345',
    customer_name: 'Customer',
    customer_contact: '9876543210',
    model: 'Moto Edge',
    issue_description: 'Screen issue',
    warranty_status: 'In Warranty',
    call_type: 'Hardware',
    part_order_status: 'Ordered',
    mail_sent: false,
    submission_at: '2026-10-27T09:00:00.000Z',
    relog_due_at: '2026-10-29T08:00:00.000Z'
  };
  registerServiceCallRoutes(app, {
    serviceCalls: {
      get: async () => existing,
      update: async () => assert.fail('Invalid AWB must not be persisted')
    }
  }, () => {});

  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  await routes.get('PATCH /api/service-calls/:id/awb')({
    params: { id: '12' },
    body: { part_awb: 'A'.repeat(101) }
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, 'part_awb must be 100 characters or fewer');
});
