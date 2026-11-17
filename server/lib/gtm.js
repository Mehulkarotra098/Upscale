// Google Tag Manager (container GTM-MXD5KLR3) for the pages built in JavaScript: the card editor and the blog's
// fallback shell. The Python-built pages get the same tag from source/build/tracking.py; keep the two in step.
export const GTM_ID = 'GTM-MXD5KLR3';
// Consent first (Consent Mode v2): ads off always; analytics off until a "yes" in the EU/EEA, UK, Switzerland and Quebec,
// on elsewhere (turned off from "Change cookie choice"); a saved answer (12 months) wins and Global Privacy Control means off. No <noscript> fallback: a visitor without JavaScript can't be asked.
export const GTM_CONSENT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}(function(){var c='',d='denied',s=1;try{var p=(localStorage.getItem('us-consent')||'').split(':');if(Date.now()-(+p[1]||0)<31536e6)c=p[0];}catch(e){}try{s=/^(Europe\\/|Arctic\\/|Atlantic\\/(Reykjavik|Canary|Madeira|Azores|Faroe)|Asia\\/(Nicosia|Famagusta)|America\\/(Montreal|Toronto|Blanc-Sablon))/.test(Intl.DateTimeFormat().resolvedOptions().timeZone)?1:0;}catch(e){}document.documentElement.setAttribute('data-cc',s?'ask':'note');var on=c==='yes'||(c!=='no'&&!s&&!navigator.globalPrivacyControl);gtag('consent','default',{ad_storage:d,ad_user_data:d,ad_personalization:d,analytics_storage:on?'granted':d});if(!c)gtag('consent','default',{ad_storage:d,ad_user_data:d,ad_personalization:d,analytics_storage:d,region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH','CA-QC']});})();gtag('js',new Date());`;
// Only on the live domain (17 Nov 2026): local test copies and Vercel previews loaded the same tag and were counted as
// visits from India, which inflated the numbers on test days. Same async load as Google's own snippet.
export const GTM_HEAD = `<script>${GTM_CONSENT}</script>
<script>if(/(^|\\.)uscale\\.in$/.test(location.hostname)){var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";document.head.appendChild(s);}</script>`;
export const GTM_BODY = '';
