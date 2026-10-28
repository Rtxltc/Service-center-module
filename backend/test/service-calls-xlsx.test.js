const test = require('node:test');
const assert = require('node:assert/strict');
const { inflateRawSync } = require('node:zlib');
const { buildServiceCallsWorkbook } = require('../service-calls-xlsx');

const readZipEntry = (archive, targetName) => {
  let offset = 0;
  while (offset + 30 <= archive.length && archive.readUInt32LE(offset) === 0x04034b50) {
    const method = archive.readUInt16LE(offset + 8);
    const compressedSize = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = archive.toString('utf8', nameStart, nameStart + nameLength);
    const contentStart = nameStart + nameLength + extraLength;
    const compressed = archive.subarray(contentStart, contentStart + compressedSize);
    if (name === targetName) {
      return method === 8 ? inflateRawSync(compressed).toString('utf8') : compressed.toString('utf8');
    }
    offset = contentStart + compressedSize;
  }
  return null;
};

test('service-call export is a formatted XLSX workbook with safe text cells', () => {
  const workbook = buildServiceCallsWorkbook([{
    soin: '=HYPERLINK("https://example.invalid","open")',
    device_type: 'Mobile',
    imei: '123456789012345',
    second_imei: '543210987654321',
    market_name: 'Ayodhya',
    mtm_number: 'MTM-456',
    activation_date: '2026-10-25',
    warranty_expiry_date: '2027-10-24',
    customer_name: 'A & B',
    customer_contact: '+919876543210',
    model: 'Moto Edge',
    issue_description: 'Screen <broken>',
    warranty_status: 'Out of Warranty',
    call_type: 'Hardware',
    part_order_status: 'Ordered',
    mail_sent: false,
    submission_at: '2026-10-27T09:00:00.000Z',
    relog_due_at: '2026-10-29T08:00:00.000Z',
    tat_status: 'IN TAT',
    quotation_amount: '1250.00',
    submitted_amount: '500.00',
    payment_method: 'QR',
    created_at: '2026-10-27T09:00:00.000Z',
    updated_at: '2026-10-27T09:00:00.000Z'
  }]);

  assert.equal(workbook.subarray(0, 2).toString('ascii'), 'PK');
  const sheet = readZipEntry(workbook, 'xl/worksheets/sheet1.xml');
  const styles = readZipEntry(workbook, 'xl/styles.xml');
  assert.ok(sheet.includes('<autoFilter ref="A1:X2"/>'));
  assert.ok(sheet.includes('543210987654321'));
  assert.ok(sheet.includes('MTM-456'));
  assert.ok(sheet.includes('state="frozen"'));
  assert.ok(sheet.includes('t="inlineStr"'));
  assert.ok(sheet.includes('A &amp; B'));
  assert.ok(sheet.includes('Screen &lt;broken&gt;'));
  assert.ok(!sheet.includes('<f>'));
  assert.ok(styles.includes('formatCode="&quot;₹&quot;#,##0.00"'));
  assert.ok(styles.includes('formatCode="dd/mm/yyyy hh:mm"'));
});
