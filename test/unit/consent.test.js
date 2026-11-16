// The consent state must be set before Tag Manager loads, and the same way on every kind of page: the Python-built
// pages (source/build/tracking.py) and the pages built in JavaScript (server/lib/gtm.js).
// Rules since 16 Nov 2026: ask first in the EU/EEA, UK, Switzerland and Quebec (by device time zone, with Google's own
// region check as a second net); on elsewhere; a saved answer (12 months) wins; Global Privacy Control means off; ads off always.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { GTM_BODY, GTM_CONSENT, GTM_HEAD, GTM_ID } from '../../server/lib/gtm.js';

const py = readFileSync(new URL('../../source/build/tracking.py', import.meta.url), 'utf8');

test('consent: the Python and JavaScript tags carry the same consent script', () => {
  const m = py.match(/^CONSENT = \("(.*)"\)$/m);
  assert.ok(m, 'tracking.py defines CONSENT on one line');
  assert.equal(m[1].replace(/\\(["\\])/g, '$1'), GTM_CONSENT);
  assert.ok(py.includes(`GTM_ID = '${GTM_ID}'`));
});

test('consent: the default is set before the tag loads, and nothing loads without JavaScript', () => {
  assert.ok(GTM_HEAD.indexOf("gtag('consent','default'") < GTM_HEAD.indexOf('googletagmanager.com/gtm.js'));
  assert.equal(GTM_BODY, '');
  assert.ok(!GTM_HEAD.includes('noscript'));
});

// Runs the head script with a given saved answer, device time zone and Global Privacy Control setting.
function run(stored, timeZone, gpc = false) {
  const calls = [];
  const attrs = {};
  const window = { dataLayer: [] };
  const document = { documentElement: { setAttribute: (k, v) => (attrs[k] = v) } };
  const navigator = { globalPrivacyControl: gpc };
  const Intl = { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone }) }) };
  new Function(
    'window',
    'localStorage',
    'dataLayer',
    'document',
    'navigator',
    'Intl',
    'calls',
    GTM_CONSENT.replace('function gtag(){dataLayer.push(arguments);}', 'function gtag(){calls.push([].slice.call(arguments));}'),
  )(window, { getItem: () => stored }, window.dataLayer, document, navigator, Intl, calls);
  const d = calls.filter((c) => c[0] === 'consent' && c[1] === 'default').map((c) => c[2]);
  return { all: d[0], region: d[1], mode: attrs['data-cc'] };
}

const ASK = ['Europe/London', 'Europe/Berlin', 'Europe/Zurich', 'Atlantic/Reykjavik', 'America/Toronto', 'America/Montreal'];
const ELSEWHERE = ['Asia/Kolkata', 'America/New_York', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'UTC'];
const yes = 'yes:' + Date.now();
const no = 'no:' + Date.now();
const stale = 'yes:' + (Date.now() - 400 * 864e5);

test('consent: in the EU, UK, Switzerland and Quebec analytics waits for a recent yes', () => {
  for (const tz of ASK) {
    for (const stored of [null, '', no, stale, 'yes']) assert.equal(run(stored, tz).all.analytics_storage, 'denied', tz + ' ' + stored);
    assert.equal(run(yes, tz).all.analytics_storage, 'granted', tz);
    assert.equal(run(null, tz).mode, 'ask', tz);
  }
});

test('consent: elsewhere analytics is on unless the visitor said no or the browser sends Global Privacy Control', () => {
  for (const tz of ELSEWHERE) {
    for (const stored of [null, '', stale, yes]) assert.equal(run(stored, tz).all.analytics_storage, 'granted', tz + ' ' + stored);
    assert.equal(run(no, tz).all.analytics_storage, 'denied', tz);
    assert.equal(run(null, tz, true).all.analytics_storage, 'denied', tz + ' with GPC');
    assert.equal(run(null, tz).mode, 'note', tz);
  }
});

test('consent: ads are always denied, and Google’s own region check backs up the time zone until the visitor answers', () => {
  for (const tz of ASK.concat(ELSEWHERE)) {
    for (const stored of [null, yes, no]) {
      const r = run(stored, tz);
      for (const k of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(r.all[k], 'denied', tz + ' ' + k);
      if (stored === null) {
        assert.equal(r.region.analytics_storage, 'denied');
        for (const c of ['GB', 'DE', 'FR', 'CH', 'NO', 'CA-QC']) assert.ok(r.region.region.includes(c), c);
        assert.ok(!r.region.region.includes('IN') && !r.region.region.includes('US'));
      } else assert.equal(r.region, undefined, 'no region default once the visitor has answered');
    }
  }
});
