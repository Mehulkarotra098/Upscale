// The consent state must be set before Tag Manager loads, and the same way on every kind of page: the Python-built
// pages (source/build/tracking.py) and the pages built in JavaScript (server/lib/gtm.js).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { GTM_BODY, GTM_CONSENT, GTM_HEAD, GTM_ID } from '../../server/lib/gtm.js';

const py = readFileSync(new URL('../../source/build/tracking.py', import.meta.url), 'utf8');

test('consent: the Python and JavaScript tags carry the same consent script', () => {
  const m = py.match(/^CONSENT = \("(.*)"\)$/m);
  assert.ok(m, 'tracking.py defines CONSENT on one line');
  assert.equal(m[1].replace(/\\"/g, '"'), GTM_CONSENT);
  assert.ok(py.includes(`GTM_ID = '${GTM_ID}'`));
});

test('consent: the default is set before the tag loads, and nothing loads without JavaScript', () => {
  assert.ok(GTM_HEAD.indexOf("gtag('consent','default'") < GTM_HEAD.indexOf('googletagmanager.com/gtm.js'));
  assert.equal(GTM_BODY, '');
  assert.ok(!GTM_HEAD.includes('noscript'));
});

function defaults(stored) {
  const calls = [];
  const window = { dataLayer: [] };
  const localStorage = { getItem: () => stored };
  new Function(
    'window',
    'localStorage',
    'dataLayer',
    GTM_CONSENT.replace('function gtag(){dataLayer.push(arguments);}', 'function gtag(){calls.push([].slice.call(arguments));}').replace(
      /^/,
      'var calls=arguments[3];',
    ),
  )(window, localStorage, window.dataLayer, calls);
  return calls.find((c) => c[0] === 'consent' && c[1] === 'default')[2];
}

test('consent: analytics is denied unless this browser holds a recent yes; ads are always denied', () => {
  for (const stored of [null, '', 'no:' + Date.now(), 'yes:' + (Date.now() - 400 * 864e5), 'yes']) {
    assert.equal(defaults(stored).analytics_storage, 'denied', String(stored));
  }
  const yes = defaults('yes:' + Date.now());
  assert.equal(yes.analytics_storage, 'granted');
  for (const k of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(yes[k], 'denied');
});
