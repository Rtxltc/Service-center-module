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
