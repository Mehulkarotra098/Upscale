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
    rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){
      var el=e.target, grp=el.closest('.sec-head,.quotes,.work__track');
      el.classList.add('is-in'); if(el.hasAttribute('data-scramble')) scramble(el); rio.unobserve(el);
      if(grp) $$('[data-reveal],[data-split]',grp).forEach(function(x){ if(!x.classList.contains('is-in')){ x.classList.add('is-in'); if(x.hasAttribute('data-scramble')) scramble(x); rio.unobserve(x); } });
    } }); },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    revealEls.forEach(function(el){ rio.observe(el); });
  } else revealAll();
  if(d.classList.contains('agent')) revealAll();
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
      fitCards();
      pin.dist=Math.max(0, track.scrollWidth - innerWidth);
      workPin.style.height=(pin.dist + innerHeight)+'px';
      pin.top=workPin.getBoundingClientRect().top + window.scrollY;
    } else if(workPin){ workPin.style.height=''; if(track){ track.style.transform=''; track.style.removeProperty('--cwj'); } }
    if(procPin){ proc.top=procPin.getBoundingClientRect().top + window.scrollY; proc.len=Math.max(1, procPin.offsetHeight - innerHeight); }
    markScroll();
  }
  /* Size the pinned cards from the real screen height, so every card (and the space under it) always fits */
  function fitCards(){
    if(!cards.length) return;
    var sticky=$('.work__sticky'), head=$('.work__head'), links=$$('.wk__a',track);
    var padTop=parseFloat(getComputedStyle(sticky).paddingTop)||0, headH=head.offsetHeight+(parseFloat(getComputedStyle(head).marginBottom)||0);
    var gap=Math.max(26,innerHeight*.04), budget=innerHeight-padTop-2*gap-headH;
    var maxW=Math.min(innerWidth*.44,720), minW=Math.min(300,maxW), cw=minW;
    var tallest=function(){ var m=0; links.forEach(function(a){ m=Math.max(m,a.offsetHeight); }); return m; };
    var best=minW, bestH=1e9, found=false;
    for(var w=Math.round(maxW); w>=minW; w-=16){
      track.style.setProperty('--cwj',w+'px');
      var th=tallest(); if(th<=budget){ cw=w; found=true; break; } if(th<bestH){ bestH=th; best=w; }
    }
    if(!found) cw=best;
    track.style.setProperty('--cwj',Math.round(cw)+'px');
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
  var sprog=$('.sprog'), sprogLbl=$('[data-sprog-label]'), sprogT;
  var SPROG=[['hero','Home'],['services','Services'],['work','Work'],['how','How it works'],['pricing','Pricing'],['testimonials','Clients'],['about','About'],['tools','Free tools'],['faq','FAQ'],['contact','Free audit']].map(function(x){ return [document.getElementById(x[0]),x[1]]; });
  if(!SPROG[0][0]){ SPROG=$$('main > section, main > .hero-shell').map(function(sec){ var ey=$('.eyebrow,.crumbs [aria-current]',sec), h=$('h1,h2',sec); var t=(ey&&(ey.dataset.final||ey.textContent)||h&&(h.getAttribute('aria-label')||h.textContent)||'').trim(); return [sec,t.length>22?t.slice(0,21)+'…':t]; }).filter(function(x){ return x[1]; }); if(!SPROG.length) SPROG=[[null,'']]; }
  SPROG=SPROG.filter(function(x){ return x[0]; });
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
    if(sprog){
      var sp2=clamp(y/Math.max(1,docH-vh),0,1); sprog.style.setProperty('--sp',sp2.toFixed(4)); sprog.classList.toggle('is-on',y>40&&!menuOpen);
      var lbl=SPROG[0][1]; for(var si=0;si<SPROG.length;si++){ if(SPROG[si][0]&&SPROG[si][0].getBoundingClientRect().top<vh*.45) lbl=SPROG[si][1]; }
      if(sprogLbl.textContent!==lbl) sprogLbl.textContent=lbl;
      var sr0=sprog.getBoundingClientRect(), hy=sr0.top+sp2*sr0.height, onDark=false;
      for(var di=0;di<darkZones.length;di++){ var dz=darkZones[di].getBoundingClientRect(); if(dz.top<=hy&&dz.bottom>=hy&&dz.right>=sr0.left){ onDark=true; break; } }
      sprog.classList.toggle('on-dark',onDark);
      if(Math.abs(y-lastY)>1){ sprog.classList.add('is-active'); clearTimeout(sprogT); sprogT=setTimeout(function(){ sprog.classList.remove('is-active'); },1000); }
    }
    /* WhatsApp button: out of the way while reading down (like the header), back on the way up */
    if(waFloat&&heroCta) waFloat.classList.toggle('is-visible', heroCta.getBoundingClientRect().bottom<0 && waVisible.size===0 && !headerEl.classList.contains('is-hidden'));
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
      if(!ptr.on){ ptr.cx=ptr.x; ptr.cy=ptr.y; ptr.on=true; cur&&cur.classList.add('is-on'); }
      var t=e.target;
      cur&&cur.classList.toggle('is-view',!!(t.closest&&t.closest('.wk')));
      cur&&cur.classList.toggle('is-hover',!!(t.closest&&t.closest('a,button,.svc,.plan,.quote,input,textarea,label,.lw__cell')));
      spawn(e.clientX,e.clientY,Math.hypot(dx,dy));
      if(ppvOn){ ppvP.x=e.clientX; ppvP.y=e.clientY; }
      kick();
    },{passive:true});
    document.addEventListener('pointerleave',function(){ ptr.on=false; cur&&cur.classList.remove('is-on'); });
    window.addEventListener('blur',function(){ ptr.on=false; cur&&cur.classList.remove('is-on'); });
    window.addEventListener('pointerdown',function(e){ if(!motion||e.pointerType!=='mouse') return; cur&&cur.classList.add('is-down'); burst(e.clientX,e.clientY); });
    window.addEventListener('pointerup',function(){ cur&&cur.classList.remove('is-down'); });
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
    if(!ctx||!motion) return;
    var n=Math.min(3,Math.floor(speed/14)); if(Math.random()<speed/40) n++;
    var rs=fine?1:1.7; for(var i=0;i<n;i++) addP(x+(Math.random()-.5)*8,y+(Math.random()-.5)*8,(Math.random()-.5)*.5,-(.25+Math.random()*.7),(1+Math.random()*2.5)*rs,600+Math.random()*250);
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
    cvs.dataset.dirty='1'; return parts.length>0;
  }
  document.addEventListener('visibilitychange',function(){ if(document.hidden){ parts.length=0; if(ctx) ctx.clearRect(0,0,innerWidth,innerHeight); } });

  /* Touch screens: the bubble trail follows your finger, and a tap pops a small burst */
  if(!fine&&ctx){
    var tLast=null;
    window.addEventListener('touchstart',function(e){ if(!motion) return; var t=e.touches[0]; tLast={x:t.clientX,y:t.clientY}; burst(t.clientX,t.clientY); },{passive:true});
    window.addEventListener('touchmove',function(e){ if(!motion||!tLast) return; var t=e.touches[0], sp=Math.hypot(t.clientX-tLast.x,t.clientY-tLast.y); tLast={x:t.clientX,y:t.clientY}; spawn(t.clientX,t.clientY,Math.min(sp,40)); kick(); },{passive:true});
    window.addEventListener('touchend',function(){ tLast=null; },{passive:true});
  }
  /* ---------- The one loop ---------- */
  var running=false, lastT=0;
  function kick(){ if(!running){ running=true; lastT=performance.now(); requestAnimationFrame(frame); } }
  function frame(t){
    var dt=Math.max(0,Math.min(48,t-lastT)); lastT=t; var busy=false;
    if(lenis){ lenis.raf(t); busy=true; }
    if(scrollDirty) onScroll();
    if(gsMoving){ if(gsStep(dt)) busy=true; else gsMoving=false; }
    if(gsLive){ if(motion&&heroVis&&!document.hidden&&gs.classList.contains('is-ready')){ gsLive(dt); busy=true; } else if(gs.classList.contains('is-live')) gsSleep(); }
    if(motion&&fine){
      if(cur&&ptr.on){ ptr.cx=lerp(ptr.cx,ptr.x,.2); ptr.cy=lerp(ptr.cy,ptr.y,.2); cur.style.transform='translate3d('+ptr.cx.toFixed(1)+'px,'+ptr.cy.toFixed(1)+'px,0)'; if(Math.abs(ptr.x-ptr.cx)+Math.abs(ptr.y-ptr.cy)>.3) busy=true; }
      if(hero){ heroT.cx=lerp(heroT.cx,heroT.x,.08); heroT.cy=lerp(heroT.cy,heroT.y,.08); spot.cx=lerp(spot.cx,spot.x,.14); spot.cy=lerp(spot.cy,spot.y,.14);
        hero.style.setProperty('--px',heroT.cx.toFixed(3)); hero.style.setProperty('--py',heroT.cy.toFixed(3)); hero.style.setProperty('--hx',spot.cx.toFixed(1)+'px'); hero.style.setProperty('--hy',spot.cy.toFixed(1)+'px');
        if(Math.abs(heroT.x-heroT.cx)+Math.abs(heroT.y-heroT.cy)>.002||Math.abs(spot.x-spot.cx)+Math.abs(spot.y-spot.cy)>.5) busy=true; }
      if(ppv&&ppvOn){ ppvP.cx=lerp(ppvP.cx,ppvP.x,.16); ppvP.cy=lerp(ppvP.cy,ppvP.y,.16); ppv.style.transform='translate3d('+(ppvP.cx+24).toFixed(1)+'px,'+(ppvP.cy-90).toFixed(1)+'px,0) rotate(-3deg)'; busy=true; }
    }
    if(motion&&parts.length&&drawParts(dt)) busy=true; else if(ctx&&!parts.length&&cvs.dataset.dirty){ ctx.clearRect(0,0,innerWidth,innerHeight); delete cvs.dataset.dirty; }
    if(busy||scrollDirty) requestAnimationFrame(frame); else running=false;
  }

  /* ---------- Hero growth stack: five channels stack into one rising curve ----------
     Builds itself after the intro, then every chip switches its layer on or off (springy, one rAF loop). */
  var gs=$('[data-growth]'), GK=['web','seo','social','ads','ai'], gsMoving=false, gsTimers=[], gsBuilding=false, gsTouched=false, gsLive=null, gsSleep=null, heroVis=true;
  var GF={
    web:function(t){ return .12+.16*t; },
    seo:function(t){ return .36*Math.pow(t,2.2); },
    social:function(t){ return .17*(1-Math.exp(-3*t))/(1-Math.exp(-3)); },
    ads:function(t){ return .13*(1-Math.exp(-14*t))+.02*t; },
    ai:function(t){ var s=clamp((t-.25)/.75,0,1); return .17*s*s*(3-2*s); }
  };
  var GTIP={web:'Website: the base everything stands on.',seo:'SEO: slow start, then it compounds.',social:'Social: steady trust, week after week.',ads:'Ads: in front of buyers from day one.',ai:'AI search: named when people ask AI.'};
  var GSTAT=['Invisible','Online','Findable','Noticed','Trusted','Chosen'];
  var gW={}, gV={}, gT={}, gEl={}, gChip={};
  if(gs){
    var gLine=$('[data-gs-line]',gs), gEnd=$('[data-gs-dot]',gs), gN=$('[data-gs-n]',gs), gStat=$('[data-gs-status]',gs), gTip=$('[data-gs-tip]',gs), gStatBox=gStat.parentNode;
    var GN=40, GX0=4, GX1=384, GYB=196, GH=184, GMAX=1.2, gy=function(v){ return (GYB-GH*v/GMAX).toFixed(1); };
    GK.forEach(function(k){ gW[k]=1; gV[k]=0; gT[k]=1; gEl[k]=$('[data-gs-layer="'+k+'"]',gs); gChip[k]=$('.gs__chip[data-k="'+k+'"]',gs); });
    var gFlow=$('[data-gs-flow]',gs), gComet=$('[data-gs-comet]',gs), gTop=[], gClock=0, gLive=false;
    var gsDraw=function(){
      var low=[], up, j, x=[], d, k, i, A=gLive?.05:0;
      for(j=0;j<=GN;j++){ low.push(0); x.push((GX0+(GX1-GX0)*j/GN).toFixed(1)); }
      for(i=0;i<GK.length;i++){
        k=GK[i]; up=[]; for(j=0;j<=GN;j++) up.push(low[j]+Math.max(0,gW[k])*GF[k](j/GN)*(1+A*Math.sin(gClock*.0017+j*.32+i*1.4)*(j/GN)));
        d='M'; for(j=0;j<=GN;j++) d+=(j?' L':'')+x[j]+','+gy(up[j]);
        for(j=GN;j>=0;j--) d+=' L'+x[j]+','+gy(low[j]);
        gEl[k].setAttribute('d',d+'Z'); low=up;
      }
      d='M'; for(j=0;j<=GN;j++) d+=(j?' L':'')+x[j]+','+gy(low[j]);
      gLine.setAttribute('d',d); if(gFlow) gFlow.setAttribute('d',d); gEnd.setAttribute('transform','translate('+x[GN]+' '+gy(low[GN])+')'); gTop=low;
    };
    var gsComet=function(){
      if(!gComet||!gTop.length) return;
      var u=(gClock%2600)/2600, f=u*GN, j=Math.min(GN-1,Math.floor(f)), r=f-j, v=gTop[j]+(gTop[j+1]-gTop[j])*r;
      gComet.setAttribute('transform','translate('+(GX0+(GX1-GX0)*f/GN).toFixed(1)+' '+gy(v)+')'); gComet.style.opacity=Math.sin(Math.PI*u).toFixed(2);
    };
    var gsStep=function(dt){
      var f=Math.min(3,dt/16.67), moving=false;
      GK.forEach(function(k){ gV[k]=gV[k]*Math.pow(.8,f)+(gT[k]-gW[k])*.11*f; gW[k]+=gV[k]*f; if(Math.abs(gT[k]-gW[k])>.002||Math.abs(gV[k])>.002) moving=true; else { gW[k]=gT[k]; gV[k]=0; } });
      gsDraw(); return moving;
    };
    var gsCount=function(){ var n=0; GK.forEach(function(k){ if(gT[k]) n++; }); return n; };
    var gsStatus=function(){
      var n=gsCount(); gN.textContent=n;
      if(gStat.textContent!==GSTAT[n]){ gStat.textContent=GSTAT[n]; if(motion){ gStatBox.classList.remove('is-swap'); void gStatBox.offsetWidth; gStatBox.classList.add('is-swap'); } }
    };
    var gsSet=function(k,on,quiet){
      gT[k]=on?1:0; gChip[k].setAttribute('aria-pressed',String(on)); gsStatus();
      if(!quiet) gTip.textContent= on ? GTIP[k] : 'Without '+gChip[k].textContent.trim()+', the curve flattens. Switch it back on.';
      if(motion){
        gChip[k].classList.remove('is-pop'); void gChip[k].offsetWidth; gChip[k].classList.add('is-pop');
        if(on){ gs.classList.remove('is-up'); void gs.offsetWidth; gs.classList.add('is-up'); if(fine&&gsTouched){ var r=gChip[k].getBoundingClientRect(); burst(r.left+r.width/2,r.top+r.height/2); } }
        gsMoving=true; kick();
      } else { gW[k]=gT[k]; gsDraw(); }
    };
    var gsBuild=function(delay){
      gsTimers.forEach(clearTimeout); gsTimers=[]; gsBuilding=false; gTip.removeAttribute('aria-live');
      if(!motion){ GK.forEach(function(k){ gW[k]=gT[k]=1; gChip[k].setAttribute('aria-pressed','true'); }); gsDraw(); gsStatus(); gs.classList.add('is-ready'); gTip.setAttribute('aria-live','polite'); return; }
      GK.forEach(function(k){ gW[k]=gT[k]=0; gV[k]=0; gChip[k].setAttribute('aria-pressed','false'); });
      gsDraw(); gsStatus(); gs.classList.add('is-ready'); gTip.textContent='Building your stack…'; gsBuilding=true;
      GK.forEach(function(k,i){ gsTimers.push(setTimeout(function(){ gsSet(k,true); },delay+i*520)); });
      gsTimers.push(setTimeout(function(){ gsBuilding=false; gTip.textContent='Five channels, one plan. Tap any to switch it off.'; gTip.setAttribute('aria-live','polite'); },delay+GK.length*520+900));
    };
    GK.forEach(function(k){
      gChip[k].addEventListener('click',function(){ if(gsBuilding){ GK.forEach(function(q){ if(!gT[q]&&q!==k) gsSet(q,true,true); }); } gsTimers.forEach(clearTimeout); gsTimers=[]; gsBuilding=false; gTip.setAttribute('aria-live','polite'); gsSet(k,!gT[k]); });
      if(fine){
        gChip[k].addEventListener('pointerenter',function(){ gs.setAttribute('data-focus',k); });
        gChip[k].addEventListener('pointerleave',function(){ gs.removeAttribute('data-focus'); });
      }
      gChip[k].addEventListener('focus',function(){ if(gChip[k].matches(':focus-visible')) gs.setAttribute('data-focus',k); });
      gChip[k].addEventListener('blur',function(){ gs.removeAttribute('data-focus'); });
    });
    gsBuild(introMs()+650);
    /* Alive while on screen: breathing layers, a comet on the curve, a demo that switches channels off and back on */
    var gAcc=0; gsLive=function(dt){ gClock+=dt; gLive=true; gs.classList.add('is-live'); gAcc+=dt; if(!fine&&gAcc<32) return; gAcc=0; if(!gsMoving) gsDraw(); gsComet(); };
    gsSleep=function(){ gLive=false; gs.classList.remove('is-live'); };
    var DEMO=['seo','ads','social','ai','web'], demoI=0, demoT=null;
    var demo=function(){
      clearTimeout(demoT);
      demoT=setTimeout(function(){
        if(motion&&heroVis&&!gsBuilding&&!gsTouched&&!document.hidden){
          var k=DEMO[demoI++%DEMO.length]; gsSet(k,false);
          setTimeout(function(){ if(!gsTouched) gsSet(k,true); },1700);
        }
        demo();
      },5200);
    };
    demo();
    GK.forEach(function(k){ gChip[k].addEventListener('pointerdown',function(){ gsTouched=true; }); gChip[k].addEventListener('keydown',function(){ gsTouched=true; }); });
    /* Floating story cards: a search being typed that finds you, and an enquiry arriving */
    var hfS=$('.hf--search'), hfQ=$('[data-hf-q]'), hfT=$('.hf--toast');
    var QS=['web designer in mumbai','best cafe near me','skin clinic in andheri','coaching classes thane','bakery in bandra'], qi=0;
    var typeQ=function(){
      if(!hfQ) return;
      if(!motion){ hfQ.textContent=QS[0]; hfS.classList.add('is-found'); return; }
      var q=QS[qi++%QS.length], n=0; hfS.classList.remove('is-found');
      var step=function(){
        if(!heroVis||document.hidden){ setTimeout(step,600); return; }
        hfQ.textContent=q.slice(0,++n);
        if(n<q.length) setTimeout(step,55+Math.random()*60);
        else { setTimeout(function(){ hfS.classList.add('is-found'); },350); setTimeout(function(){ if(hfT&&motion){ hfT.classList.add('is-in'); setTimeout(function(){ hfT.classList.remove('is-in'); },2600); } },1300); setTimeout(typeQ,4600); }
      };
      hfQ.textContent=''; step();
    };
    setTimeout(typeQ,introMs()+1400);
  }

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

  /* ---------- Quote builder (/pricing): live estimate, 20/20/60 split, one-tap WhatsApp ---------- */
  $$('[data-qb]').forEach(function(qb){
    var q=function(sel){ return $(sel,qb); };
    var onceEl=q('[data-qb-once]'), moEl=q('[data-qb-mo]'), once2=q('[data-qb-once2]'), mo2=q('[data-qb-mo2]'), lines=q('[data-qb-lines]'), split=q('[data-qb-split]'), send=q('[data-qb-send]'), dock=q('[data-qb-dock]'), redesign=q('[data-redesign]');
    var fmt=function(n){ return '₹'+inr.format(Math.round(n)); };
    var units=$$('.qb__unit',qb), prev={o:0,m:0};
    units.forEach(function(u){ u.qty=0;
      $('[data-inc]',u).addEventListener('click',function(){ u.qty=Math.min(99,u.qty+1); upd(); });
      $('[data-dec]',u).addEventListener('click',function(){ u.qty=Math.max(0,u.qty-1); upd(); });
    });
    var presets=$$('[data-preset]',qb);
    function unpress(){ presets.forEach(function(b){ b.setAttribute('aria-pressed','false'); }); }
    function clear(){
      $$('input',qb).forEach(function(i){ i.checked = i.type==='radio' ? !i.dataset.name : false; });
      units.forEach(function(u){ u.qty=0; });
    }
    qb.addEventListener('change',function(){ unpress(); upd(); });
    units.forEach(function(u){ $$('button',u).forEach(function(b){ b.addEventListener('click',unpress); }); });
    q('[data-qb-reset]').addEventListener('click',function(){ clear(); unpress(); upd(); });
    presets.forEach(function(b){ b.addEventListener('click',function(){
      var p; try{ p=JSON.parse(b.dataset.preset); }catch(e){ return; }
      clear();
      $$('input[name="qb-web"]',qb).forEach(function(r){ r.checked=(r.dataset.name||'')===(p.web||''); });
      $$('input[type="checkbox"][data-name]',qb).forEach(function(c){ c.checked=p.checks.indexOf(c.dataset.name)>-1; });
      units.forEach(function(u){ u.qty=p.units[u.dataset.name]||0; });
      unpress(); b.setAttribute('aria-pressed','true'); upd();
    }); });
    function bump(el){ if(!motion) return; el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); }
    function upd(){
      var o=0, m=0, fo=false, fm=false, items=[];
      var web=$('input[name="qb-web"]:checked',qb);
      if(web&&web.dataset.name){ var v=+web.dataset.once, rd=redesign&&redesign.checked; if(rd) v*=.7; o+=v; if(web.dataset.from) fo=true;
        items.push([web.dataset.name+(rd?' (redesign)':''),(web.dataset.from?'from ':'')+fmt(v)]); }
      $$('input[type="checkbox"][data-name]',qb).forEach(function(c){
        if(!c.checked) return; var co=+c.dataset.once||0, cm=+c.dataset.mo||0; o+=co; m+=cm; if(c.dataset.from) fm=true;
        var lab=[]; if(cm) lab.push((c.dataset.from?'from ':'')+fmt(cm)+'/mo'); if(co) lab.push(fmt(co)+' setup'); items.push([c.dataset.name,lab.join(' + ')]);
      });
      units.forEach(function(u){ $('output',u).textContent=u.qty; u.classList.toggle('is-on',u.qty>0); if(!u.qty) return;
        var v=u.qty*(+u.dataset.once); o+=v; if(u.dataset.from) fo=true; items.push([u.qty+' × '+u.dataset.name+(u.dataset.per?' (pages)':''),(u.dataset.from?'from ':'')+fmt(v)]); });
      var ot=(fo&&o?'from ':'')+fmt(o), mt=(fm&&m?'from ':'')+fmt(m)+(m?'/mo':'');
      onceEl.innerHTML=(fo&&o?'<em>from</em>':'')+fmt(o); moEl.innerHTML=(fm&&m?'<em>from</em>':'')+fmt(m)+(m?'<span>/mo</span>':''); once2.textContent=ot; mo2.textContent=mt;
      if(o!==prev.o) bump(onceEl); if(m!==prev.m) bump(moEl); prev={o:o,m:m};
      lines.innerHTML = items.length ? items.map(function(it){ return '<li><span>'+it[0].replace(/</g,'&lt;')+'</span><b>'+it[1]+'</b></li>'; }).join('') : '<li class="qb__empty">Nothing picked yet. Start with a website, a monthly service or a single piece of work.</li>';
      split.hidden=!(o>0);
      if(o>0){ q('[data-qb-p1]').textContent=fmt(o*.2); q('[data-qb-p2]').textContent=fmt(o*.2); q('[data-qb-p3]').textContent=fmt(o*.6); }
      dock.classList.toggle('is-on',items.length>0);
      var msg='Hi Mehul, I built a quote on your website:\n'+(items.length?items.map(function(it){ return '- '+it[0]+': '+it[1]; }).join('\n')+'\nEstimate: '+ot+' one-time'+(m?' + '+mt:'')+'.\n':'\n')+"Can we talk about it?";
      send.href='https://wa.me/917977360142?text='+encodeURIComponent(msg);
    }
    upd();
    var rc=q('.qb__receipt'); if(rc&&'IntersectionObserver' in window) new IntersectionObserver(function(es){ dock.classList.toggle('is-near',es[0].isIntersecting); },{threshold:.15}).observe(rc);
  });

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
    /* Only name and a number are required: every extra field costs enquiries. The rest is checked only if filled in. */
    var rules={ name:function(v){ return v.trim().length>1; }, phone:function(v){ return /^[+()\d\s-]{8,}$/.test(v.trim())&&v.replace(/\D/g,'').length>=8; }, email:function(v){ return !v.trim()||/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, link:function(v){ return !v.trim()||v.trim().length>2; }, need:function(v){ return !v.trim()||v.trim().length>1; } };
    var check=function(i){ var ok=rules[i.name](i.value), f=i.closest('.field'); if(ok){ f.removeAttribute('data-invalid'); i.removeAttribute('aria-invalid'); } else { f.setAttribute('data-invalid',''); i.setAttribute('aria-invalid','true'); } return ok; };
    $$('input:not(.hp),textarea',form).forEach(function(i){ i.addEventListener('blur',function(){ if(i.value) check(i); }); i.addEventListener('input',function(){ if(i.closest('.field').hasAttribute('data-invalid')) check(i); }); });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=$$('input:not(.hp),textarea',form).filter(function(i){ return !check(i); });
      if(bad.length){ bad[0].focus(); return; }
      var fd=new FormData(form); if(fd.get('_honey')) return;
      var btn=$('button[type=submit]',form), lbl=btn.innerHTML; btn.disabled=true; btn.setAttribute('aria-busy','true'); btn.firstChild.textContent='Sending… ';
      var data={name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email')||'',website:fd.get('link')||'',message:fd.get('need')||'Free audit',_subject:'Free audit request from '+fd.get('name')+' (uscale site)',_template:'table',_captcha:'false'}; if(data.email) data._replyto=data.email;
      var show=function(ok){
        btn.disabled=false; btn.removeAttribute('aria-busy'); btn.innerHTML=lbl;
        var h=$('h3',done), wa=$('a',done);
        if(!ok){
          var txt='Hi Mehul, I\'m '+data.name+' ('+data.phone+(data.email?', '+data.email:'')+'). '+data.message+(data.website?' My website or Instagram: '+data.website:'');
          if(wa) wa.href='https://wa.me/917977360142?text='+encodeURIComponent(txt);
          if(h) h.textContent='My inbox didn\'t answer just now. Tap below to send the same message on WhatsApp.';
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
      $$('[data-scramble]').forEach(function(el){ if(el.dataset.final) el.textContent=el.dataset.final; });
      if(gs){ var pend=gsBuilding; gsTimers.forEach(clearTimeout); gsTimers=[]; gsBuilding=false; gsMoving=false; GK.forEach(function(k){ if(pend){ gT[k]=1; gChip[k].setAttribute('aria-pressed','true'); } gW[k]=gT[k]; gV[k]=0; }); gsDraw(); gsStatus(); gs.classList.add('is-ready'); } }
    else startLenis();
    layout();
  }
  toggles.forEach(function(b){ b.addEventListener('click',function(){ setMotion(!motion); }); });
  paintToggles();

  if(hero&&'IntersectionObserver' in window){ new IntersectionObserver(function(es){ heroVis=es[0].isIntersecting; if(heroVis) kick(); },{threshold:.05}).observe(hero); }
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) kick(); });
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
    usl.hidden=false; usl.classList.remove('run'); hero.classList.remove('is-playing');
    void usl.offsetWidth; usl.classList.add('run'); hero.classList.add('is-playing');
    usl.addEventListener('animationend',function h(e){ if(e.target===usl){ endLoader(); usl.removeEventListener('animationend',h); } });
    safety=setTimeout(endLoader,2600);
    loadT=performance.now(); heroCounters(introMs()+750); if(gs) gsBuild(introMs()+650);
  };
  /* Live mini scenes: play only while on screen, so off-screen loops cost nothing */
  var lives=$$('[data-live]');
  if(lives.length&&'IntersectionObserver' in window){ var lio=new IntersectionObserver(function(es){ es.forEach(function(en){ en.target.classList.toggle('is-live',en.isIntersecting); }); },{threshold:.3}); lives.forEach(function(el){ lio.observe(el); }); }
  /* Commission calculator (restaurant page). The HTML already shows the worked example; this only re-does the sums. */
  $$('[data-calc]').forEach(function(c){
    var f=$('form',c), price=+c.dataset.price, fee=.0236;
    var inr=function(n){ return '₹'+Math.round(n).toLocaleString('en-IN'); };
    var o=function(k){ return $('[data-o="'+k+'"]',c); };
    var fill=function(r){ r.style.setProperty('--p',((r.value-r.min)/(r.max-r.min)*100)+'%'); };
    function run(){
      var s=Math.max(0,+f.sales.value||0), r=+f.rate.value, sh=+f.share.value;
      var dir=s*sh/100, com=dir*r/100, g=dir*fee, k=com-g, n=k>0?Math.max(1,Math.round(price/k)):0;
      f.rateo.value=r+'%'; f.shareo.value=sh+'%'; fill(f.rate); fill(f.share);
      o('sales').textContent=inr(s); o('direct').textContent=sh+'%, so '+inr(dir)+' of orders'; o('rate').textContent=r+'%';
      o('com').textContent=inr(com)+' a month'; o('fee').textContent=inr(g)+' a month';
      o('com-s').textContent=inr(com); o('fee-s').textContent=inr(g);
      o('bar-fee').style.setProperty('--w',(com>0?g/com*100:0)+'%');
      o('kept').textContent=inr(Math.max(0,k)); o('pay').textContent=n?n+(n===1?' month':' months'):'—';
    }
    f.addEventListener('input',run); f.addEventListener('submit',function(e){ e.preventDefault(); }); run();
  });
})();
