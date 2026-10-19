import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changedPages } from '../../server/blog/sitepages.js';

test('only pages whose content date changed (or were never announced) are re-announced', () => {
  const pages = [
    { url: 'https://uscale.in/', lastmod: '2026-10-19' },
    { url: 'https://uscale.in/pricing', lastmod: '2026-10-10' },
    { url: 'https://uscale.in/about', lastmod: '2026-10-19' },
  ];
  const known = [
    { url: 'https://uscale.in/', lastmod: '2026-10-12' },
    { url: 'https://uscale.in/pricing', lastmod: '2026-10-10' },
  ];
  assert.deepEqual(
    changedPages(pages, known).map((p) => p.url),
    ['https://uscale.in/', 'https://uscale.in/about'],
  );
  assert.deepEqual(changedPages(pages, pages), []);
});
