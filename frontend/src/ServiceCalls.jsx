import React, { useEffect, useRef, useState } from 'react';

const INITIAL_FILTERS = {
  search: '',
  soin: '',
  date_from: '',
  date_to: '',
  warranty_status: '',
  tat_status: '',
  call_type: '',
  part_order_status: '',
  mail_sent: '',
  approaching_tat: ''
};

const EMPTY_FORM = {
  soin: '',
  device_type: 'Mobile',
  imei: '',
  customer_name: '',
  customer_contact: '',
  model: '',
  issue_description: '',
  warranty_status: 'In Warranty',
  call_type: 'Hardware',
  part_order_status: 'Not Yet Ordered',
  mail_sent: false,
  submission_at: '',
  activation_date: '',
  warranty_expiry_date: '',
  mtm_number: '',
  market_name: '',
  second_imei: '',
  quotation_amount: '',
  submitted_amount: '',
  payment_method: ''
};

const compressImage = async (file) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error(`${file.name} is not a JPEG, PNG, or WebP image.`);
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error(`${file.name} is larger than the 20 MB source-image limit.`);
  }
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  try {
    for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error(`Could not prepare ${file.name} for compression.`);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.84, 0.76, 0.68, 0.6, 0.52]) {
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(result => result ? resolve(result) : reject(new Error(`Could not compress ${file.name}.`)), 'image/jpeg', quality);
        });
        if (blob.size <= 450 * 1024) {
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let binary = '';
          for (let offset = 0; offset < bytes.length; offset += 0x8000) {
            binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + 0x8000, bytes.length)));
          }
          const name = file.name.replace(/\.[^.]+$/, '') || 'service-call-image';
          return {
            name: `${name}.jpg`,
            mime_type: 'image/jpeg',
            data: window.btoa(binary),
            size: blob.size
          };
        }
      }
      scale *= 0.75;
    }
  } finally {
    bitmap.close();
  }
  throw new Error(`${file.name} could not be compressed below 450 KB.`);
};

const parseEmailList = (value) => value.split(/[,;\n]/).map(email => email.trim()).filter(Boolean);

const inputDateTime = (value) => {
  const date = value ? new Date(value) : new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

const indiaInputToISOString = (value) => new Date(`${value}:00+05:30`).toISOString();

const formatIndiaDateTime = (value) => value
  ? new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date(value))
  : '—';

const formatApprovalDate = (value) => {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : '—';
};

const formatDuration = (milliseconds) => {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return `${days ? `${days}d ` : ''}${hours}h ${minutes}m`;
};

