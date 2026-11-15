// Google Tag Manager (container GTM-MXD5KLR3) for the pages built in JavaScript: the card editor and the blog's
// fallback shell. The Python-built pages get the same tag from source/build/tracking.py; keep the two in step.
export const GTM_ID = 'GTM-MXD5KLR3';
// Consent first (Consent Mode v2): ads off always, analytics off unless this browser holds a "yes" from the cookie
// question, given in the last 12 months. No <noscript> fallback: a visitor without JavaScript can't be asked.
export const GTM_CONSENT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}(function(){var c='',d='denied';try{var p=(localStorage.getItem('us-consent')||'').split(':');if(Date.now()-(+p[1]||0)<31536e6)c=p[0];}catch(e){}gtag('consent','default',{ad_storage:d,ad_user_data:d,ad_personalization:d,analytics_storage:c==='yes'?'granted':d});})();gtag('js',new Date());`;
export const GTM_HEAD = `<script>${GTM_CONSENT}</script>
<script async src="https://www.googletagmanager.com/gtm.js?id=${GTM_ID}"></script>`;
export const GTM_BODY = '';
