// IndexNow: tells Bing, Yandex and other participating search engines that a URL changed, so they recrawl it soon.
// No-op outside production or when INDEXNOW_KEY isn't set. Never throws: a failed ping must not fail a save or cron.
import { INDEXNOW_KEY, IS_PROD, SITE_URL } from '../config.js';
import { log } from './log.js';

export async function pingIndexNow(urls) {
  if (!INDEXNOW_KEY || !IS_PROD || !urls.length) return false;
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}indexnow-key.txt`,
        urlList: [...new Set(urls)],
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) log.warn('indexnow', 'ping rejected', { status: res.status });
    return res.ok;
  } catch (err) {
    log.warn('indexnow', 'ping failed', { err });
    return false;
  }
}