function ServiceCalls({ apiBase, password }) {
  const [view, setView] = useState('dashboard');
  const [calls, setCalls] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('submission_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [form, setForm] = useState(EMPTY_FORM);
  const [modelCode, setModelCode] = useState('');
  const [modelLookupBusy, setModelLookupBusy] = useState(false);
  const [modelLookupMessage, setModelLookupMessage] = useState('');
  const modelLookupSequence = useRef(0);
  const modelLookupTimer = useRef(null);
  const findModelNameRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [soinForm, setSoinForm] = useState({ soin: '', reason: '' });
  const [soinModalOpen, setSoinModalOpen] = useState(false);
  const [tatNow, setTatNow] = useState(() => performance.now());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalComposer, setApprovalComposer] = useState(null);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [gmailStatusError, setGmailStatusError] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'x-admin-password': password,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Service call request failed.');
    }
    return response;
  };

  const showError = (reason) => {
    setError(reason.message || 'Service call request failed.');
    setNotice('');
  };

  const loadGmailStatus = async () => {
    try {
      const response = await request('/admin/gmail/status');
      setGmailStatus(await response.json());
      setGmailStatusError('');
    } catch (reason) {
      setGmailStatusError(reason.message || 'Could not load Gmail connection status.');
    }
  };

  useEffect(() => {
    const refreshStatus = () => loadGmailStatus();
    refreshStatus();
    window.addEventListener('focus', refreshStatus);
    return () => window.removeEventListener('focus', refreshStatus);
  }, [apiBase, password]);

  const connectGmail = async () => {
    setApprovalBusy(true);
    setError('');
    try {
      const response = await request('/admin/gmail/connect', { method: 'POST' });
      const result = await response.json();
      window.location.assign(result.authorization_url);
    } catch (reason) {
      showError(reason);
      setApprovalBusy(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request('/service-calls/dashboard');
      const result = await response.json();
      const observedAt = performance.now();
      setDashboard({
        ...result,
        alerts: result.alerts.map(call => ({ ...call, _tatObservedAt: observedAt }))
      });
    } catch (reason) {
      showError(reason);
    } finally {
      setLoading(false);
    }
  };

  const loadCalls = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        sort_by: sortBy,
        sort_direction: sortDirection
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await request(`/service-calls?${params.toString()}`);
      const result = await response.json();
      const observedAt = performance.now();
      setCalls(result.calls.map(call => ({ ...call, _tatObservedAt: observedAt })));
      setTotal(result.total);
    } catch (reason) {
      showError(reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'dashboard') loadDashboard();
    if (view === 'list') loadCalls();
  }, [view, page, filters, sortBy, sortDirection]);

  useEffect(() => {
    const timer = window.setInterval(() => setTatNow(performance.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, submission_at: inputDateTime() });
    setModelCode('');
    setModelLookupMessage('');
    setView('form');
  };

  const openEditForm = (call) => {
    setEditingId(call.id);
    setModelCode('');
    setModelLookupMessage('');
    setForm({
      ...EMPTY_FORM,
      ...call,
      imei: call.imei || '',
      quotation_amount: call.quotation_amount ?? '',
      submitted_amount: call.submitted_amount ?? '',
      payment_method: call.payment_method || '',
      submission_at: inputDateTime(call.submission_at)
    });
    setView('form');
  };

  const findModelName = async (value = modelCode) => {
    if (modelLookupTimer.current) {
      window.clearTimeout(modelLookupTimer.current);
      modelLookupTimer.current = null;
    }
    const sequence = ++modelLookupSequence.current;
    const code = value.trim();
    if (!code) {
      setModelLookupMessage('Enter a model code first.');
      return;
    }
    setModelLookupBusy(true);
    setModelLookupMessage('Searching for model name…');
    try {
      const response = await request(`/service-calls/model-name?code=${encodeURIComponent(code)}`);
      const result = await response.json();
      if (sequence !== modelLookupSequence.current) return;
      if (!result.name) {
        setModelLookupMessage('No unique model match found. Enter the model name manually.');
        return;
      }
      setForm(current => ({ ...current, model: result.name }));
      setModelLookupMessage(`Detected: ${result.name}`);
    } catch (reason) {
      if (sequence === modelLookupSequence.current) {
        setModelLookupMessage(reason.message || 'Model lookup is temporarily unavailable.');
      }
    } finally {
      if (sequence === modelLookupSequence.current) setModelLookupBusy(false);
    }
  };
  findModelNameRef.current = findModelName;

  useEffect(() => {
    const code = modelCode.trim();
    if (view !== 'form' || form.device_type !== 'Mobile' || code.length < 3) return undefined;

    modelLookupTimer.current = window.setTimeout(() => {
      modelLookupTimer.current = null;
      findModelNameRef.current(code);
    }, 500);
    return () => {
      if (modelLookupTimer.current) {
        window.clearTimeout(modelLookupTimer.current);
        modelLookupTimer.current = null;
      }
      modelLookupSequence.current += 1;
    };
  }, [form.device_type, modelCode, view]);

  const openDetails = async (call) => {
    setLoading(true);
    setError('');
    try {
      const [callResponse, historyResponse] = await Promise.all([
        request(`/service-calls/${call.id}`),
        request(`/service-calls/${call.id}/history`)
      ]);
      const callDetails = await callResponse.json();
      setSelectedCall({ ...callDetails, _tatObservedAt: performance.now() });
      setHistory(await historyResponse.json());
      setView('details');
    } catch (reason) {
      showError(reason);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalComposer = async (call, returnView) => {
    setApprovalBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await request(`/service-calls/${call.id}/approval-email`);
      const result = await response.json();
      if (!result.connected) {
        setError('Connect the Gmail sender account before preparing an approval email.');
        return;
      }
      setApprovalComposer({
        ...result,
        returnView,
        toText: result.to.join('\n'),
        ccText: result.cc.join('\n'),
        images: []
      });
      setView('approval');
    } catch (reason) {
      showError(reason);
    } finally {
      setApprovalBusy(false);
    }
  };

  const resolveApprovalSend = async (call, returnView) => {
    if (!window.confirm('Check the sender Gmail Sent folder first. Continue only if this email was not sent; this will allow another send attempt.')) return;
    setApprovalBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await request(`/service-calls/${call.id}/approval-email/retry`, {
        method: 'POST',
        body: JSON.stringify({ confirmed_not_sent: true })
      });
      const result = await response.json();
      setNotice(result.message);
      if (returnView === 'details') await openDetails(call);
      else await loadCalls();
    } catch (reason) {
      showError(reason);
    } finally {
      setApprovalBusy(false);
    }
  };

  const addApprovalImages = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selectedFiles.length) return;
    if (approvalComposer.images.length + selectedFiles.length > 6) {
      setError('Attach no more than six images.');
      return;
    }
    setApprovalBusy(true);
    setError('');
    try {
      const images = await Promise.all(selectedFiles.map(compressImage));
      const combinedSize = [...approvalComposer.images, ...images].reduce((sum, image) => sum + image.size, 0);
      if (combinedSize > 2500 * 1024) throw new Error('Combined image size must be no more than 2,500 KB.');
      setApprovalComposer(current => ({ ...current, images: [...current.images, ...images] }));
    } catch (reason) {
      showError(reason);
    } finally {
      setApprovalBusy(false);
    }
  };

  const sendApprovalEmail = async (event) => {
    event.preventDefault();
    if (!approvalComposer) return;
    const to = parseEmailList(approvalComposer.toText);
    const cc = parseEmailList(approvalComposer.ccText);
    if (!window.confirm(`Send this parts-approval email to ${to.join(', ')}? This will mark the approval email as sent.`)) return;
    setApprovalBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await request(`/service-calls/${approvalComposer.call.id}/approval-email/send`, {
        method: 'POST',
        body: JSON.stringify({
          to,
          cc,
          request_text: approvalComposer.request_text,
          remark: approvalComposer.remark,
          video_link: approvalComposer.video_link,
          images: approvalComposer.images.map(({ name, mime_type, data }) => ({ name, mime_type, data }))
        })
      });
      const result = await response.json();
      setApprovalComposer(null);
      setNotice(result.message || 'Parts-approval email sent.');
      await openDetails(result.call);
    } catch (reason) {
      if (/Gmail did not confirm|Gmail accepted the message/.test(reason.message)) {
        const returnView = approvalComposer.returnView;
        setApprovalComposer(null);
        setView(returnView);
        if (returnView === 'details') await openDetails(approvalComposer.call);
      }
      showError(reason);
    } finally {
      setApprovalBusy(false);
    }
  };

  const saveCall = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...form,
        submission_at: indiaInputToISOString(form.submission_at),
        imei: form.imei.trim() || null,
        quotation_amount: form.quotation_amount === '' ? null : form.quotation_amount,
        submitted_amount: form.submitted_amount === '' ? null : form.submitted_amount,
        payment_method: form.payment_method || null
      };
      await request(editingId ? `/service-calls/${editingId}` : '/service-calls', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setNotice(editingId ? 'Service call updated.' : 'Service call created.');
      setView('list');
      setPage(1);
      await loadCalls();
    } catch (reason) {
      showError(reason);
    } finally {
      setLoading(false);
    }
  };

  const saveSoin = async (event) => {
    event.preventDefault();
    if (!selectedCall || !window.confirm(`Change SOIN from "${selectedCall.soin}" to "${soinForm.soin}"? This will be recorded in the audit history.`)) return;
    setLoading(true);
    setError('');
    try {
      const response = await request(`/service-calls/${selectedCall.id}/soin`, {
        method: 'PATCH',
        body: JSON.stringify(soinForm)
      });
      const result = await response.json();
      setSelectedCall({ ...result.call, _tatObservedAt: performance.now() });
      const historyResponse = await request(`/service-calls/${selectedCall.id}/history`);
      setHistory(await historyResponse.json());
      setSoinModalOpen(false);
      setNotice('SOIN updated, recorded in history, and the 47-hour reminder timer restarted.');
      if (view === 'list') await loadCalls();
    } catch (reason) {
      showError(reason);
    } finally {
      setLoading(false);
    }
  };

  const exportCalls = async () => {
    setExporting(true);
    setError('');
    setNotice('');
    try {
      const params = new URLSearchParams();
      ['date_from', 'date_to', 'soin', 'warranty_status', 'tat_status', 'call_type', 'part_order_status', 'mail_sent', 'approaching_tat', 'search']
        .forEach(key => { if (filters[key]) params.set(key, filters[key]); });
      const response = await request(`/service-calls/export?${params.toString()}`);
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition') || '';
      const filename = contentDisposition.match(/filename="([^"]+)"/)?.[1] || 'CharomResQ_ServiceCalls.xlsx';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`Excel export downloaded (${total} matching records).`);
    } catch (reason) {
      showError(reason);
    } finally {
      setExporting(false);
    }
  };

  const changeSort = (field) => {
    setSortDirection(current => sortBy === field && current === 'desc' ? 'asc' : 'desc');
    setSortBy(field);
    setPage(1);
  };

  const applyQuickFilter = (key, value) => {
    if (key === 'all') {
      setFilters(INITIAL_FILTERS);
    } else if (key === 'submitted_today') {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date()).reduce((result, part) => {
        if (part.type !== 'literal') result[part.type] = part.value;
        return result;
      }, {});
      const today = `${parts.year}-${parts.month}-${parts.day}`;
      setFilters({ ...INITIAL_FILTERS, date_from: today, date_to: today });
    } else {
      setFilters(current => ({ ...INITIAL_FILTERS, [key]: value }));
    }
    setPage(1);
    setView('list');
  };

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };

  const renderTat = (call) => {
    const elapsed = call._tatObservedAt === undefined ? 0 : Math.max(0, tatNow - call._tatObservedAt);
    const remaining = call.tat_status === 'IN TAT'
      ? call.remaining_ms - elapsed
      : -(call.overdue_ms + elapsed);
    const missed = remaining <= 0;
    return (
      <span className={`service-call-badge ${missed ? 'missed' : 'in-tat'}`}>
        {missed ? `TAT Missed · ${formatDuration(Math.abs(remaining))} overdue` : `IN TAT · ${formatDuration(remaining)} left`}
      </span>
    );
  };

  const renderDateFilters = () => (
    <>
      <label className="service-call-filter">From date<input className="form-input" type="date" value={filters.date_from} onChange={(event) => updateFilter('date_from', event.target.value)} /></label>
      <label className="service-call-filter">To date<input className="form-input" type="date" value={filters.date_to} onChange={(event) => updateFilter('date_to', event.target.value)} /></label>
    </>
  );

  const renderFilters = () => (
    <div className="service-call-filters">
      <label className="service-call-filter">SOIN<input className="form-input" value={filters.soin} maxLength="100" placeholder="Full or partial SOIN" onChange={(event) => updateFilter('soin', event.target.value)} /></label>
      <label className="service-call-filter service-call-search">Search<input className="form-input" value={filters.search} placeholder="IMEI/MTM, market, customer, contact, model" onChange={(event) => updateFilter('search', event.target.value)} /></label>
      {renderDateFilters()}
      <label className="service-call-filter">Warranty<select className="form-input" value={filters.warranty_status} onChange={(event) => updateFilter('warranty_status', event.target.value)}><option value="">All</option><option>In Warranty</option><option>Out of Warranty</option></select></label>
      <label className="service-call-filter">TAT status<select className="form-input" value={filters.tat_status} onChange={(event) => updateFilter('tat_status', event.target.value)}><option value="">All</option><option>IN TAT</option><option>TAT Missed</option></select></label>
      <label className="service-call-filter">Call type<select className="form-input" value={filters.call_type} onChange={(event) => updateFilter('call_type', event.target.value)}><option value="">All</option><option>Hardware</option><option>Software</option></select></label>
      <label className="service-call-filter">Parts<select className="form-input" value={filters.part_order_status} onChange={(event) => updateFilter('part_order_status', event.target.value)}><option value="">All</option><option>Ordered</option><option>Not Yet Ordered</option></select></label>
      <label className="service-call-filter">Approval email<select className="form-input" value={filters.mail_sent} onChange={(event) => updateFilter('mail_sent', event.target.value)}><option value="">All</option><option value="true">Sent</option><option value="false">Not sent</option></select></label>
      <button className="btn btn-secondary" onClick={() => { setFilters(INITIAL_FILTERS); setPage(1); }}>Clear filters</button>
    </div>
  );

  return (
    <section className="service-calls-panel">
      <div className="service-calls-heading">
        <div>
          <h3>Service Calls</h3>
          <p>Register calls, monitor the 47-hour turnaround, and send one automatic email reminder after the deadline.</p>
        </div>
        <div className="service-calls-heading-actions">
          <button className="btn btn-secondary" onClick={() => setView('dashboard')}>Dashboard</button>
          <button className="btn btn-secondary" onClick={() => { setPage(1); setView('list'); }}>All Calls</button>
          <button className="btn btn-secondary" onClick={connectGmail} disabled={approvalBusy}>
            {approvalBusy ? 'Connecting…' : gmailStatus?.connected ? `Gmail: ${gmailStatus.email}` : 'Connect Gmail'}
          </button>
          <button className="btn btn-primary" onClick={openNewForm}>+ Add Service Call</button>
        </div>
      </div>

      {gmailStatusError && <p className="service-call-approval-status" role="status">Gmail status unavailable: {gmailStatusError}</p>}
      {notice && <div className="service-call-notice" role="status">{notice}</div>}
      {error && <div className="service-call-error" role="alert">{error}</div>}
      {loading && <p className="service-call-loading" role="status">Loading service calls…</p>}

      {view === 'dashboard' && (
        <div>
          {dashboard && (
            <>
              <div className="service-call-stats">
                {[
                  ['Total service calls', 'total', 'all', ''],
                  ['Submitted today', 'submitted_today', 'submitted_today', ''],
                  ['IN TAT', 'in_tat', 'tat_status', 'IN TAT'],
                  ['TAT Missed', 'tat_missed', 'tat_status', 'TAT Missed'],
                  ['Approaching deadline', 'approaching_tat', 'approaching_tat', 'true'],
                  ['Hardware', 'hardware', 'call_type', 'Hardware'],
                  ['Software', 'software', 'call_type', 'Software'],
                  ['In Warranty', 'in_warranty', 'warranty_status', 'In Warranty'],
                  ['Out of Warranty', 'out_of_warranty', 'warranty_status', 'Out of Warranty'],
                  ['Parts ordered', 'parts_ordered', 'part_order_status', 'Ordered'],
                  ['Parts not ordered', 'parts_not_ordered', 'part_order_status', 'Not Yet Ordered'],
                  ['Approval email sent', 'mail_sent', 'mail_sent', 'true'],
                  ['Approval email not sent', 'mail_not_sent', 'mail_sent', 'false']
                ].map(([label, key, filterKey, value]) => (
                  <button className="service-call-stat" key={key} onClick={() => filterKey && applyQuickFilter(filterKey, value)}>
                    <span>{label}</span><strong>{dashboard.stats[key] ?? 0}</strong>
                  </button>
                ))}
              </div>
              <div className="service-call-dashboard-financial">
                <span>Quoted (not ledger income): <strong>₹{Number(dashboard.stats.quoted_total).toFixed(2)}</strong></span>
                <span>Submitted (not ledger income): <strong>₹{Number(dashboard.stats.submitted_total).toFixed(2)}</strong></span>
              </div>
              <div className="service-call-alerts">
                <h4>TAT Alerts <small>Approaching deadline within 6 hours or overdue</small></h4>
                {dashboard.alerts.length === 0 ? <p>No calls need TAT attention.</p> : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>SOIN</th><th>Customer</th><th>Model</th><th>Submitted</th><th>TAT deadline</th><th>Status</th><th></th></tr></thead>
                      <tbody>{dashboard.alerts.map(call => (
                        <tr key={call.id}>
                          <td>{call.soin}</td><td>{call.customer_name}</td><td>{call.model}</td>
                          <td>{formatIndiaDateTime(call.submission_at)}</td><td>{formatIndiaDateTime(call.relog_due_at)}</td>
                          <td>{renderTat(call)}</td>
                          <td><button className="service-call-link" onClick={() => applyQuickFilter('soin', call.soin)}>Open filtered list</button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {view === 'list' && (
        <div>
          {renderFilters()}
          <div className="service-call-list-actions">
            <span>{total} matching calls</span>
            <button className="btn btn-primary" onClick={exportCalls} disabled={exporting || loading}>{exporting ? 'Generating Excel…' : 'Export to Excel (.xlsx)'}</button>
          </div>
          {!loading && calls.length === 0 ? <div className="service-call-empty">No service calls match these filters.</div> : (
            <div className="table-responsive">
              <table className="admin-table service-calls-table">
                <thead><tr>
                  <th><button onClick={() => changeSort('soin')}>SOIN</button></th><th>IMEI</th><th>Customer</th><th>Contact</th><th>Model</th><th>Issue</th><th>Warranty</th><th>Type</th><th>Parts</th><th>Approval email</th>
                  <th><button onClick={() => changeSort('submission_at')}>Submission</button></th><th><button onClick={() => changeSort('relog_due_at')}>TAT deadline</button></th>
                  <th>TAT status</th><th>Quotation</th><th>Submitted</th><th>Payment</th><th>Actions</th>
                </tr></thead>
                <tbody>{calls.map(call => (
                  <tr key={call.id}>
                    <td><strong>{call.soin}</strong></td><td>{call.imei || '—'}</td><td>{call.customer_name}</td><td>{call.customer_contact}</td><td>{call.model}</td>
                    <td className="service-call-issue">{call.issue_description}</td><td>{call.warranty_status}</td><td>{call.call_type}</td><td>{call.part_order_status}</td><td>{call.mail_sent ? 'Sent' : 'Not sent'}</td>
                    <td>{formatIndiaDateTime(call.submission_at)}</td><td>{formatIndiaDateTime(call.relog_due_at)}</td><td>{renderTat(call)}</td>
                    <td>{call.quotation_amount == null ? '—' : `₹${Number(call.quotation_amount).toFixed(2)}`}</td>
                    <td>{call.submitted_amount == null ? '—' : `₹${Number(call.submitted_amount).toFixed(2)}`}</td><td>{call.payment_method || '—'}</td>
                    <td className="service-call-row-actions">
                      <button className="service-call-link" onClick={() => openDetails(call)}>Details</button>
                      <button className="service-call-link" onClick={() => openEditForm(call)}>Edit</button>
                      <button className="service-call-link" onClick={() => { setSelectedCall(call); setSoinForm({ soin: call.soin, reason: '' }); setSoinModalOpen(true); }}>Update SOIN</button>
                      {!call.mail_sent && (call.approval_email_sending
                        ? <button className="service-call-link" onClick={() => resolveApprovalSend(call, 'list')} disabled={approvalBusy}>Resolve send</button>
                        : <button className="service-call-link" onClick={() => openApprovalComposer(call, 'list')} disabled={approvalBusy}>Send mail</button>)}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="service-call-pagination">
            <button className="btn btn-secondary" disabled={page <= 1 || loading} onClick={() => setPage(current => current - 1)}>Previous</button>
            <span>Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
            <button className="btn btn-secondary" disabled={page >= Math.ceil(total / pageSize) || loading} onClick={() => setPage(current => current + 1)}>Next</button>
          </div>
        </div>
      )}

      {view === 'form' && (
        <form className="service-call-form" onSubmit={saveCall}>
          <h4>{editingId ? 'Edit service call' : 'Add service call'}</h4>
          <div className="service-call-form-grid">
            <label>SOIN<input className="form-input" value={form.soin} onChange={event => setForm({ ...form, soin: event.target.value })} maxLength="100" required disabled={Boolean(editingId)} />{editingId && <small>Use Update SOIN from the call list or details.</small>}</label>
            <label>Device type<select className="form-input" value={form.device_type} onChange={event => { modelLookupSequence.current += 1; setModelLookupBusy(false); setForm({ ...form, device_type: event.target.value }); }}><option>Mobile</option><option>Laptop</option></select></label>
            <label>IMEI {form.device_type === 'Laptop' ? '(optional for laptops)' : '(required for mobiles)'}<input className="form-input" inputMode="numeric" pattern="[0-9]{15}" maxLength="15" value={form.imei} onChange={event => setForm({ ...form, imei: event.target.value })} required={form.device_type === 'Mobile'} /></label>
            <label>Customer name<input className="form-input" value={form.customer_name} onChange={event => setForm({ ...form, customer_name: event.target.value })} maxLength="150" required /></label>
            <label>Customer contact<input className="form-input" type="tel" value={form.customer_contact} onChange={event => setForm({ ...form, customer_contact: event.target.value })} required /></label>
            <label>Model code (optional)<input className="form-input" value={modelCode} onChange={event => { modelLookupSequence.current += 1; setModelLookupBusy(false); setModelCode(event.target.value); setModelLookupMessage(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); findModelName(); } }} maxLength="100" placeholder="e.g. XT2429-2" /></label>
            <div className="service-call-model-lookup">
              <button className="btn btn-secondary" type="button" onClick={findModelName} disabled={modelLookupBusy || form.device_type !== 'Mobile'}>
                {modelLookupBusy ? 'Finding model…' : 'Find model name'}
              </button>
              <small role="status">{modelLookupMessage || 'Lookup starts automatically when you pause typing.'}</small>
            </div>
            <label>Device model<input className="form-input" value={form.model} onChange={event => setForm({ ...form, model: event.target.value })} maxLength="150" required /></label>
            <label>Warranty status<select className="form-input" value={form.warranty_status} onChange={event => setForm({ ...form, warranty_status: event.target.value })}><option>In Warranty</option><option>Out of Warranty</option></select></label>
            <label>Call type<select className="form-input" value={form.call_type} onChange={event => setForm({ ...form, call_type: event.target.value })}><option>Hardware</option><option>Software</option></select></label>
            <label>Part order status<select className="form-input" value={form.part_order_status} onChange={event => setForm({ ...form, part_order_status: event.target.value })}><option>Not Yet Ordered</option><option>Ordered</option></select></label>
            <label>Submission date and time<input className="form-input" type="datetime-local" value={form.submission_at} onChange={event => setForm({ ...form, submission_at: event.target.value })} required /></label>
            <label>Market name<input className="form-input" value={form.market_name || ''} onChange={event => setForm({ ...form, market_name: event.target.value })} maxLength="150" /></label>
            <label>MTM number<input className="form-input" value={form.mtm_number || ''} onChange={event => setForm({ ...form, mtm_number: event.target.value })} maxLength="100" /></label>
            <label>Activation date<input className="form-input" type="date" value={form.activation_date || ''} onChange={event => setForm({ ...form, activation_date: event.target.value })} /></label>
            <label>Warranty expiry date<input className="form-input" type="date" value={form.warranty_expiry_date || ''} onChange={event => setForm({ ...form, warranty_expiry_date: event.target.value })} /></label>
            <label>Second IMEI (optional)<input className="form-input" inputMode="numeric" pattern="[0-9]{15}" maxLength="15" value={form.second_imei || ''} onChange={event => setForm({ ...form, second_imei: event.target.value })} /></label>
            <label>Parts approval email status<select className="form-input" value={String(form.mail_sent)} onChange={event => setForm({ ...form, mail_sent: event.target.value === 'true' })}><option value="false">Not sent</option><option value="true">Sent</option></select></label>
          </div>
          <label>Issue description<textarea className="form-input" rows="4" value={form.issue_description} onChange={event => setForm({ ...form, issue_description: event.target.value })} maxLength="10000" required /></label>
          {form.warranty_status === 'Out of Warranty' && (
            <div className="service-call-form-grid">
              <label>Quotation amount (₹)<input className="form-input" type="number" min="0" step="0.01" value={form.quotation_amount} onChange={event => setForm({ ...form, quotation_amount: event.target.value })} required /></label>
              <label>Submitted amount (₹)<input className="form-input" type="number" min="0" step="0.01" value={form.submitted_amount} onChange={event => setForm({ ...form, submitted_amount: event.target.value })} required /></label>
              <label>Payment method<select className="form-input" value={form.payment_method} onChange={event => setForm({ ...form, payment_method: event.target.value })} required><option value="">Select payment</option><option>Cash</option><option>QR</option></select></label>
            </div>
          )}
          <div className="service-call-form-actions"><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save service call'}</button><button className="btn btn-secondary" type="button" onClick={() => setView(editingId ? 'list' : 'dashboard')}>Cancel</button></div>
        </form>
      )}

      {view === 'details' && selectedCall && (
        <div className="service-call-details">
          <div className="service-call-details-heading"><div><h4>{selectedCall.soin}</h4><p>{selectedCall.customer_name} · {selectedCall.model}</p></div><div>{renderTat(selectedCall)}</div></div>
          <dl className="service-call-detail-grid">
            {[
              ['Device type', selectedCall.device_type], ['IMEI', selectedCall.imei || '—'], ['Customer contact', selectedCall.customer_contact], ['Issue', selectedCall.issue_description],
              ['Second IMEI', selectedCall.second_imei || '—'], ['Market name', selectedCall.market_name || '—'], ['MTM number', selectedCall.mtm_number || '—'],
              ['Activation date', selectedCall.activation_date || '—'], ['Warranty expiry date', selectedCall.warranty_expiry_date || '—'],
              ['Warranty', selectedCall.warranty_status], ['Call type', selectedCall.call_type], ['Parts', selectedCall.part_order_status],
              ['Parts approval email', selectedCall.mail_sent ? 'Sent' : 'Not sent'], ['Submission', formatIndiaDateTime(selectedCall.submission_at)],
              ['TAT deadline', formatIndiaDateTime(selectedCall.relog_due_at)],
              ['Quotation', selectedCall.quotation_amount == null ? '—' : `₹${Number(selectedCall.quotation_amount).toFixed(2)}`],
              ['Submitted amount', selectedCall.submitted_amount == null ? '—' : `₹${Number(selectedCall.submitted_amount).toFixed(2)}`],
              ['Payment', selectedCall.payment_method || '—']
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <div className="service-call-form-actions">
            <button className="btn btn-secondary" onClick={() => setView('list')}>Back to calls</button>
            <button className="btn btn-secondary" onClick={() => openEditForm(selectedCall)}>Edit</button>
            <button className="btn btn-primary" onClick={() => { setSoinForm({ soin: selectedCall.soin, reason: '' }); setSoinModalOpen(true); }}>Update SOIN</button>
            {!selectedCall.mail_sent && (selectedCall.approval_email_sending
              ? <button className="btn btn-secondary" onClick={() => resolveApprovalSend(selectedCall, 'details')} disabled={approvalBusy}>Resolve send status</button>
              : <button className="btn btn-primary" onClick={() => openApprovalComposer(selectedCall, 'details')} disabled={approvalBusy}>Send mail</button>)}
          </div>
          <div className="service-call-history">
            <h4>SOIN change history</h4>
            {history.length === 0 ? <p>No SOIN changes recorded.</p> : history.map(entry => (
              <div key={entry.id}><strong>{entry.previous_soin} → {entry.new_soin}</strong><span>{formatIndiaDateTime(entry.changed_at)} · {entry.administrator_id || 'Admin'}{entry.reason ? ` · ${entry.reason}` : ''}</span></div>
            ))}
          </div>
        </div>
      )}

      {view === 'approval' && approvalComposer && (
        <form className="service-call-form service-call-approval" onSubmit={sendApprovalEmail}>
          <h4>Review parts-approval email</h4>
          <p>From: <strong>{approvalComposer.sender}</strong></p>
          <label>To (separate addresses with commas or new lines)<textarea className="form-input" rows="3" value={approvalComposer.toText} onChange={event => setApprovalComposer({ ...approvalComposer, toText: event.target.value })} required /></label>
          <label>CC (separate addresses with commas or new lines)<textarea className="form-input" rows="3" value={approvalComposer.ccText} onChange={event => setApprovalComposer({ ...approvalComposer, ccText: event.target.value })} /></label>
          <label>Subject<input className="form-input" value={approvalComposer.subject} readOnly /></label>
          <label>Approval request<textarea className="form-input" rows="3" maxLength="2000" value={approvalComposer.request_text} onChange={event => setApprovalComposer({ ...approvalComposer, request_text: event.target.value })} required /></label>
          <label>Technician remark<textarea className="form-input" rows="4" maxLength="5000" value={approvalComposer.remark} onChange={event => setApprovalComposer({ ...approvalComposer, remark: event.target.value })} required /></label>
          <label>Video link (optional)<input className="form-input" type="url" value={approvalComposer.video_link} onChange={event => setApprovalComposer({ ...approvalComposer, video_link: event.target.value })} placeholder="https://" /></label>
          <div className="service-call-approval-preview">
            <h5>Email body preview</h5>
            <p>Dear Sir,<br />Request for approval: {approvalComposer.request_text}</p>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>SO NO</th><th>IMEI 1</th><th>IMEI 2</th><th>Model No</th><th>Activation Date</th><th>Warranty End Date</th></tr></thead>
                <tbody><tr>
                  <td>{approvalComposer.call.soin}</td><td>{approvalComposer.call.imei || '—'}</td><td>{approvalComposer.call.second_imei || '—'}</td>
                  <td>{approvalComposer.call.model}</td><td>{formatApprovalDate(approvalComposer.call.activation_date)}</td><td>{formatApprovalDate(approvalComposer.call.warranty_expiry_date)}</td>
                </tr></tbody>
              </table>
            </div>
            <p>Fault Description: {approvalComposer.call.issue_description}</p>
            <p>Remark: {approvalComposer.remark}</p>
            {approvalComposer.video_link && <p>Video Link: {approvalComposer.video_link}</p>}
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>SL NO</th><th>MODEL</th><th>IMEI 1</th><th>IMEI 2</th><th>MTM</th><th>Activation Date</th></tr></thead>
                <tbody><tr>
                  <td>1</td><td>{approvalComposer.call.model}</td><td>{approvalComposer.call.imei || '—'}</td><td>{approvalComposer.call.second_imei || '—'}</td>
                  <td>{approvalComposer.call.mtm_number}</td><td>{formatApprovalDate(approvalComposer.call.activation_date)}</td>
                </tr></tbody>
              </table>
            </div>
          </div>
          <label>Photos (1–6 images, compressed before sending)<input className="form-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addApprovalImages} disabled={approvalBusy || approvalComposer.images.length >= 6} /></label>
          {approvalComposer.images.length > 0 && (
            <ul className="service-call-approval-images">
              {approvalComposer.images.map((image, index) => (
                <li key={`${image.name}-${index}`}>
                  <span>{image.name} · {(image.size / 1024).toFixed(0)} KB</span>
                  <button className="service-call-link" type="button" onClick={() => setApprovalComposer(current => ({
                    ...current,
                    images: current.images.filter((_, imageIndex) => imageIndex !== index)
                  }))}>Remove</button>
                </li>
              ))}
            </ul>
          )}
          <p className="service-call-approval-subject">The email will be sent exactly as previewed above with the listed images attached.</p>
          <div className="service-call-form-actions">
            <button className="btn btn-primary" type="submit" disabled={approvalBusy || approvalComposer.images.length === 0}>{approvalBusy ? 'Preparing…' : 'Confirm and send email'}</button>
            <button className="btn btn-secondary" type="button" disabled={approvalBusy} onClick={() => { setView(approvalComposer.returnView); setApprovalComposer(null); }}>Cancel</button>
          </div>
        </form>
      )}

      {soinModalOpen && selectedCall && (
        <div className="service-call-modal-backdrop" role="presentation">
          <form className="service-call-modal" onSubmit={saveSoin}>
            <h4>Update SOIN for {selectedCall.soin}</h4>
            <label>New SOIN<input className="form-input" value={soinForm.soin} onChange={event => setSoinForm({ ...soinForm, soin: event.target.value })} maxLength="100" required /></label>
            <label>Reason (optional)<textarea className="form-input" rows="3" maxLength="500" value={soinForm.reason} onChange={event => setSoinForm({ ...soinForm, reason: event.target.value })} /></label>
            <div className="service-call-form-actions"><button className="btn btn-primary" disabled={loading}>Confirm SOIN change</button><button className="btn btn-secondary" type="button" onClick={() => setSoinModalOpen(false)}>Cancel</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ServiceCalls;
