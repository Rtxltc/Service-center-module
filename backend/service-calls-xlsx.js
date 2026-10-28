const { deflateRawSync } = require('zlib');

const COLUMNS = [
  ['SOIN', 'soin'],
  ['IMEI', 'imei'],
  ['Second IMEI', 'second_imei'],
  ['Market Name', 'market_name'],
  ['MTM Number', 'mtm_number'],
  ['Activation Date', 'activation_date'],
  ['Warranty Expiry Date', 'warranty_expiry_date'],
  ['Customer Name', 'customer_name'],
  ['Customer Contact', 'customer_contact'],
  ['Device Model', 'model'],
  ['Issue Description', 'issue_description'],
  ['Warranty Status', 'warranty_status'],
  ['Call Type', 'call_type'],
  ['Part Order Status', 'part_order_status'],
  ['Parts Approval Email Sent', 'mail_sent'],
  ['Submission Date', 'submission_date', 'date'],
  ['Submission Time', 'submission_time', 'time'],
  ['TAT Deadline', 'relog_due_at', 'timestamp'],
  ['TAT Status', 'tat_status'],
  ['Quotation Amount (₹)', 'quotation_amount', 'currency'],
  ['Submitted Amount (₹)', 'submitted_amount', 'currency'],
  ['Payment Method', 'payment_method'],
  ['Created At', 'created_at', 'timestamp'],
  ['Last Updated At', 'updated_at', 'timestamp']
];

const xmlEscape = (value) => String(value)
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const excelSerial = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = Number(part.value);
    return result;
  }, {});
  return (Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    - Date.UTC(1899, 11, 30)) / 86400000;
};

const columnName = (index) => {
  let name = '';
  let number = index + 1;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
};

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const zipFiles = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const [fileName, content] of Object.entries(files)) {
    const name = Buffer.from(fileName, 'utf8');
    const source = Buffer.from(content, 'utf8');
    const compressed = deflateRawSync(source);
    const checksum = crc32(source);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(source.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(source.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
};

const buildServiceCallsWorkbook = (calls) => {
  const rows = calls.map(call => {
    const dateSerial = excelSerial(call.submission_at);
    return COLUMNS.map(([, key, type]) => {
      if (key === 'submission_date') return dateSerial === null ? null : Math.floor(dateSerial);
      if (key === 'submission_time') return dateSerial === null ? null : dateSerial - Math.floor(dateSerial);
      if (type === 'timestamp') return excelSerial(call[key]);
      if (key === 'mail_sent') return call.mail_sent ? 'Yes' : 'No';
      if (type === 'currency' && call.warranty_status === 'In Warranty' && call[key] == null) return null;
      if (type === 'currency' && call[key] != null) return Number(call[key]);
      return call[key] == null ? null : String(call[key]);
    });
  });

  const allRows = [COLUMNS.map(([header]) => header), ...rows];
  const cellXml = (value, rowIndex, columnIndex) => {
    const ref = `${columnName(columnIndex)}${rowIndex + 1}`;
    if (value === null || value === undefined || value === '') return `<c r="${ref}"/>`;
    if (rowIndex === 0) return `<c r="${ref}" s="1" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
    const type = COLUMNS[columnIndex][2];
    if (type === 'currency') return `<c r="${ref}" s="2"><v>${value}</v></c>`;
    if (type === 'timestamp' || type === 'date') return `<c r="${ref}" s="3"><v>${value}</v></c>`;
    if (type === 'time') return `<c r="${ref}" s="4"><v>${value}</v></c>`;
    if (typeof value === 'number') return `<c r="${ref}"><v>${value}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
  };

  const sheetRows = allRows.map((row, rowIndex) => (
    `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => cellXml(value, rowIndex, columnIndex)).join('')}</row>`
  )).join('');
  const widths = [22, 18, 18, 20, 18, 18, 20, 24, 20, 24, 42, 20, 14, 22, 12, 16, 16, 22, 16, 22, 22, 18, 22, 22];
  const cols = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('');
  const lastCell = `${columnName(COLUMNS.length - 1)}${allRows.length}`;

  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Service Calls" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="3"><numFmt numFmtId="164" formatCode="&quot;₹&quot;#,##0.00"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy hh:mm"/><numFmt numFmtId="166" formatCode="hh:mm AM/PM"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0284C7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${lastCell}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${lastCell}"/></worksheet>`
  });
};

module.exports = { buildServiceCallsWorkbook };
