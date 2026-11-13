// Reading the list for "many codes at once". Kept apart from the page so it can be tested on its own.

/** One code per line. A spreadsheet paste gives "name<TAB>value"; typed lists can use "name, value". */
export function parseBulk(text, kind) {
  const rows = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let name = '';
    let value = line;
    const tab = line.indexOf('\t');
    if (tab > 0) {
      name = line.slice(0, tab).trim();
      value = line.slice(tab + 1).trim();
    } else if (kind !== 'text') {
      const m = line.match(/^([^,]{1,60}),\s*(.+)$/);
      if (m && !/^(https?:\/\/|www\.)/i.test(m[1].trim())) {
        name = m[1].trim();
        value = m[2].trim();
      }
    }
    if (value) rows.push({ name: name.slice(0, 60), value: value.slice(0, 600) });
  }
  return rows;
}
