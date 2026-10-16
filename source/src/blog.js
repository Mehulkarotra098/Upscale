/* U Scale | blog.js — table of contents (scroll spy + mobile toggle), copy-link, read counter. No dependencies. */
(function () {
  var toc = document.querySelector('.btoc');
  if (toc) {
    var title = toc.querySelector('.btoc__title');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Show';
    btn.addEventListener('click', function () {
      var open = toc.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Hide' : 'Show';
    });
    title.appendChild(btn);
    var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
    var map = {};
    links.forEach(function (a) { map[decodeURIComponent(a.hash.slice(1))] = a; });
    var heads = links.map(function (a) { return document.getElementById(decodeURIComponent(a.hash.slice(1))); }).filter(Boolean);
    var current = null;
    var set = function (id) {
      if (id === current) return; current = id;
      links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
      var a = map[id]; if (!a) return;
      a.classList.add('is-active'); a.setAttribute('aria-current', 'location');
      var ol = a.closest('ol'); if (ol && ol.scrollHeight > ol.clientHeight) {
        var top = a.offsetTop - ol.clientHeight / 2; ol.scrollTop = Math.max(0, top);
      }
    };
    var onScroll = function () {
      var y = window.innerHeight * 0.3, pick = heads[0];
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top <= y) pick = heads[i]; else break; }
      if (pick) set(pick.id);
    };
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
    onScroll();
    toc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      if (window.matchMedia('(max-width:1079px)').matches) { toc.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Show'; }
    });
  }

  // Share block at the end of the article on phones (sidebar share is hidden there)
  var side = document.querySelector('.bshare'), body = document.querySelector('.bpost__body');
  if (side && body) { var end = side.cloneNode(true); end.classList.add('bshare--end'); body.appendChild(end); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var url = b.getAttribute('data-copy');
    var done = function () { var t = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = t; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });

  // Read counter: once per article per browser session, after 10 seconds on the page
  var art = document.querySelector('.bpost[data-post]');
  if (art && !art.hasAttribute('data-preview')) {
    var id = art.getAttribute('data-post'), key = 'us-read-' + id;
    var seen = false; try { seen = sessionStorage.getItem(key); } catch (e) {}
    if (!seen) setTimeout(function () {
      try { sessionStorage.setItem(key, '1'); } catch (e) {}
      var u = '/api/blog?view=hit&id=' + encodeURIComponent(id);
      if (navigator.sendBeacon) navigator.sendBeacon(u); else fetch(u, { method: 'POST', keepalive: true });
    }, 10000);
  }
})();
