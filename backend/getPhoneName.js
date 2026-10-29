'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const CSV_URL = 'https://storage.googleapis.com/play_public/supported_devices.csv';
const CACHE_FILE = path.join(os.tmpdir(), 'supported_devices.csv');
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const OVERRIDES = {
  XT2429: 'Motorola Edge 50 Fusion'
};

const BRAND_ALIASES = { lge: 'LG' };
const normalize = (value) => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

async function loadCsv() {
  try {
    const { mtimeMs } = await fs.stat(CACHE_FILE);
    if (Date.now() - mtimeMs < CACHE_MAX_AGE_MS) return await fs.readFile(CACHE_FILE);
  } catch {
    // Download the list when there is no usable cache.
  }

  try {
    const response = await fetch(CSV_URL, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    const temporaryFile = `${CACHE_FILE}.${process.pid}.tmp`;
    await fs.writeFile(temporaryFile, data);
    await fs.rename(temporaryFile, CACHE_FILE);
    return data;
  } catch (error) {
    try {
      return await fs.readFile(CACHE_FILE);
    } catch {
      throw new Error(`Could not download the device list: ${error.message}`);
    }
  }
}

function decode(buffer) {
  const text = buffer[0] === 0xff && buffer[1] === 0xfe
    ? buffer.toString('utf16le')
    : buffer.toString('utf8');
  return text.replace(/^\uFEFF/, '');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const endField = () => {
    row.push(field.trim());
    field = '';
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character !== '"') field += character;
      else if (text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === ',') endField();
    else if (character === '\n') endRow();
    else if (character !== '\r') field += character;
  }
  if (field || row.length) endRow();
  return rows;
}

function displayName(brand, name) {
  const normalizedBrand = BRAND_ALIASES[brand.toLowerCase()] ?? brand;
  if (!normalizedBrand || name.toLowerCase().startsWith(normalizedBrand.toLowerCase())) return name;
  const label = normalizedBrand === normalizedBrand.toLowerCase()
    ? normalizedBrand[0].toUpperCase() + normalizedBrand.slice(1)
    : normalizedBrand;
  return `${label} ${name}`;
}

let indexPromise;
function getIndex() {
  indexPromise ??= buildIndex().catch((error) => {
    indexPromise = undefined;
    throw error;
  });
  return indexPromise;
}

async function buildIndex() {
  const index = new Map();
  const add = (model, name) => {
    const key = normalize(model);
    if (!key) return;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push({ model, name });
  };

  for (const [code, name] of Object.entries(OVERRIDES)) add(code, name);

  for (const [brand = '', name = '', , model = ''] of parseCsv(decode(await loadCsv()))) {
    if (brand === 'Retail Branding' || !name || !model) continue;
    add(model, displayName(brand, name));
  }
  return index;
}

function matchOverride(normalizedCode) {
  let best;
  for (const [code, name] of Object.entries(OVERRIDES)) {
    const key = normalize(code);
    if (key && normalizedCode.startsWith(key) && key.length > (best?.key.length ?? 0)) {
      best = { key, name };
    }
  }
  return best?.name;
}

async function resolve(code, partial) {
  const normalizedCode = normalize(code);
  if (normalizedCode.length < 3) return { exact: false, matches: [] };

  const override = matchOverride(normalizedCode);
  if (override) {
    return { exact: true, matches: [{ model: String(code).trim(), name: override }] };
  }

  const index = await getIndex();
  if (index.has(normalizedCode)) return { exact: true, matches: index.get(normalizedCode) };

  const matches = [];
  if (partial) {
    for (const [key, entries] of index) {
      if (key.startsWith(normalizedCode)) matches.push(...entries);
    }
  }
  return { exact: false, matches };
}

function distinct(matches) {
  const seen = new Set();
  return matches.filter(({ name }) => {
    const key = normalize(name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getPhoneName(code, { partial = true } = {}) {
  const { exact, matches } = await resolve(code, partial);
  const found = distinct(matches);
  if (!found.length) return null;
  return exact || found.length === 1 ? found[0].name : null;
}

async function findPhones(code) {
  return distinct((await resolve(code, true)).matches);
}

module.exports = { getPhoneName, findPhones };
