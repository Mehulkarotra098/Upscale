// The newer tool features that can be checked without a browser: the bulk list reader, the zip writer,
// the A4 layout, and colouring a card from a logo.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { a4Grid, zipStore } from '../../card/src/core/export.js';
import { coloursFromPixels, hexToRgb, luminance, matchPalette, rgbToHsl } from '../../card/src/editor/extras.js';
import { parseBulk } from '../../card/src/qrtool/bulk.js';

test('bulk list: names, spreadsheet rows and links with commas', () => {
  const rows = parseBulk(
    'Table 1, https://a.example/m?t=1\n\n  https://a.example/x,y  \nShop\thttps://b.example\nwww.c.example, extra',
    'link',
  );
  assert.deepEqual(rows, [
    { name: 'Table 1', value: 'https://a.example/m?t=1' },
    { name: '', value: 'https://a.example/x,y' },
    { name: 'Shop', value: 'https://b.example' },
    { name: '', value: 'www.c.example, extra' },
  ]);
});

test('bulk list: plain text keeps its commas, and long input is trimmed', () => {
  assert.deepEqual(parseBulk('Hello, world', 'text'), [{ name: '', value: 'Hello, world' }]);
  const [row] = parseBulk(`${'n'.repeat(50)}, ${'v'.repeat(900)}`, 'link');
  assert.equal(row.name.length, 50);
  assert.equal(row.value.length, 600);
  assert.deepEqual(parseBulk('   \n\n', 'link'), []);
});

test('zip: a real unzip tool reads back every file, including a non-English name', async () => {
  const files = [
    { name: '001-table-1.png', bytes: new Uint8Array([137, 80, 78, 71, 1, 2, 3]) },
    { name: '002-टेबल.svg', bytes: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>') },
    { name: '003-empty.txt', bytes: new Uint8Array(0) },
  ];
  const bytes = new Uint8Array(await zipStore(files).arrayBuffer());
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  // End record: the file count is written twice.
  const end = new DataView(bytes.buffer, bytes.length - 22);
  assert.equal(end.getUint32(0, true), 0x06054b50);
  assert.equal(end.getUint16(8, true), 3);
  assert.equal(end.getUint16(10, true), 3);
  const dir = mkdtempSync(join(tmpdir(), 'uszip-'));
  const zip = join(dir, 'out.zip');
  writeFileSync(zip, bytes);
  let listing;
  try {
    listing = execFileSync(
      'python3',
      [
        '-c',
        'import sys,zipfile,json;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(json.dumps({n:list(z.read(n)) for n in z.namelist()}))',
        zip,
      ],
      { encoding: 'utf8' },
    );
  } catch (e) {
    if (e.code === 'ENOENT') return; // no python on this machine: the structure checks above still ran
    throw e;
  }
  const back = JSON.parse(listing);
  assert.deepEqual(
    Object.keys(back),
    files.map((f) => f.name),
  );
  for (const f of files) assert.deepEqual(back[f.name], [...f.bytes]);
  assert.ok(readFileSync(zip).length > 0);
});

test('A4 layout: tiles fit the page and never overlap', () => {
  for (const w of [30, 40, 50, 60, 90]) {
    for (const h of [w, (w * 86) / 70]) {
      const g = a4Grid(w, h);
      assert.equal(g.cells.length, g.perPage);
      assert.ok(g.perPage >= 1);
      for (const c of g.cells) {
        assert.ok(c.x >= 9.99 && c.x + w <= 200.01, `x fits for ${w}`);
        assert.ok(c.y >= 9.99 && c.y + h <= 287.01, `y fits for ${w}x${h}`);
      }
      if (g.cols > 1) assert.ok(g.cells[1].x - g.cells[0].x >= w + 3.99);
    }
  }
  assert.equal(a4Grid(40, 40).perPage, 24);
  assert.equal(a4Grid(40, 40, { caption: 6 }).perPage, 20);
});

const px = (list) =>
  new Uint8ClampedArray(list.flatMap(([hex, n, a = 255]) => Array.from({ length: n }, () => [...hexToRgb(hex), a]).flat()));

test('logo colours: the strongest colour wins, a clearly different second colour is kept', () => {
  const found = coloursFromPixels(
    px([
      ['#FFFFFF', 400],
      ['#E85D04', 300],
      ['#0D6E7D', 120],
      ['#111111', 80],
      ['#00FF00', 200, 0],
    ]),
  );
  assert.equal(found.length, 2);
  const [h1] = rgbToHsl(...hexToRgb(found[0]));
  const [h2] = rgbToHsl(...hexToRgb(found[1]));
  assert.ok(Math.abs(h1 - 23) < 6, `first is the orange (${h1})`);
  assert.ok(Math.abs(h2 - 188) < 6, `second is the teal (${h2})`);
});

test('logo colours: a black, white and grey logo gives nothing to match', () => {
  assert.deepEqual(
    coloursFromPixels(
      px([
        ['#FFFFFF', 300],
        ['#111111', 300],
        ['#888888', 100],
      ]),
    ),
    [],
  );
  assert.deepEqual(coloursFromPixels(new Uint8ClampedArray(0)), []);
});

test('matching a palette to a brand keeps every colour as light as it was', () => {
  const palettes = [
    { paper: '#FFFFFF', deep: '#0D3B42', plus: '#F3F8F7', ink: '#0D3B42', soft: '#566F73', rule: '#A9BFC0', accent: '#128C8C' },
    { ink: '#121212', pop: '#D7FF3E', soft: '#EDEDE6' },
    { paper: '#FFF7EA', head: '#C4152E', cloth: '#C4152E', dot: '#FFE9B0', ink: '#3B1414' },
    { paper: '#F7EEDD', deep: '#6E1423', gold: '#B98A2F', ink: '#3A1F1A' },
  ];
  for (const brand of [['#E85D04', '#0D6E7D'], ['#1D4ED8'], ['#FFD400'], ['#7B2CBF', '#F72585']]) {
    for (const p of palettes) {
      const out = matchPalette(p, brand);
      assert.deepEqual(Object.keys(out), Object.keys(p));
      for (const k of Object.keys(p)) {
        assert.match(out[k], /^#[0-9A-F]{6}$/);
        assert.ok(
          Math.abs(luminance(...hexToRgb(out[k])) - luminance(...hexToRgb(p[k]))) < 0.012,
          `${k} keeps its lightness for ${brand[0]}`,
        );
      }
    }
  }
});

test('matching a palette: accents take the brand hue, pure greys stay grey, nothing changes without a brand', () => {
  const p = { paper: '#FFFFFF', ink: '#222222', accent: '#128C8C', gold: '#B98A2F', glass: '#128C8C80' };
  const out = matchPalette(p, ['#1D4ED8', '#E85D04']);
  const hue = (hex) => rgbToHsl(...hexToRgb(hex))[0];
  const blue = hue('#1D4ED8');
  const orange = hue('#E85D04');
  assert.ok(Math.abs(hue(out.accent) - blue) < 8, 'main accent is the first brand colour');
  assert.ok(Math.abs(hue(out.gold) - orange) < 8, 'a different accent takes the second brand colour');
  assert.equal(rgbToHsl(...hexToRgb(out.ink))[1], 0, 'grey ink stays grey');
  assert.equal(out.paper, '#FFFFFF');
  assert.equal(out.glass.slice(7), '80', 'see-through colours keep how see-through they are');
  assert.deepEqual(matchPalette(p, []), p);
});
