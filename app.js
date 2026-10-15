'use strict';
const demos={clinic:{name:'RADIANCE',description:'คลินิกความงาม: นางแบบสวย ภาพบริการ และหน้าเว็บสไตล์หรูหราสมจริง'},business:{name:'FORMA STUDIO',description:'ธุรกิจบริการ: ดีไซน์ภาพใหญ่แบบสตูดิโอออกแบบพร้อมแสดงผลงานและบริการ'},wellness:{name:'SERENA WELLNESS',description:'สปาและเวลเนส: สื่อสารบรรยากาศด้วยภาพถ่ายจริงและแนะนำประสบการณ์ที่น่าจดจำ'},product:{name:'LUMIVELLE',description:'แบรนด์สินค้า: นางแบบ ภาพผลิตภัณฑ์ และเลย์เอาต์หน้าร้านสกินแคร์สไตล์พรีเมียม'}};
function selectDemo(button){const key=button.dataset.demo;document.querySelectorAll('[data-demo]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1});const iframe=document.getElementById('demo-iframe');iframe.src=`examples/${key}.html?embed=1`;iframe.title=`ตัวอย่างเว็บไซต์ ${demos[key].name}`;document.getElementById('demo-domain').textContent=demos[key].name;document.getElementById('demo-open').href=`examples/${key}.html`;document.getElementById('demo-description').textContent=demos[key].description;document.getElementById('preview-panel').setAttribute('aria-labelledby',button.id||`tab-${key}`)}
function keyboardTabs(selector,onSelect){const buttons=[...document.querySelectorAll(selector)];buttons.forEach((button,index)=>{button.tabIndex=button.getAttribute('aria-selected')==='true'?0:-1;button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();buttons[next].focus();onSelect(buttons[next])})})}
document.querySelectorAll('[data-demo]').forEach(button=>button.addEventListener('click',()=>selectDemo(button)));keyboardTabs('[data-demo]',selectDemo);
document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('preview-frame').classList.toggle('mobile',button.dataset.device==='mobile')}));
const panels={overview:'<div class="metrics"><div class="metric"><small>ลูกค้า</small><b>24</b></div><div class="metric"><small>งานติดตาม</small><b>06</b></div><div class="metric"><small>นัดหมาย</small><b>08</b></div></div><h4 class="demo-subtitle">ภาพรวมการติดต่อ</h4><div class="chart"><div style="height:35%"><span>จ.</span></div><div style="height:61%"><span>อ.</span></div><div style="height:45%"><span>พ.</span></div><div style="height:76%"><span>พฤ.</span></div><div style="height:57%"><span>ศ.</span></div><div style="height:93%"><span>ส.</span></div><div style="height:65%"><span>อา.</span></div></div>',customers:'<h4 class="demo-subtitle">รายชื่อลูกค้า</h4><table class="demo-table"><thead><tr><th>ลูกค้า</th><th>งานที่สนใจ</th><th>สถานะ</th></tr></thead><tbody><tr><td>ลูกค้า A</td><td>บริการ A</td><td><span class="status">นัดหมายแล้ว</span></td></tr><tr><td>ลูกค้า B</td><td>บริการ B</td><td><span class="status">รอติดต่อ</span></td></tr><tr><td>ลูกค้า C</td><td>บริการ A</td><td><span class="status">ติดตามผล</span></td></tr></tbody></table>',followup:'<h4 class="demo-subtitle">งานที่ต้องติดตาม</h4><div class="task"><span>01</span><div>ติดต่อลูกค้า A<small>ยืนยันข้อมูลก่อนนัดหมาย</small></div></div><div class="task"><span>02</span><div>ส่งรายละเอียดบริการ<small>ลูกค้า B</small></div></div><div class="task"><span>03</span><div>ติดตามหลังรับบริการ<small>ลูกค้า C</small></div></div>'};
function selectPanel(button){document.querySelectorAll('[data-panel]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;b.id=`panel-tab-${b.dataset.panel}`});document.getElementById('dashboard-content').innerHTML=panels[button.dataset.panel];document.getElementById('dashboard-content').setAttribute('aria-labelledby',button.id)}document.querySelectorAll('[data-panel]').forEach(button=>button.addEventListener('click',()=>selectPanel(button)));selectPanel(document.querySelector('[data-panel="overview"]'));keyboardTabs('[data-panel]',selectPanel);
document.querySelectorAll('.choose-package').forEach(link=>link.addEventListener('click',()=>{document.getElementById('package-select').value=link.dataset.package}));

const LEAD_API='https://jeqbyhzbpivscsduwkcj.supabase.co/functions/v1/submit-lead';
// Supabase legacy anon JWT: a PUBLIC browser key, not the secret service-role key.
const LEAD_PUBLIC_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcWJ5aHpicGl2c2NzZHV3a2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTEzODIsImV4cCI6MjEwNzQ4NzM4Mn0.DFS66XJ_eKtyUh9LB5p3iRrE-9HpfR5GkNMcIVuuq8Q';
const form=document.getElementById('brief-form');
/* Pre-fill public project scope from the independent pricing page.
   These URL parameters contain package names/estimates only, never customer data. */
(()=>{
  const query=new URLSearchParams(location.search);
  const requested=(query.get('package')||'').trim().slice(0,90);
  const extras=(query.get('addons')||'').trim().slice(0,950);
  const care=(query.get('care')||'').trim().slice(0,100);
  const start=(query.get('starting')||'').trim();
  if(!requested&&!extras&&!care)return;
  const picker=document.getElementById('package-select');
  const matching=[...picker.options].find(o=>o.value===requested);
  if(matching)picker.value=matching.value;
  const lines=[];
  if(extras)lines.push('บริการเสริมที่สนใจ: '+extras);
  if(care)lines.push('แพ็กเกจดูแลต่อเนื่องที่สนใจ: '+care);
  if(/^[0-9]{1,8}$/.test(start))lines.push('งบเริ่มต้นที่ระบบแสดง (ยังไม่ใช่ราคายืนยัน): '+Number(start).toLocaleString('th-TH')+' บาท');
  const details=form.elements.namedItem('details');
  if(details&&lines.length){
    details.value=lines.join('\n');
    const note=document.createElement('p');
    note.className='price-selection-hint';
    note.textContent='✓ นำแพ็กเกจและบริการเสริมที่เลือกจากหน้าราคาเข้ามาให้แล้ว สามารถเพิ่มรายละเอียดได้ก่อนส่ง';
    const label=details.closest('label');
    if(label)label.parentNode.insertBefore(note,label);
  }
})();

const briefSubmitButton=document.getElementById('brief-submit');
document.getElementById('lead-privacy-open').addEventListener('click',()=>document.getElementById('privacy-dialog').showModal());
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity()||briefSubmitButton.disabled)return;
  const data=new FormData(form);
  const business=String(data.get('business')||'').trim();
  const type=String(data.get('type')||'').trim();
  const province=String(data.get('province')||'').trim();
  const packageName=String(data.get('package')||'').trim();
  const details=String(data.get('details')||'').trim();
  const reply=String(data.get('reply')||'').trim();
  const brief=[
    'รายละเอียดงานเว็บไซต์ — SUMO WEB',
    'ชื่อธุรกิจ: '+business,
    'ประเภทธุรกิจ: '+type,
    'จังหวัด: '+(province||'ยังไม่ระบุ'),
    'บริการที่สนใจ: '+(document.getElementById('package-select').selectedOptions[0]?.textContent||packageName),
    'ช่องทางติดต่อกลับ: '+reply,
    'สิ่งที่ต้องการ: '+(details||'ขอปรึกษารายละเอียดเพิ่มเติม')
  ].join('\n');
  document.getElementById('brief-text').value=brief;
  document.getElementById('brief-output').hidden=false;
  const status=document.getElementById('brief-status');
  status.classList.remove('lead-save-ok','lead-save-error');
  status.textContent='กำลังส่งคำขอและบันทึกข้อมูล...';
  const oldButtonText=briefSubmitButton.textContent;
  briefSubmitButton.disabled=true;
  briefSubmitButton.textContent='กำลังส่งข้อมูล...';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(LEAD_API,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':LEAD_PUBLIC_ANON_KEY,
        'Authorization':'Bearer '+LEAD_PUBLIC_ANON_KEY
      },
      signal:controller.signal,
      body:JSON.stringify({
        business_name:business,
        business_type:type,
        province:province,
        service_interest:packageName,
        project_details:details,
        contact_channel:reply,
        website_url:String(data.get('website_url')||'')
      })
    });
    const payload=await response.json().catch(()=>({}));
    if(response.ok&&payload.ok===true){
      status.classList.add('lead-save-ok');
      status.textContent='✓ บันทึกคำขอสำเร็จแล้วค่ะ SUMO WEB ได้รับรายละเอียดของคุณแล้ว และจะติดต่อกลับผ่านช่องทางที่ระบุ';
    }else{
      status.classList.add('lead-save-error');
      status.textContent=response.status===429
        ?'ส่งคำขอจากการเชื่อมต่อนี้ถี่เกินไป กรุณารอสักครู่ หรือติดต่อทาง LINE/อีเมลด้านล่าง'
        :'ยังบันทึกลงระบบไม่ได้ค่ะ กรุณาใช้ปุ่มส่งทางอีเมลหรือ LINE ด้านล่างแทนเพื่อไม่ให้คำขอสูญหาย';
    }
  }catch(error){
    status.classList.add('lead-save-error');
    status.textContent=error&&error.name==='AbortError'
      ?'การเชื่อมต่อใช้เวลานานเกินไป ยังยืนยันว่าบันทึกสำเร็จไม่ได้ กรุณาติดต่อผ่าน LINE/อีเมล หรือรอสักครู่แล้วตรวจสอบอีกครั้ง'
      :'ไม่สามารถติดต่อระบบรับคำขอได้ค่ะ ข้อมูลยังอยู่ด้านล่าง สามารถส่งทาง LINE หรืออีเมลแทนได้';
  }finally{
    clearTimeout(timer);
    briefSubmitButton.disabled=false;
    briefSubmitButton.textContent=oldButtonText;
    document.getElementById('brief-output').scrollIntoView({
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
      block:'nearest'
    });
  }
});
// Confirmed business channels. Email opens a draft; the visitor must explicitly press Send.
document.getElementById('email-brief').addEventListener('click',()=>{
  const message=document.getElementById('brief-text').value;
  const status=document.getElementById('brief-status');
  if(!message){status.textContent='กรุณาเตรียมรายละเอียดก่อน';return;}
  const subject=encodeURIComponent('ขอประเมินเว็บไซต์ — SUMO WEB');
  const body=encodeURIComponent(message);
  status.textContent='กำลังเปิดแอปอีเมล กรุณาตรวจผู้รับและกดส่งด้วยตัวเอง';
  window.location.href='mailto:sumoskb@hotmail.com?subject='+subject+'&body='+body;
});
// The LINE ID link opens independently; copying occurs on the same user click.
document.getElementById('line-brief').addEventListener('click',()=>{
  const field=document.getElementById('brief-text');
  const status=document.getElementById('brief-status');
  const message=field.value;
  if(!message){status.textContent='กรุณาเตรียมรายละเอียดก่อน';return;}
  if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
    navigator.clipboard.writeText(message).then(()=>{
      status.textContent='คัดลอกข้อความแล้ว กรุณาวางลงในแชท LINE: sumoskb แล้วกดส่ง';
    }).catch(()=>{
      field.focus();field.select();
      status.textContent='ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาคัดลอกข้อความที่เลือกแล้ววางใน LINE: sumoskb';
    });
  }else{
    field.focus();field.select();
    status.textContent='กรุณาคัดลอกข้อความที่เลือก แล้ววางใน LINE: sumoskb';
  }
});
// Share sheet is client-only: the visitor selects both the app and recipient.
// This does not silently submit a lead or invent a destination contact account.
document.getElementById('share-brief').addEventListener('click',async()=>{
  const field=document.getElementById('brief-text');
  const status=document.getElementById('brief-status');
  const message=field.value;
  if(!message){status.textContent='กรุณาเตรียมรายละเอียดก่อน';return;}
  if(typeof navigator.share==='function'){
    try{
      await navigator.share({title:'รายละเอียดงานเว็บไซต์ — SUMO WEB',text:message});
      status.textContent='ปิดเมนูแชร์แล้ว โปรดตรวจสอบในแอปที่เลือกว่าข้อความถูกส่งถึงผู้รับ';
    }catch(error){
      if(error&&error.name==='AbortError')status.textContent='ยกเลิกการแชร์แล้ว ข้อมูลยังไม่ได้ส่ง';
      else status.textContent='เปิดเมนูแชร์ไม่สำเร็จ ลองคัดลอกข้อความด้านล่างแทน';
    }
    return;
  }
  try{
    await navigator.clipboard.writeText(message);
    status.textContent='อุปกรณ์นี้ไม่มีเมนูแชร์ คัดลอกข้อความแล้ว กรุณาเปิด LINE หรือแอปอื่นเพื่อส่ง';
  }catch(error){
    field.focus();field.select();
    status.textContent='อุปกรณ์นี้ไม่มีเมนูแชร์ เลือกข้อความไว้แล้ว กรุณาคัดลอกและส่งเอง';
  }
});
document.getElementById('copy-brief').addEventListener('click',async()=>{const field=document.getElementById('brief-text');try{await navigator.clipboard.writeText(field.value);document.getElementById('brief-status').textContent='คัดลอกแล้ว พร้อมนำไปส่งผ่านช่องทางติดต่อของคุณ'}catch{field.focus();field.select();document.getElementById('brief-status').textContent='กรุณาคัดลอกข้อความที่เลือกไว้ หรือใช้ปุ่มดาวน์โหลดรายละเอียด'}});
document.getElementById('download-brief').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\ufeff',document.getElementById('brief-text').value],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='sumo-web-project-brief.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
const dialog=document.getElementById('privacy-dialog');document.getElementById('privacy-open').addEventListener('click',()=>dialog.showModal());document.getElementById('privacy-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close()}});document.getElementById('year').textContent=new Date().getFullYear();


// Mobile navigation: fully keyboard accessible and only used at narrow widths.
(() => {
  const toggle=document.getElementById('mobile-menu-toggle');
  const menu=document.getElementById('mobile-menu');
  if(!toggle||!menu)return;
  const close=()=>{
    menu.hidden=true;
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','เปิดเมนูนำทาง');
  };
  toggle.addEventListener('click',()=>{
    const open=menu.hidden;
    menu.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'ปิดเมนูนำทาง':'เปิดเมนูนำทาง');
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!menu.hidden){close();toggle.focus();}
  });
  document.addEventListener('click',event=>{
    if(!menu.hidden&&!menu.contains(event.target)&&!toggle.contains(event.target))close();
  });
  window.matchMedia('(min-width: 721px)').addEventListener('change',event=>{if(event.matches)close();});
})();

// Scale the shared RADIANCE preview to its miniature browser width.
// The page itself remains a single source of truth: examples/clinic.html.
(() => {
  const viewport = document.querySelector('.brain-live-viewport');
  const iframe = document.getElementById('brain-live-demo');
  if (!viewport || !iframe) return;
  const resizePreview = () => {
    const width = viewport.clientWidth;
    if (width > 0) iframe.style.transform = 'scale(' + (width / 1200).toFixed(5) + ')';
  };
  resizePreview();
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(resizePreview);
    observer.observe(viewport);
  } else {
    window.addEventListener('resize', resizePreview, {passive: true});
  }
})();
