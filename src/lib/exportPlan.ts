// Dependency-free trip-plan export: print/PDF, Word (.doc) and Excel (.xls).
// PDF uses the browser's print dialog (Save as PDF); Word/Excel use the classic
// HTML-blob trick that Office opens natively — no extra packages required.

export interface PlanExport {
  tripName: string;
  dateFrom: string;
  dateTo: string;
  budgetCap: number;
  spent: number;
  items: { label: string; amount: number }[];
  stops: { title: string; done: boolean }[];
  notes: string;
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const esc = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

const dateRange = (p: PlanExport) =>
  `${p.dateFrom || '—'}  →  ${p.dateTo || '—'}`;

function slug(p: PlanExport) {
  return (p.tripName || 'maharashtra-plan').replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '');
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Inner HTML body shared by print + Word. */
function planBody(p: PlanExport): string {
  const remaining = p.budgetCap - p.spent;
  const itemRows = p.items.length
    ? p.items.map((i) => `<tr><td>${esc(i.label)}</td><td class="num">${inr(i.amount)}</td></tr>`).join('')
    : '<tr><td colspan="2">No budget items</td></tr>';
  const stops = p.stops.length
    ? p.stops.map((s, i) => `<li>${i + 1}. ${esc(s.title)}${s.done ? ' — done' : ''}</li>`).join('')
    : '<li>No stops added</li>';
  return `
    <h1>${esc(p.tripName || 'My Maharashtra Adventure')}</h1>
    <p class="sub">${dateRange(p)}</p>

    <h2>Itinerary</h2>
    <ol>${stops}</ol>

    <h2>Budget</h2>
    <table>
      <thead><tr><th>Item</th><th class="num">Amount</th></tr></thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr><td><b>Spent</b></td><td class="num"><b>${inr(p.spent)}</b></td></tr>
        <tr><td>Budget</td><td class="num">${inr(p.budgetCap)}</td></tr>
        <tr><td>${remaining < 0 ? 'Over budget' : 'Remaining'}</td><td class="num">${inr(Math.abs(remaining))}</td></tr>
      </tfoot>
    </table>

    <h2>Notes</h2>
    <p>${esc(p.notes).replace(/\n/g, '<br>') || '—'}</p>
  `;
}

const PRINT_CSS = `
  *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#15202b;padding:40px;max-width:760px;margin:0 auto}
  h1{font-size:26px;margin:0} .sub{color:#ff7a3d;font-weight:bold;margin:4px 0 24px}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#5a6675;border-bottom:2px solid #ff7a3d;padding-bottom:4px;margin:26px 0 10px}
  ol{padding-left:20px} li{margin:4px 0}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #d8dee6;padding:8px 10px;text-align:left;font-size:14px}
  th{background:#f4f6fb} .num{text-align:right} tfoot td{background:#fafbfd}
`;

/** Print → user picks "Save as PDF" in the print dialog. */
export function exportPlanPDF(p: PlanExport) {
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.tripName || 'Trip plan')}</title><style>${PRINT_CSS}</style></head><body>${planBody(p)}<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},250)}<\/script></body></html>`,
  );
  w.document.close();
}

/** Word — an HTML document with a .doc extension + Word MIME. */
export function exportPlanWord(p: PlanExport) {
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>${PRINT_CSS}</style></head><body>${planBody(p)}</body></html>`;
  download(new Blob(['﻿' + html], { type: 'application/msword' }), `${slug(p)}.doc`);
}

/** Excel — an HTML table with a .xls extension + Excel MIME. */
export function exportPlanExcel(p: PlanExport) {
  const itemRows = p.items.map((i) => `<tr><td>${esc(i.label)}</td><td>${i.amount}</td></tr>`).join('');
  const stopRows = p.stops.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.title)}</td><td>${s.done ? 'done' : 'planned'}</td></tr>`).join('');
  const table = `
    <table border="1">
      <tr><th colspan="3">${esc(p.tripName || 'My Maharashtra Adventure')}</th></tr>
      <tr><td>Dates</td><td colspan="2">${esc(dateRange(p))}</td></tr>
      <tr></tr>
      <tr><th colspan="3">Itinerary</th></tr>
      <tr><th>#</th><th>Stop</th><th>Status</th></tr>
      ${stopRows || '<tr><td colspan="3">—</td></tr>'}
      <tr></tr>
      <tr><th colspan="3">Budget</th></tr>
      <tr><th>Item</th><th>Amount (INR)</th><th></th></tr>
      ${itemRows || '<tr><td colspan="3">—</td></tr>'}
      <tr><td>Spent</td><td>${p.spent}</td><td></td></tr>
      <tr><td>Budget cap</td><td>${p.budgetCap}</td><td></td></tr>
    </table>`;
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>${table}</body></html>`;
  download(new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' }), `${slug(p)}.xls`);
}
