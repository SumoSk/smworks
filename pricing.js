'use strict';
(() => {
 const website={none:{name:'ไม่เลือกเว็บไซต์',price:0},discovery:{name:'For AI Discovery',price:9900},website:{name:'Business Website',price:39900}};
 const system={none:{name:'ไม่เลือกระบบหลังบ้าน',price:0},basic:{name:'Business Basic',price:29900},full:{name:'Business Full',price:69900}};
 const care={none:{name:'',price:0},essential:{name:'ตรวจเช็กเว็บไซต์',price:990},content:{name:'ช่วยแก้ข้อความและรูป',price:1990},growth:{name:'อัปเดตเนื้อหาและรายงาน',price:3990},system:{name:'ดูแลเว็บที่มีระบบหลังบ้าน',price:4990}};
 const includedByWebsite={none:[],discovery:[],website:['copy','cms','gsc','schema']};
 const includedBySystem={none:[],basic:['leadform','leaddash','customdash'],full:['leadform','leaddash','customdash','roles']};
 const el=id=>document.getElementById(id);
 const fmt=n=>'฿'+Number(n).toLocaleString('en-US');
 const ws=el('quote-plan-select'),ss=el('quote-system-select'),cs=el('quote-care-select'),ls=el('quote-layout-select');
 if(!ws||!ss||!cs)return;
 const checks=[...document.querySelectorAll('.addon-check')];
 let quoteParams='';
 const jump=()=>{const target=el('estimate');let p=target.parentElement;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});};
 function render(){
  const w=website[ws.value]||website.none,s=system[ss.value]||system.none,c=care[cs.value]||care.none;
  const disabled=new Set([...(includedByWebsite[ws.value]||[]),...(includedBySystem[ss.value]||[])]);
  for(const check of checks){
   const isIncluded=disabled.has(check.value);
   if(isIncluded)check.checked=false;
   check.disabled=isIncluded;
   check.closest('.addon-row')?.classList.toggle('is-included',isIncluded);
   if(isIncluded)check.closest('.addon-row')?.setAttribute('title','รวมในแพ็กเกจที่เลือกอยู่แล้ว');
   else check.closest('.addon-row')?.removeAttribute('title');
  }
  const selected=checks.filter(x=>x.checked&&!x.disabled);
  const addons=selected.reduce((n,x)=>n+Number(x.dataset.price||0),0),total=w.price+s.price+addons;
  el('quote-plan-price').textContent=fmt(w.price);
  el('quote-system-price').textContent=fmt(s.price);
  el('quote-addon-price').textContent=fmt(addons)+(addons?'+':'');
  el('quote-total').textContent=fmt(total)+(addons?'+':'');
  el('quote-monthly-price').textContent=c.price?fmt(c.price)+'/เดือน'+(cs.value==='system'?'+':''):'ยังไม่เลือก';
  el('quote-selected-addons').textContent=selected.length?'บริการเสริมที่สนใจ: '+selected.map(x=>x.dataset.title).join(' · '):'ไม่ได้เลือกบริการเสริม';
  if(el('addon-selected-count'))el('addon-selected-count').textContent=selected.length?'เลือกแล้ว '+selected.length+' รายการ':'บริการเสริมไม่บังคับ · เลือกเพิ่มหรือข้ามได้';
  const params=new URLSearchParams();
  params.set('package',ws.value==='none'?'none':w.name);
  params.set('system',ss.value==='none'?'none':s.name);
  if(selected.length)params.set('addons',selected.map(x=>x.dataset.title).join(' / '));
  if(c.price)params.set('care',c.name);
  if(ws.value!=='none'&&ls?.value)params.set('layout',ls.value==='single'?'เลื่อนดูส่วนต่าง ๆ ในหน้าเดียว':'แยกหน้าเพจตามหมวด');
  if(total>0)params.set('starting',String(total));
  quoteParams=params.toString();
 }
 ws.addEventListener('change',render);ss.addEventListener('change',render);cs.addEventListener('change',render);ls?.addEventListener('change',render);
 for(const c of checks)c.addEventListener('change',render);
 document.querySelectorAll('[data-plan-pick]').forEach(b=>b.addEventListener('click',()=>{ws.value=b.dataset.planPick;render();jump()}));
 document.querySelectorAll('[data-system-pick]').forEach(b=>b.addEventListener('click',()=>{ss.value=b.dataset.systemPick;render();jump()}));
 document.querySelectorAll('[data-care-pick]').forEach(b=>b.addEventListener('click',()=>{cs.value=b.dataset.carePick;render();jump()}));
 el('quote-reset')?.addEventListener('click',()=>{ws.value='none';ss.value='none';cs.value='none';if(ls)ls.value='';checks.forEach(x=>x.checked=false);render()});
 document.getElementById('pricing-expand-all')?.addEventListener('click',()=>document.querySelectorAll('.pkg-all,.pkg-faq').forEach(x=>x.open=true));
 document.getElementById('pricing-collapse-all')?.addEventListener('click',()=>document.querySelectorAll('.pkg-all,.pkg-faq').forEach(x=>x.open=false));
 function expandTo(target){let p=target;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}}
 function hashReveal(){let target=document.getElementById(location.hash.slice(1));if(target)expandTo(target);}
 window.addEventListener('hashchange',hashReveal);hashReveal();
 el('quote-contact')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('sumoweb:pricing-selection',{detail:quoteParams})));
 document.querySelectorAll('[data-system-enquiry]').forEach(a=>a.addEventListener('click',()=>{
  const params=new URLSearchParams({package:'none',system:a.dataset.systemEnquiry});
  window.dispatchEvent(new CustomEvent('sumoweb:pricing-selection',{detail:params.toString()}));
 }));
 render();
})();