/* U Scale | script.js (v3)
   One animation loop drives smooth scroll, pinned scenes, cursor and the bubble trail.
   Everything is progressive: without JS the page is complete; with motion off it simply stops moving. */
(function(){
  'use strict';
  var d=document.documentElement;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var motion=!d.classList.contains('rm');
  var introMs=function(){return parseFloat(getComputedStyle(d).getPropertyValue('--intro'))*1000||0};
  var headerEl=$('.site-header'), headerH=function(){return headerEl?headerEl.offsetHeight:72};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var lerp=function(a,b,t){return a+(b-a)*t};

  /* ---------- Loader: hide once lifted; a safety timer means the page is never blocked ---------- */
  var usl=$('#usl'), safety;
  function endLoader(){ if(usl) usl.hidden=true; }
  if(d.classList.contains('intro-skip')) endLoader();
  else if(usl){ usl.addEventListener('animationend',function(e){ if(e.target===usl) endLoader(); }); safety=setTimeout(endLoader,2600); }

  /* ---------- Smooth scroll (Lenis on desktop pointers; native on touch) ---------- */
  var lenis=null;
  function startLenis(){
    if(lenis||!motion||!fine||!window.Lenis) return;
    try{ lenis=new window.Lenis({lerp:.09,smoothWheel:true,autoRaf:false}); lenis.on('scroll',markScroll); }catch(e){ lenis=null; }
    kick();
  }
  function stopLenis(){ if(lenis){ try{ lenis.destroy(); }catch(e){} lenis=null; } }

  function scrollToY(y,immediate){
    y=Math.max(0,y);
    if(lenis) lenis.scrollTo(y,{duration:immediate?0:1.2,immediate:!!immediate,force:true});
    else window.scrollTo({top:y,behavior:(immediate||!motion)?'auto':'smooth'});
  }
  function scrollToTarget(el){ scrollToY(el ? el.getBoundingClientRect().top + window.scrollY - headerH() - 12 : 0); }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute('href').slice(1);
    var el= id==='top'||id==='' ? null : document.getElementById(id);
    if(id!=='top' && id!=='' && !el) return;
    e.preventDefault();
    if(a.dataset.intent) prefill(a.dataset.intent);
    scrollToTarget(el);
    if(el){ setTimeout(function(){ var f=el.querySelector('h2,h1')||el; if(!f.hasAttribute('tabindex')) f.setAttribute('tabindex','-1'); f.focus({preventScroll:true}); }, motion?900:0); }
    if(history.replaceState) history.replaceState(null,'','#'+(id||'top'));
  });
  function prefill(intent){
    var t=$('#f-need'); if(!t||t.value.trim()) return;
    t.value= intent==='audit' ? "I'd like a free digital audit." : "I'm interested in the "+intent+" plan.";
  }

  /* ---------- Count-ups (hero stats, prices) ---------- */
  var inr=new Intl.NumberFormat('en-IN');
  function countUp(el,to,delay,fmt){
    if(!motion){ el.textContent=fmt?fmt(to):to; return; }
    el.textContent=fmt?fmt(0):'0';
    setTimeout(function(){
      var t0=performance.now(), dur=1300;
      (function step(now){ var p=Math.min(1,(now-t0)/dur), k=1-Math.pow(1-p,4), v=Math.round(to*k); el.textContent=fmt?fmt(v):v; if(p<1) requestAnimationFrame(step); })(t0);
    },delay||0);
  }
  var loadT=performance.now();
  function heroCounters(delay){ $$('[data-count]').forEach(function(el){ countUp(el,+el.dataset.count,delay); }); }
  if('IntersectionObserver' in window){
    var stats=$('.stats');
    if(stats){ var sio=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ sio.disconnect(); heroCounters(Math.max(0,introMs()+750-(performance.now()-loadT))); } },{threshold:.4}); sio.observe(stats); }
    var prices=$$('.plan__price strong');
    var pio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; pio.unobserve(e.target); var n=parseInt(e.target.textContent.replace(/[^\d]/g,''),10); if(n) countUp(e.target,n,0,function(v){ return '₹'+inr.format(v); }); }); },{threshold:.6});
    prices.forEach(function(p){ pio.observe(p); });
  }

  /* ---------- Live Mumbai time ---------- */
  try{
    var fmtT=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false});
    var tick=function(){ var t=fmtT.format(new Date()); $$('[data-ist]').forEach(function(el){ el.textContent=t; }); };
    tick(); setInterval(tick,15000);
  }catch(e){}

  /* ---------- Headings rise word by word; eyebrows type in with a short scramble ---------- */
  $$('[data-split]').forEach(function(h){
    var txt=h.textContent.trim(); h.setAttribute('aria-label',txt);
    h.innerHTML=txt.split(/\s+/).map(function(w,i){ return '<span class="sw" aria-hidden="true"><span class="swi" style="--wi:'+i+'">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span></span>'; }).join(' ');
  });
  var GLYPHS='ABCDEFGHIJKLMNOPQRSTUVWXYZ/·+';
  function scramble(el){
    var final=el.dataset.final||el.textContent; el.dataset.final=final; el.setAttribute('aria-label',final);
    if(!motion){ el.textContent=final; return; }
    var t0=performance.now(), dur=650;
    (function step(now){
      var p=Math.min(1,(now-t0)/dur), n=Math.floor(final.length*p), out=final.slice(0,n);
      for(var i=n;i<final.length;i++) out+= final[i]===' ' ? ' ' : GLYPHS[(Math.random()*GLYPHS.length)|0];
      el.textContent=out; if(p<1) requestAnimationFrame(step); else el.textContent=final;
    })(t0);
  }

  /* ---------- Scroll reveals ---------- */
  $$('[data-reveal-group]').forEach(function(g){ $$('[data-reveal]',g).forEach(function(el,i){ el.style.setProperty('--rd',i%4); }); });
  var revealEls=$$('[data-reveal],[data-split]');
  function revealAll(){ revealEls.forEach(function(el){ el.classList.add('is-in'); }); }
  var rio=null;
  if('IntersectionObserver' in window){
    rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); if(e.target.hasAttribute('data-scramble')) scramble(e.target); rio.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    revealEls.forEach(function(el){ rio.observe(el); });
  } else revealAll();
  $$('.scan').forEach(function(s){ var o=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ s.classList.add('is-in'); o.disconnect(); } }); o.observe(s); });

  /* ---------- Layout: pinned scenes only on roomy desktop screens with motion on ---------- */
  var workPin=$('[data-pin]'), track=$('[data-track]'), cards=$$('.wk'), procPin=$('[data-proc]');
  var nowEl=$('[data-wk-now]'), wkBar=$('.work__bar');
  var pin={on:false,top:0,dist:0}, proc={top:0,len:1};
  function layout(){
    var want= motion && innerWidth>=1024 && innerHeight>=620;
    d.classList.toggle('pin-ok',want); pin.on=want;
    if(want && track && workPin){
      track.style.transform='';
      pin.dist=Math.max(0, track.scrollWidth - innerWidth);
      workPin.style.height=(pin.dist + innerHeight)+'px';
      pin.top=workPin.getBoundingClientRect().top + window.scrollY;
    } else if(workPin){ workPin.style.height=''; if(track) track.style.transform=''; }
    if(procPin){ proc.top=procPin.getBoundingClientRect().top + window.scrollY; proc.len=Math.max(1, procPin.offsetHeight - innerHeight); }
    markScroll();
  }
  /* Keyboard users: focusing a card in the pinned gallery scrolls it into view */
  if(track) track.addEventListener('focusin',function(e){
    if(!pin.on) return; var li=e.target.closest('.wk'); if(!li) return;
    var x=li.offsetLeft - (innerWidth - li.offsetWidth)/2; scrollToY(pin.top + clamp(x,0,pin.dist),true);
  });

  /* ---------- Scroll-driven state ---------- */
  var hero=$('#hero'), heroCta=$('.hero__cta'), waFloat=$('.wa-float'), prog=$('.hdr-progress');
  var darkZones=$$('[data-tone="dark"]'), waZones=$$('[data-wa-zone]'), waVisible=new Set();
  var progressEls=$$('[data-progress]'), panels=$$('.panel'), steps=$$('.step'), lastY=window.scrollY, menuOpen=false, scrollDirty=true;
  if('IntersectionObserver' in window){
    var wio=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?waVisible.add(e.target):waVisible.delete(e.target); }); markScroll(); });
    waZones.forEach(function(z){ wio.observe(z); });
  }
  function markScroll(){ scrollDirty=true; kick(); }
  function setSteps(p,idx){
    steps.forEach(function(s,i){
      var lit=i<=idx; if(lit && !s.classList.contains('is-lit')){ var n=$('.step__num',s); if(n&&motion){ var k=0,t=+n.dataset.n; var iv=setInterval(function(){ k++; n.textContent='0'+Math.min(k,t); if(k>=t) clearInterval(iv); },60); } }
      s.classList.toggle('is-lit',lit); s.classList.toggle('is-now',i===idx);
    });
  }
  function onScroll(){
    var y=window.scrollY, vh=innerHeight, docH=d.scrollHeight, hh=headerH();
    headerEl.classList.toggle('is-scrolled',y>8);
    var probe=hh*.5, dark=false;
    for(var i=0;i<darkZones.length;i++){ var r=darkZones[i].getBoundingClientRect(); if(r.top<=probe&&r.bottom>=probe){ dark=true; break; } }
    headerEl.classList.toggle('is-dark',dark&&y>8);
    if(!menuOpen){
      if(y>lastY+6 && y>vh*.5) headerEl.classList.add('is-hidden');
      else if(y<lastY-6 || y<vh*.5) headerEl.classList.remove('is-hidden');
    }
    if(prog) prog.style.setProperty('--sp',(y/Math.max(1,docH-vh)).toFixed(4));
    if(waFloat&&heroCta) waFloat.classList.toggle('is-visible', heroCta.getBoundingClientRect().bottom<0 && waVisible.size===0);
    if(motion){
      if(hero) hero.style.setProperty('--sy',Math.min(y,1200).toFixed(0));
      /* work gallery */
      if(pin.on && track){
        var p=clamp((y-pin.top)/Math.max(1,pin.dist),0,1);
        track.style.transform='translate3d('+(-p*pin.dist).toFixed(1)+'px,0,0)';
        if(wkBar) wkBar.style.setProperty('--wp',p.toFixed(4));
        if(nowEl){ var n=Math.min(cards.length, Math.round(p*(cards.length-1))+1); nowEl.textContent=(n<10?'0':'')+n; }
      }
      /* process */
      if(steps.length){
        var sp, idx;
        if(pin.on && procPin){ sp=clamp((y-proc.top)/proc.len,0,1); idx=Math.min(steps.length-1,Math.floor(sp*steps.length*0.999)); }
        else { var sr=steps[0].parentNode.getBoundingClientRect(); sp=clamp((vh*.85-sr.top)/(vh*.85-vh*.35+sr.height*.6),0,1); idx=Math.floor(sp*(steps.length-1)+.02); }
        steps[0].parentNode.style.setProperty('--p',(pin.on?Math.min(1,sp*1.15):sp).toFixed(3)); setSteps(sp,idx);
      }
      progressEls.forEach(function(el){
        var k=el.dataset.progress, r=el.getBoundingClientRect(), p;
        if(k==='steps') return;
        if(k==='foot') p=clamp(1-(docH-(y+vh))/(vh*.6),0,1);
        else if(k==='cta') p=clamp((vh-r.top)/(vh-vh*.25),0,1);
        else p=clamp((vh*.85-r.top)/(vh*.65),0,1);
        el.style.setProperty('--p',p.toFixed(3));
      });
      panels.forEach(function(el){ var r=el.getBoundingClientRect(); el.style.setProperty('--pp',clamp((vh-r.top)/(vh*.55),0,1).toFixed(3)); });
    } else { setSteps(1,steps.length-1); }
    lastY=y; scrollDirty=false;
  }
  window.addEventListener('scroll',markScroll,{passive:true});
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ layout(); sizeCanvas(); },120); });

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
    menuOpen=open; btn.setAttribute('aria-expanded',String(open));
    btn.querySelector('.sr-only').textContent= open?'Close menu':'Menu';
    d.classList.toggle('menu-open',open); menu.classList.toggle('is-open',open);
    main.inert=open; if(footer) footer.inert=open; if(waFloat) waFloat.inert=open;
    if(lenis){ open?lenis.stop():lenis.start(); }
    if(open){ headerEl.classList.remove('is-hidden'); setTimeout(function(){ var f=$('a',menu); if(f) f.focus({preventScroll:true}); },motion?250:0); }
  }
  if(btn){
    btn.addEventListener('click',function(){ setMenu(!menuOpen); });
    menu.addEventListener('click',function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown',function(e){
      if(!menuOpen) return;
      if(e.key==='Escape'){ setMenu(false); btn.focus(); }
      if(e.key==='Tab'){ var f=focusables(), i=f.indexOf(document.activeElement);
        if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); } }
    });
    matchMedia('(min-width:1024px)').addEventListener('change',function(m){ if(m.matches&&menuOpen) setMenu(false); });
  }

  /* ---------- Desktop pointer layer: spotlight, depth, glows, tilt, magnets, cursor ---------- */
  var ptr={x:-200,y:-200,cx:-200,cy:-200,on:false}, heroT={x:0,y:0,cx:0,cy:0}, spot={x:0,y:0,cx:0,cy:0};
  var cur=$('.cursor'), ppv=$('.ppv'), ppvImg=ppv?$('img',ppv):null, ppvOn=false, ppvP={x:0,y:0,cx:0,cy:0};
  function pointerLayer(){
    if(!fine) { if(cur) cur.remove(); return; }
    window.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse'||!motion) return;
      var dx=e.clientX-ptr.x, dy=e.clientY-ptr.y; ptr.x=e.clientX; ptr.y=e.clientY;
      if(!ptr.on){ ptr.cx=ptr.x; ptr.cy=ptr.y; ptr.on=true; cur.classList.add('is-on'); }
      var t=e.target;
      cur.classList.toggle('is-view',!!(t.closest&&t.closest('.wk')));
      cur.classList.toggle('is-hover',!!(t.closest&&t.closest('a,button,.svc,.plan,.quote,.card,input,textarea,label,.lw__cell')));
      spawn(e.clientX,e.clientY,Math.hypot(dx,dy));
      if(ppvOn){ ppvP.x=e.clientX; ppvP.y=e.clientY; }
      kick();
    },{passive:true});
    document.addEventListener('pointerleave',function(){ ptr.on=false; cur.classList.remove('is-on'); });
    window.addEventListener('blur',function(){ ptr.on=false; cur.classList.remove('is-on'); });
    window.addEventListener('pointerdown',function(e){ if(!motion||e.pointerType!=='mouse') return; cur.classList.add('is-down'); burst(e.clientX,e.clientY); });
    window.addEventListener('pointerup',function(){ cur.classList.remove('is-down'); });
    if(hero){
      hero.addEventListener('pointermove',function(e){ if(!motion) return; var r=hero.getBoundingClientRect(); heroT.x=((e.clientX-r.left)/r.width-.5)*2; heroT.y=((e.clientY-r.top)/r.height-.5)*2; spot.x=e.clientX-r.left; spot.y=e.clientY-r.top; hero.classList.add('is-lit'); kick(); });
      hero.addEventListener('pointerleave',function(){ heroT.x=0; heroT.y=0; hero.classList.remove('is-lit'); kick(); });
    }
    var bento=$('.bento');
    if(bento) bento.addEventListener('pointermove',function(e){ var c=e.target.closest('.svc'); if(!c||!motion) return; var r=c.getBoundingClientRect(); c.style.setProperty('--gx',(e.clientX-r.left)+'px'); c.style.setProperty('--gy',(e.clientY-r.top)+'px'); });
    $$('.plan').forEach(function(p){
      p.addEventListener('pointermove',function(e){ if(!motion) return; var r=p.getBoundingClientRect(); p.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*6).toFixed(2)+'deg'); p.style.setProperty('--rx',(-((e.clientY-r.top)/r.height-.5)*5).toFixed(2)+'deg'); });
      p.addEventListener('pointerleave',function(){ p.style.setProperty('--rx','0deg'); p.style.setProperty('--ry','0deg'); });
    });
    $$('[data-magnetic]').forEach(function(el){
      el.addEventListener('pointermove',function(e){ if(!motion) return; var r=el.getBoundingClientRect(); el.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*10+'px'); el.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*8+'px'); });
      el.addEventListener('pointerleave',function(){ el.style.setProperty('--mx','0px'); el.style.setProperty('--my','0px'); });
    });
    /* Project index: a floating screenshot follows the cursor */
    $$('.pidx a').forEach(function(a){
      a.addEventListener('pointerenter',function(e){ if(!motion||!ppv) return; if(ppvImg.getAttribute('src')!==a.dataset.peek) ppvImg.src=a.dataset.peek; ppvOn=true; ppvP.x=ppvP.cx=e.clientX; ppvP.y=ppvP.cy=e.clientY; ppv.classList.add('is-on'); kick(); });
      a.addEventListener('pointerleave',function(){ ppvOn=false; if(ppv) ppv.classList.remove('is-on'); });
    });
  }

  /* ---------- Bubble trail (one canvas, pooled particles, sleeps when idle) ---------- */
  var cvs=$('.bubbles'), ctx=cvs&&cvs.getContext?cvs.getContext('2d'):null, dpr=1, parts=[], MAXP=90;
  var LAV=[201,188,232], GRN=[99,184,73];
  function sizeCanvas(){ if(!ctx) return; dpr=Math.min(2,window.devicePixelRatio||1); cvs.width=innerWidth*dpr; cvs.height=innerHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function addP(x,y,vx,vy,r,life){
    if(parts.length>=MAXP) parts.shift();
    parts.push({x:x,y:y,vx:vx,vy:vy,r:r,t:0,life:life,w:Math.random()*6.28,c:Math.random()<.18?GRN:LAV});
  }
  function spawn(x,y,speed){
    if(!ctx||!motion||!fine) return;
    var n=Math.min(3,Math.floor(speed/14)); if(Math.random()<speed/40) n++;
    for(var i=0;i<n;i++) addP(x+(Math.random()-.5)*8,y+(Math.random()-.5)*8,(Math.random()-.5)*.5,-(.25+Math.random()*.7),1+Math.random()*2.5,600+Math.random()*250);
  }
  function burst(x,y){
    if(!ctx) return;
    for(var i=0;i<12;i++){ var a=i/12*6.283, s=1.2+Math.random()*1.4; addP(x,y,Math.cos(a)*s,Math.sin(a)*s-.4,1.4+Math.random()*2.6,650+Math.random()*250); }
    kick();
  }
  function drawParts(dt){
    if(!ctx) return false;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=parts.length-1;i>=0;i--){
      var p=parts[i]; p.t+=dt; if(p.t>=p.life){ parts.splice(i,1); continue; }
      var k=p.t/p.life, a=1-k*k; p.w+=.12; p.x+=p.vx+Math.sin(p.w)*.25; p.y+=p.vy; p.vx*=.98; p.vy*=.99;
      var r=p.r*(1-k*.45), c=p.c;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.2832);
      ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(.16*a).toFixed(3)+')'; ctx.fill();
      ctx.lineWidth=1; ctx.strokeStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(.75*a).toFixed(3)+')'; ctx.stroke();
      if(r>1.6){ ctx.beginPath(); ctx.arc(p.x-r*.35,p.y-r*.38,r*.26,0,6.2832); ctx.fillStyle='rgba(255,255,255,'+(.7*a).toFixed(3)+')'; ctx.fill(); }
    }
    return parts.length>0;
  }
  document.addEventListener('visibilitychange',function(){ if(document.hidden){ parts.length=0; if(ctx) ctx.clearRect(0,0,innerWidth,innerHeight); } });

  /* ---------- The one loop ---------- */
  var running=false, lastT=0;
  function kick(){ if(!running){ running=true; lastT=performance.now(); requestAnimationFrame(frame); } }
  function frame(t){
    var dt=Math.min(48,t-lastT); lastT=t; var busy=false;
    if(lenis){ lenis.raf(t); busy=true; }
    if(scrollDirty) onScroll();
    if(motion&&fine){
      if(cur&&ptr.on){ ptr.cx=lerp(ptr.cx,ptr.x,.2); ptr.cy=lerp(ptr.cy,ptr.y,.2); cur.style.transform='translate3d('+ptr.cx.toFixed(1)+'px,'+ptr.cy.toFixed(1)+'px,0)'; if(Math.abs(ptr.x-ptr.cx)+Math.abs(ptr.y-ptr.cy)>.3) busy=true; }
      if(hero){ heroT.cx=lerp(heroT.cx,heroT.x,.08); heroT.cy=lerp(heroT.cy,heroT.y,.08); spot.cx=lerp(spot.cx,spot.x,.14); spot.cy=lerp(spot.cy,spot.y,.14);
        hero.style.setProperty('--px',heroT.cx.toFixed(3)); hero.style.setProperty('--py',heroT.cy.toFixed(3)); hero.style.setProperty('--hx',spot.cx.toFixed(1)+'px'); hero.style.setProperty('--hy',spot.cy.toFixed(1)+'px');
        if(Math.abs(heroT.x-heroT.cx)+Math.abs(heroT.y-heroT.cy)>.002||Math.abs(spot.x-spot.cx)+Math.abs(spot.y-spot.cy)>.5) busy=true; }
      if(ppv&&ppvOn){ ppvP.cx=lerp(ppvP.cx,ppvP.x,.16); ppvP.cy=lerp(ppvP.cy,ppvP.y,.16); ppv.style.transform='translate3d('+(ppvP.cx+24).toFixed(1)+'px,'+(ppvP.cy-90).toFixed(1)+'px,0) rotate(-3deg)'; busy=true; }
      if(drawParts(dt)) busy=true;
    }
    if(busy||scrollDirty) requestAnimationFrame(frame); else running=false;
  }

  /* ---------- Hero card: tap or hover makes the bars grow again ---------- */
  var card=$('#hero-card'), introEnds=performance.now()+introMs()+1900;
  function regrow(){ if(!motion||!card||performance.now()<introEnds) return; hero.classList.remove('is-playing'); card.classList.remove('regrow'); void card.offsetWidth; card.classList.add('regrow'); }
  if(card){ card.addEventListener('click',regrow); if(fine) card.addEventListener('pointerenter',regrow); }

  /* ---------- Mobile work rail: progress, counter, one-time screenshot scroll ---------- */
  var rail=$('[data-rail]'), thumb=$('[data-rail-thumb]'), count=$('[data-rail-count]');
  if(rail&&thumb){
    var rq=false, upd=function(){ var max=rail.scrollWidth-rail.clientWidth; var p=max>0?rail.scrollLeft/max:1; thumb.style.transform='scaleX('+(.12+p*.88).toFixed(3)+')';
      if(count&&cards.length){ var w=cards[0].offsetWidth+14, i=Math.min(cards.length,Math.round(rail.scrollLeft/w)+1); count.textContent=i+' / '+cards.length; } rq=false; };
    rail.addEventListener('scroll',function(){ if(!rq){ rq=true; requestAnimationFrame(upd); } },{passive:true}); upd();
  }
  if(!fine && 'IntersectionObserver' in window){
    var kio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting&&motion&&!pin.on){ e.target.classList.add('peek'); kio.unobserve(e.target); } }); },{threshold:.7});
    cards.forEach(function(c){ kio.observe(c); });
  }

  /* ---------- FAQ: one open at a time, first open by default ---------- */
  $$('[data-accordion]').forEach(function(acc){
    var items=$$('.qa',acc);
    items.forEach(function(item){
      $('.qa__btn',item).addEventListener('click',function(){
        var open=!item.classList.contains('is-open');
        items.forEach(function(o){ var on= o===item ? open : false; o.classList.toggle('is-open',on); $('.qa__btn',o).setAttribute('aria-expanded',String(on)); });
        setTimeout(layout,520);
      });
    });
  });

  /* ---------- Enquiry form: emails uscalewithus@gmail.com via FormSubmit (AJAX), WhatsApp fallback ---------- */
  var FORM_ENDPOINT='https://formsubmit.co/ajax/uscalewithus@gmail.com';
  var form=$('#enquiry'), done=$('#enquiry-done');
  if(form){
    var rules={ name:function(v){ return v.trim().length>1; }, phone:function(v){ return /^[+()\d\s-]{8,}$/.test(v.trim())&&v.replace(/\D/g,'').length>=8; }, email:function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, need:function(v){ return v.trim().length>2; } };
    var check=function(i){ var ok=rules[i.name](i.value), f=i.closest('.field'); if(ok){ f.removeAttribute('data-invalid'); i.removeAttribute('aria-invalid'); } else { f.setAttribute('data-invalid',''); i.setAttribute('aria-invalid','true'); } return ok; };
    $$('input:not(.hp),textarea',form).forEach(function(i){ i.addEventListener('blur',function(){ if(i.value) check(i); }); i.addEventListener('input',function(){ if(i.closest('.field').hasAttribute('data-invalid')) check(i); }); });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=$$('input:not(.hp),textarea',form).filter(function(i){ return !check(i); });
      if(bad.length){ bad[0].focus(); return; }
      var fd=new FormData(form); if(fd.get('_honey')) return;
      var btn=$('button[type=submit]',form), lbl=btn.innerHTML; btn.disabled=true; btn.setAttribute('aria-busy','true'); btn.firstChild.textContent='Sending… ';
      var data={name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),message:fd.get('need'),_subject:'New enquiry from '+fd.get('name')+' (uscale site)',_replyto:fd.get('email'),_template:'table',_captcha:'false'};
      var show=function(ok){
        btn.disabled=false; btn.removeAttribute('aria-busy'); btn.innerHTML=lbl;
        var h=$('h3',done), wa=$('a',done);
        if(!ok){
          var txt='Hi U Scale, I\'m '+data.name+' ('+data.phone+', '+data.email+'). '+data.message;
          if(wa) wa.href='https://wa.me/917977360142?text='+encodeURIComponent(txt);
          if(h) h.textContent='Our inbox didn\'t answer just now. Tap below to send the same message on WhatsApp.';
        }
        form.hidden=true; done.hidden=false; done.classList.add('is-in');
        if(h) h.focus({preventScroll:true});
        var r=done.getBoundingClientRect(); if(ok&&motion&&fine) burst(r.left+48,r.top+40);
        setTimeout(layout,50);
      };
      var ctl=('AbortController' in window)?new AbortController():null, to=setTimeout(function(){ if(ctl) ctl.abort(); },15000);
      fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data),signal:ctl?ctl.signal:undefined})
        .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return r.ok&&String(j.success)!=='false'; }); })
        .catch(function(){ return false; })
        .then(function(ok){ clearTimeout(to); show(ok); });
    });
  }

  /* ---------- Motion toggle ---------- */
  var toggles=$$('[data-motion-toggle]');
  function paintToggles(){ toggles.forEach(function(b){ b.setAttribute('aria-pressed',String(motion)); $('span',b).textContent= motion?'Motion on':'Motion off'; }); }
  function setMotion(on){
    motion=on; d.classList.toggle('rm',!on);
    try{ localStorage.setItem('us-motion',on?'on':'off'); }catch(e){}
    paintToggles();
    if(!on){ stopLenis(); revealAll(); parts.length=0; if(ctx) ctx.clearRect(0,0,innerWidth,innerHeight); if(cur) cur.classList.remove('is-on'); if(ppv) ppv.classList.remove('is-on');
      $$('[data-progress],.panel').forEach(function(el){ el.style.removeProperty('--p'); el.style.removeProperty('--pp'); });
      $$('[data-scramble]').forEach(function(el){ if(el.dataset.final) el.textContent=el.dataset.final; }); }
    else startLenis();
    layout();
  }
  toggles.forEach(function(b){ b.addEventListener('click',function(){ setMotion(!motion); }); });
  paintToggles();

  /* ---------- Start ---------- */
  sizeCanvas(); pointerLayer(); startLenis();
  if(!motion) revealAll();
  layout();
  window.addEventListener('load',layout);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(layout);
  $$('img').forEach(function(im){ if(!im.complete) im.addEventListener('load',function(){ if(im.closest('[data-track]')) layout(); },{once:true}); });

  /* ---------- Preview only: replay the intro ---------- */
  window.usReplay=function(){
    clearTimeout(safety); d.classList.remove('intro-skip'); scrollToY(0,true);
    usl.hidden=false; usl.classList.remove('run'); hero.classList.remove('is-playing'); if(card) card.classList.remove('regrow');
    void usl.offsetWidth; usl.classList.add('run'); hero.classList.add('is-playing');
    usl.addEventListener('animationend',function h(e){ if(e.target===usl){ endLoader(); usl.removeEventListener('animationend',h); } });
    safety=setTimeout(endLoader,2600); introEnds=performance.now()+introMs()+1900;
    loadT=performance.now(); heroCounters(introMs()+750);
  };
})();
