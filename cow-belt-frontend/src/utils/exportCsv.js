export function downloadCsv(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }
  const headers = Object.keys(rows[0]);
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const lines = [headers.join(',')].concat(
    rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','))
  );
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}




