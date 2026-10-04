/* U Scale | script.js
   Everything here is progressive: without JS the page is complete and readable.
   Motion uses transform/opacity, scroll work is rAF-throttled, and prefers-reduced-motion turns the extras off. */
(function(){
  'use strict';
  var d=document.documentElement;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var introMs=function(){return parseFloat(getComputedStyle(d).getPropertyValue('--intro'))*1000||0};
  var headerH=function(){return ($('.site-header')||{}).offsetHeight||72};

  /* ---------- Loader: hide once lifted; safety timer so the page is never blocked ---------- */
  var usl=$('#usl'), safety;
  function endLoader(){ if(usl) usl.hidden=true; }
  if(d.classList.contains('intro-skip')) endLoader();
  else if(usl){ usl.addEventListener('animationend',function(e){ if(e.target===usl) endLoader(); }); safety=setTimeout(endLoader,2600); }

  /* ---------- Smooth scroll: Lenis when available, native otherwise ---------- */
  var lenis=null;
  if(!reduce && window.Lenis){
    try{
      lenis=new window.Lenis({lerp:.09,smoothWheel:true,wheelMultiplier:1});
      var lraf=function(t){ lenis.raf(t); requestAnimationFrame(lraf); };
      requestAnimationFrame(lraf);
    }catch(e){ lenis=null; }
  }
  function scrollToTarget(el){
    var top = el ? el.getBoundingClientRect().top + window.scrollY - headerH() - 12 : 0;
    if(lenis) lenis.scrollTo(Math.max(0,top),{duration:1.2});
    else window.scrollTo({top:Math.max(0,top),behavior:reduce?'auto':'smooth'});
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute('href').slice(1);
    var el= id==='top' || id==='' ? null : document.getElementById(id);
    if(id!=='top' && id!=='' && !el) return;
    e.preventDefault();
    if(a.dataset.intent) prefill(a.dataset.intent);
    scrollToTarget(el);
    if(el && id!=='main'){ setTimeout(function(){ var f=el.querySelector('h2,h1')||el; if(!f.hasAttribute('tabindex')) f.setAttribute('tabindex','-1'); f.focus({preventScroll:true}); }, reduce?0:900); }
    if(id==='main'){ var m=$('#main'); m.setAttribute('tabindex','-1'); m.focus({preventScroll:true}); }
    if(history.replaceState) history.replaceState(null,'','#'+(id||'top'));
  });

  /* Plan and audit buttons pre-fill the enquiry (only if the visitor hasn't typed yet) */
  function prefill(intent){
    var t=$('#f-need'); if(!t || t.value.trim()) return;
    t.value = intent==='audit' ? "I'd like a free digital audit." : "I'm interested in the "+intent+" plan.";
  }

  /* ---------- Counters (start when visible; after the intro if visible on load) ---------- */
  function runCounters(delay){
    $$('[data-count]').forEach(function(el){
      var to=+el.dataset.count; if(reduce){ el.textContent=to; return; }
      el.textContent='0';
      setTimeout(function(){
        var t0=performance.now(), dur=1200;
        (function step(now){ var p=Math.min(1,(now-t0)/dur), k=1-Math.pow(1-p,4); el.textContent=Math.round(to*k); if(p<1) requestAnimationFrame(step); })(t0);
      }, delay);
    });
  }
  var stats=$('.stats'), loadT=performance.now();
  if(stats && 'IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ cio.disconnect(); var since=performance.now()-loadT; runCounters(Math.max(0, introMs()+750-since)); } }); },{threshold:.4});
    cio.observe(stats);
  }

  /* ---------- Live Mumbai time ---------- */
  try{
    var fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false});
    var tick=function(){ var t=fmt.format(new Date()); $$('[data-ist]').forEach(function(el){ el.textContent=t; }); };
    tick(); setInterval(tick,15000);
  }catch(e){}

  /* ---------- Word split for section headings ---------- */
  $$('[data-split]').forEach(function(h){
    var words=h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label',h.textContent.trim());
    h.innerHTML=words.map(function(w,i){ return '<span class="sw" aria-hidden="true"><span class="swi" style="--wi:'+i+'">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span></span>'; }).join(' ');
  });

  /* ---------- Scroll reveals ---------- */
  $$('[data-reveal-group]').forEach(function(g){ $$('[data-reveal]',g).forEach(function(el,i){ el.style.setProperty('--rd', i % 4); }); });
  var revealEls=$$('[data-reveal],[data-split]');
  if('IntersectionObserver' in window && !reduce){
    var rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); rio.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    revealEls.forEach(function(el){ rio.observe(el); });
  } else revealEls.forEach(function(el){ el.classList.add('is-in'); });
  $$('.scan').forEach(function(s){ if(reduce) s.classList.add('is-in'); });

  /* ---------- Header: frosted on scroll, dark over violet panels, hides down / returns up ---------- */
  var header=$('.site-header'), hero=$('#hero'), waFloat=$('.wa-float'), heroCta=$('.hero__cta');
  var darkZones=$$('[data-tone="dark"]'), waZones=$$('[data-wa-zone]'), waZoneVisible=new Set();
  var lastY=window.scrollY, ticking=false, menuOpen=false;
  if('IntersectionObserver' in window){
    var wio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) waZoneVisible.add(e.target); else waZoneVisible.delete(e.target); }); onScroll(); });
    waZones.forEach(function(z){ wio.observe(z); });
  }

  /* Scroll-linked progress (process line, founder blueprint, final CTA scale) */
  var progressEls=$$('[data-progress]');
  function progressOf(el){
    var r=el.getBoundingClientRect(), vh=window.innerHeight, kind=el.dataset.progress;
    var start= kind==='cta' ? vh : vh*.85, end= kind==='cta' ? vh*.25 : (kind==='steps' ? vh*.35 : vh*.2);
    var p=(start - r.top)/(start - end + (kind==='steps'? r.height*.6 : 0));
    return Math.max(0,Math.min(1,p));
  }
  var parallaxEls=$$('[data-parallax]');

  function onScroll(){
    var y=window.scrollY, hh=headerH();
    header.classList.toggle('is-scrolled', y>8);
    var probe=hh*.5, dark=false;
    for(var i=0;i<darkZones.length;i++){ var r=darkZones[i].getBoundingClientRect(); if(r.top<=probe && r.bottom>=probe){ dark=true; break; } }
    header.classList.toggle('is-dark', dark && y>8);
    if(!menuOpen){
      if(y>lastY+6 && y>window.innerHeight*.5) header.classList.add('is-hidden');
      else if(y<lastY-6 || y<window.innerHeight*.5) header.classList.remove('is-hidden');
    }
    if(waFloat && heroCta){
      var past=heroCta.getBoundingClientRect().bottom<0;
      waFloat.classList.toggle('is-visible', past && waZoneVisible.size===0);
    }
    if(!reduce){
      if(hero) hero.style.setProperty('--sy', Math.min(y,1200).toFixed(0));
      progressEls.forEach(function(el){
        var p=progressOf(el); el.style.setProperty('--p', p.toFixed(3));
        if(el.dataset.progress==='steps'){ $$('.step',el).forEach(function(s,i,a){ s.classList.toggle('is-lit', p >= i/(a.length-1) - .02); }); }
      });
      parallaxEls.forEach(function(el){ var r=el.getBoundingClientRect(); var c=r.top + r.height/2 - window.innerHeight/2; var t=Math.max(-60,Math.min(60,c*parseFloat(el.dataset.parallax))); el.style.transform='translate3d(0,'+t.toFixed(1)+'px,0)'; });
    } else {
      $$('.step').forEach(function(s){ s.classList.add('is-lit'); });
    }
    lastY=y; ticking=false;
  }
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(onScroll); } },{passive:true});
  window.addEventListener('resize',function(){ if(!ticking){ ticking=true; requestAnimationFrame(onScroll); } });
  onScroll();

  /* ---------- Scroll spy ---------- */
  var links=$$('.nav a'), map={};
  links.forEach(function(a){ var id=a.getAttribute('href').slice(1); if(document.getElementById(id)) map[id]=a; });
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){ a.removeAttribute('aria-current'); }); map[e.target.id].setAttribute('aria-current','true'); } }); },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){ spy.observe(document.getElementById(id)); });
  }

  /* ---------- Mobile menu ---------- */
  var btn=$('.menu-btn'), menu=$('#menu'), main=$('#main'), footer=$('.site-footer');
  function focusables(){ return [btn].concat($$('a,button',menu)); }
  function setMenu(open){
    menuOpen=open;
    btn.setAttribute('aria-expanded',String(open));
    btn.querySelector('.sr-only').textContent= open ? 'Close menu' : 'Menu';
    d.classList.toggle('menu-open',open);
    menu.classList.toggle('is-open',open);
    main.inert=open; if(footer) footer.inert=open; if(waFloat) waFloat.inert=open;
    if(lenis){ open ? lenis.stop() : lenis.start(); }
    if(open){ header.classList.remove('is-hidden'); setTimeout(function(){ var f=$('a',menu); if(f) f.focus({preventScroll:true}); }, reduce?0:250); }
  }
  if(btn){
    btn.addEventListener('click',function(){ setMenu(!menuOpen); });
    menu.addEventListener('click',function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown',function(e){
      if(!menuOpen) return;
      if(e.key==='Escape'){ setMenu(false); btn.focus(); }
      if(e.key==='Tab'){ var f=focusables(), i=f.indexOf(document.activeElement);
        if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); }
        else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); } }
    });
    matchMedia('(min-width:1024px)').addEventListener('change',function(m){ if(m.matches && menuOpen) setMenu(false); });
  }

  /* ---------- Hero depth + magnetic buttons + bubble cursor (desktop, motion allowed) ---------- */
  var card=$('#hero-card');
  if(fine && !reduce){
    if(hero){
      var tx=0,ty=0,cx=0,cy=0,hraf=0;
      var hloop=function(){ cx+=(tx-cx)*.08; cy+=(ty-cy)*.08; hero.style.setProperty('--px',cx.toFixed(3)); hero.style.setProperty('--py',cy.toFixed(3)); hraf=(Math.abs(tx-cx)>.001||Math.abs(ty-cy)>.001)?requestAnimationFrame(hloop):0; };
      hero.addEventListener('pointermove',function(e){ var r=hero.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-.5)*2; ty=((e.clientY-r.top)/r.height-.5)*2; if(!hraf) hraf=requestAnimationFrame(hloop); });
      hero.addEventListener('pointerleave',function(){ tx=0; ty=0; if(!hraf) hraf=requestAnimationFrame(hloop); });
    }
    $$('[data-magnetic]').forEach(function(el){
      el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect(); el.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*10+'px'); el.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*8+'px'); });
      el.addEventListener('pointerleave',function(){ el.style.setProperty('--mx','0px'); el.style.setProperty('--my','0px'); });
    });

    var cur=$('.cursor'), mx=-100,my=-100,px=-100,py=-100,craf=0;
    if(cur){
      var cloop=function(){ px+=(mx-px)*.18; py+=(my-py)*.18; cur.style.transform='translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0)'; craf=(Math.abs(mx-px)>.2||Math.abs(my-py)>.2)?requestAnimationFrame(cloop):0; };
      window.addEventListener('pointermove',function(e){
        if(e.pointerType!=='mouse') return;
        mx=e.clientX; my=e.clientY; cur.classList.add('is-on');
        var t=e.target.closest ? e.target : null;
        cur.classList.toggle('is-view', !!(t && t.closest('.wcard a')));
        cur.classList.toggle('is-hover', !!(t && t.closest('a,button,.svc,.plan,.quote,.card,input,textarea,label')));
        if(!craf) craf=requestAnimationFrame(cloop);
      },{passive:true});
      document.addEventListener('pointerleave',function(){ cur.classList.remove('is-on'); });
      window.addEventListener('blur',function(){ cur.classList.remove('is-on'); });
    }
  } else { var c0=$('.cursor'); if(c0) c0.remove(); }

  /* Tap or hover the hero card: the bars grow again */
  var introEnds=performance.now()+introMs()+1900;
  function regrow(){ if(reduce||!card||performance.now()<introEnds) return; hero.classList.remove('is-playing'); card.classList.remove('regrow'); void card.offsetWidth; card.classList.add('regrow'); }
  if(card){ card.addEventListener('click',regrow); if(fine) card.addEventListener('pointerenter',regrow); }

  /* ---------- Work rail (mobile): progress + counter ---------- */
  var rail=$('[data-rail]'), thumb=$('[data-rail-thumb]'), count=$('[data-rail-count]');
  if(rail && thumb){
    var cards=$$('.wcard',rail), rt=false;
    var upd=function(){ var max=rail.scrollWidth-rail.clientWidth; var p= max>0 ? rail.scrollLeft/max : 1; thumb.style.transform='scaleX('+(.18+p*.82).toFixed(3)+')';
      if(count && cards.length){ var w=cards[0].offsetWidth+14; var i=Math.min(cards.length, Math.round(rail.scrollLeft/w)+1); count.textContent=i+' / '+cards.length; } rt=false; };
    rail.addEventListener('scroll',function(){ if(!rt){ rt=true; requestAnimationFrame(upd); } },{passive:true});
    upd();
  }

  /* ---------- FAQ: one open at a time, first open by default ---------- */
  $$('[data-accordion]').forEach(function(acc){
    var items=$$('.qa',acc);
    function set(item,open){ item.classList.toggle('is-open',open); var b=$('.qa__btn',item); b.setAttribute('aria-expanded',String(open)); }
    items.forEach(function(item){
      $('.qa__btn',item).addEventListener('click',function(){
        var open=!item.classList.contains('is-open');
        items.forEach(function(o){ set(o, o===item ? open : false); });
      });
    });
  });

  /* ---------- Enquiry form (front end only until it is wired to Formspree/Getform) ---------- */
  var form=$('#enquiry'), done=$('#enquiry-done');
  if(form){
    var rules={
      name:function(v){ return v.trim().length>1; },
      phone:function(v){ return /^[+()\d\s-]{8,}$/.test(v.trim()) && v.replace(/\D/g,'').length>=8; },
      email:function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      need:function(v){ return v.trim().length>2; }
    };
    function check(input){ var ok=rules[input.name](input.value); var f=input.closest('.field'); if(ok){ f.removeAttribute('data-invalid'); input.removeAttribute('aria-invalid'); } else { f.setAttribute('data-invalid',''); input.setAttribute('aria-invalid','true'); } return ok; }
    $$('input,textarea',form).forEach(function(i){ i.addEventListener('blur',function(){ if(i.value) check(i); }); i.addEventListener('input',function(){ if(i.closest('.field').hasAttribute('data-invalid')) check(i); }); });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=$$('input,textarea',form).filter(function(i){ return !check(i); });
      if(bad.length){ bad[0].focus(); return; }
      /* TODO: send the form data to Formspree/Getform here (fetch POST), then show the success state */
      form.hidden=true; done.hidden=false; done.classList.add('is-in');
      var h=$('h3',done); if(h) h.focus({preventScroll:true});
    });
  }

  /* ---------- Preview only: replay the intro ---------- */
  window.usReplay=function(){
    clearTimeout(safety);
    d.classList.remove('intro-skip');
    if(lenis) lenis.scrollTo(0,{immediate:true}); else window.scrollTo(0,0);
    usl.hidden=false; usl.classList.remove('run'); hero.classList.remove('is-playing'); if(card) card.classList.remove('regrow');
    void usl.offsetWidth;
    usl.classList.add('run'); hero.classList.add('is-playing');
    usl.addEventListener('animationend',function h(e){ if(e.target===usl){ endLoader(); usl.removeEventListener('animationend',h); } });
    safety=setTimeout(endLoader,2600);
    introEnds=performance.now()+introMs()+1900;
    loadT=performance.now(); runCounters(introMs()+750);
  };
})();
