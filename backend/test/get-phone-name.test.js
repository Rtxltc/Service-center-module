const test = require('node:test');
const assert = require('node:assert/strict');
const { getPhoneName, findPhones } = require('../getPhoneName');
const registerServiceCallRoutes = require('../service-calls');

test('model-code lookup resolves known overrides and rejects codes that are too short', async () => {
  assert.equal(await getPhoneName('xt2429-2'), 'Motorola Edge 50 Fusion');
  assert.deepEqual(await findPhones('XT2429-2'), [
    { model: 'XT2429-2', name: 'Motorola Edge 50 Fusion' }
  ]);
  assert.equal(await getPhoneName('ab'), null);
});

test('service-call model lookup is admin-protected and validates input', async () => {
  const routes = new Map();
  const checkAdminAuth = () => {};
  const app = {
    get: (path, ...handlers) => routes.set(path, handlers),
    post: () => {},
    patch: () => {},
    put: () => {}
  };
  registerServiceCallRoutes(app, {}, checkAdminAuth);
  const handlers = routes.get('/api/service-calls/model-name');
  assert.equal(handlers[0], checkAdminAuth);

  const invoke = async (code) => {
    const response = {
      statusCode: 200,
      body: null,
      status(statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };
    await handlers[1]({ query: { code } }, response);
    return response;
  };

  const resolved = await invoke('XT2429-2');
  assert.equal(resolved.statusCode, 200);
  assert.deepEqual(resolved.body, { name: 'Motorola Edge 50 Fusion' });

  const invalid = await invoke('x'.repeat(101));
  assert.equal(invalid.statusCode, 400);
});
