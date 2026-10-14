'use strict';
(() => {
  const plans={
    lite:{name:'One Page Lite',price:9900},
    landing:{name:'Signature Landing',price:19900},
    business:{name:'Business Discover',price:32900},
    lead:{name:'Business Lead',price:59900},
    custom:{name:'Custom Web System',price:89900},
    none:{name:'เฉพาะบริการดูแลต่อเนื่อง',price:0}
  };
  const cares={
    none:{name:'',price:0},
    essential:{name:'Essential Care',price:990},
    content:{name:'Content Care',price:1990},
    growth:{name:'Growth Care',price:3990},
    system:{name:'System Care',price:4990}
  };
  const included={
    lite:[],
    landing:[],
    business:['gsc'],
    lead:['gsc','leadform','leaddash'],
    custom:[],
    none:[]
  };
  const el=id=>document.getElementById(id);
  const fmt=n=>'฿'+Number(n).toLocaleString('en-US');
  const planSelect=el('quote-plan-select');
  const careSelect=el('quote-care-select');
  const checks=[...document.querySelectorAll('.addon-check')];
  let explicitPlanSelected=false;

  function render(){
    const plan=plans[planSelect.value]||plans.lite;
    const care=cares[careSelect.value]||cares.none;
    const unavailable=new Set(included[planSelect.value]||[]);
    checks.forEach(check=>{
      const wasDisabled=check.disabled;
      check.disabled=unavailable.has(check.value);
      if(check.disabled){
        check.checked=false;
        check.closest('.addon-row').title='รวมอยู่ในแพ็กเกจเว็บไซต์นี้แล้ว';
      }else{
        if(wasDisabled)check.checked=false;
        check.closest('.addon-row').removeAttribute('title');
      }
    });
    const selected=checks.filter(c=>c.checked&&!c.disabled);
    const addonTotal=selected.reduce((sum,c)=>sum+Number(c.dataset.price||0),0);
    const total=plan.price+addonTotal;
    el('quote-plan-price').textContent=fmt(plan.price)+(planSelect.value==='custom'?'+':'');
    el('quote-addon-price').textContent=fmt(addonTotal)+(addonTotal?'+':'');
    el('quote-total').textContent=fmt(total)+(planSelect.value==='custom'||selected.length?'+':'');
    el('quote-monthly-price').textContent=care.price?fmt(care.price)+'/เดือน'+(careSelect.value==='system'?'+':''):'ยังไม่เลือก';
    const addonsNotice=document.getElementById('addon-selected-count');
    if(addonsNotice)addonsNotice.textContent=selected.length?'เลือกแล้ว '+selected.length+' รายการ':'แอดออนเป็นทางเลือก';
    el('quote-selected-addons').textContent=selected.length
      ?'บริการเสริมที่สนใจ: '+selected.map(c=>c.dataset.title).join(' · ')
      :'ยังไม่ได้เลือกแอดออน';

    const params=new URLSearchParams();
    params.set('package',plan.name);
    if(selected.length)params.set('addons',selected.map(c=>c.dataset.title).join(' / '));
    if(care.price)params.set('care',care.name);
    const hasProject=planSelect.value!=='none';
    if(hasProject||selected.length)params.set('starting',''+total);
    el('quote-contact').href='index.html?'+params.toString()+'#contact';
  }

  function selectPlan(key){
    if(!plans[key])return;
    explicitPlanSelected=key!=='none';
    planSelect.value=key;
    render();
    el('estimate').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  }
  function selectCare(key){
    if(!cares[key])return;
    careSelect.value=key;
    // A care-only enquiry should not accidentally include the default website package.
    if(!explicitPlanSelected)planSelect.value='none';
    render();
    el('estimate').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  }
  planSelect.addEventListener('change',()=>{explicitPlanSelected=planSelect.value!=='none';render()});
  careSelect.addEventListener('change',()=>{if(!explicitPlanSelected&&careSelect.value!=='none')planSelect.value='none';render()});
  checks.forEach(c=>c.addEventListener('change',render));
  document.querySelectorAll('[data-plan-pick]').forEach(button=>{
    button.addEventListener('click',()=>selectPlan(button.dataset.planPick));
  });
  document.querySelectorAll('[data-care-pick]').forEach(button=>{
    button.addEventListener('click',()=>selectCare(button.dataset.carePick));
  });
  el('quote-reset').addEventListener('click',()=>{
    planSelect.value='lite';careSelect.value='none';explicitPlanSelected=false;
    checks.forEach(c=>c.checked=false);
    render();
  });
  render();

  const menuButton=el('pricing-menu-button');
  const menu=el('pricing-mobile-menu');
  function closeMenu(){
    menu.hidden=true;
    menuButton.setAttribute('aria-expanded','false');
    menuButton.setAttribute('aria-label','เปิดเมนู');
  }
  menuButton.addEventListener('click',()=>{
    const shouldOpen=menu.hidden;
    menu.hidden=!shouldOpen;
    menuButton.setAttribute('aria-expanded',String(shouldOpen));
    menuButton.setAttribute('aria-label',shouldOpen?'ปิดเมนู':'เปิดเมนู');
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  window.matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)closeMenu()});

  // Track anonymous pricing-page visits without requesting contact details.
  (async()=>{
    try{
      const publicAnonKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcWJ5aHpicGl2c2NzZHV3a2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTEzODIsImV4cCI6MjEwNzQ4NzM4Mn0.DFS66XJ_eKtyUh9LB5p3iRrE-9HpfR5GkNMcIVuuq8Q';
      let id=sessionStorage.getItem('sumoweb-tab-session-v1');
      if(!id){id=crypto.randomUUID();sessionStorage.setItem('sumoweb-tab-session-v1',id)}
      let origin='';
      if(document.referrer){try{origin=new URL(document.referrer).hostname}catch(_){}}
      const width=innerWidth;
      const device=/iPad|Tablet/i.test(navigator.userAgent)||(width>610&&width<=1024)
        ?'tablet':width<=610?'mobile':'desktop';
      await fetch('https://jeqbyhzbpivscsduwkcj.supabase.co/functions/v1/site-admin',{
        method:'POST',headers:{'Content-Type':'application/json','apikey':publicAnonKey,'Authorization':'Bearer '+publicAnonKey},
        body:JSON.stringify({action:'track',visitor_session:id,path:location.pathname,referrer_host:origin.slice(0,160),device}),
        keepalive:true
      });
    }catch(_){/* Visit tracking does not interrupt browsing. */}
  })();
})();
