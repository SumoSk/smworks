'use strict';
/* SUMOWEB admin: server-verified PIN; no password or privileged key is stored in page code. */
(() => {
  const apiUrl='https://jeqbyhzbpivscsduwkcj.supabase.co/functions/v1/site-admin';
  const apiHeaders=()=>({
    'Content-Type':'application/json',
    'apikey':LEAD_PUBLIC_ANON_KEY,
    'Authorization':'Bearer '+LEAD_PUBLIC_ANON_KEY
  });
  const el=id=>document.getElementById(id);
  const dialog=el('sumoweb-admin-dialog');
  const trigger=el('sumoweb-admin-trigger');
  if(!dialog||!trigger)return;

  let token='';
  let tokenExpires=0;
  let leads=[];
  let leadOffset=0;
  let leadTotal=0;
  const PAGE=60;
  const statusLabels={
    new:'ใหม่',contacted:'ติดต่อแล้ว',quoted:'เสนอราคาแล้ว',
    won:'ปิดงานสำเร็จ',lost:'ไม่สำเร็จ',spam:'สแปม'
  };
  const fmtDate=x=>x?new Date(x).toLocaleString('th-TH',{
    day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'
  }):'—';

  async function request(action,extra={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(apiUrl,{
        method:'POST',mode:'cors',credentials:'omit',
        headers:apiHeaders(),
        signal:controller.signal,
        body:JSON.stringify({action,...extra})
      });
      const json=await response.json().catch(()=>({ok:false,code:'invalid_response'}));
      if(response.status===401&&action!=='login'){
        token='';tokenExpires=0;showLogin('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }
      if(!response.ok||json.ok!==true){
        const err=new Error(json.code||'request_failed');
        err.code=json.code||'request_failed';
        throw err;
      }
      return json;
    }finally{clearTimeout(timer)}
  }
  function setStatus(message){
    el('sa-global-status').textContent=message||'';
  }
  function showLogin(message=''){
    el('sa-login-view').hidden=false;
    el('sa-panel-view').hidden=true;
    el('sa-logout').hidden=true;
    el('sa-login-error').textContent=message;
    el('sa-pin').value='';
    if(dialog.open)el('sa-pin').focus();
  }
  function showPanel(){
    el('sa-login-view').hidden=true;
    el('sa-panel-view').hidden=false;
    el('sa-logout').hidden=false;
    el('sa-login-error').textContent='';
  }
  function checkSession(){
    if(token&&Date.now()<tokenExpires-15000)return true;
    token='';showLogin();return false;
  }
  trigger.addEventListener('click',event=>{
    event.preventDefault();
    dialog.showModal();
    if(checkSession()){showPanel();loadOverview()}else showLogin();
  });
  el('sa-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',ev=>{
    if(ev.target===dialog){const r=dialog.getBoundingClientRect();
      if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();
    }
  });

  el('sa-login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const input=el('sa-pin');
    const pin=input.value;
    input.value='';
    if(!/^[0-9]{6}$/.test(pin)){
      el('sa-login-error').textContent='กรุณาใส่รหัสตัวเลข 6 หลัก';return;
    }
    const button=el('sa-login-button');
    button.disabled=true;
    el('sa-login-error').textContent='กำลังตรวจสอบรหัส...';
    try{
      const result=await request('login',{pin});
      token=result.session_token;
      tokenExpires=Date.now()+Number(result.expires_in_seconds||10800)*1000;
      showPanel();
      await loadOverview();
    }catch(e){
      const msg=e.code==='rate_limited'
        ?'มีการลองเข้าสู่ระบบหลายครั้ง กรุณารอประมาณ 15 นาที'
        :e.code==='invalid_credentials'
        ?'รหัสไม่ถูกต้อง กรุณาลองใหม่'
        :'ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง';
      el('sa-login-error').textContent=msg;
    }finally{button.disabled=false}
  });

  el('sa-logout').addEventListener('click',async()=>{
    const t=token;
    token='';tokenExpires=0;
    if(t)try{await request('logout',{session_token:t})}catch(_){}
    showLogin('ออกจากระบบแล้ว');
  });

  function chooseTab(name){
    document.querySelectorAll('.sa-tab').forEach(button=>{
      button.setAttribute('aria-selected',String(button.dataset.saTab===name));
    });
    el('sa-visits-section').hidden=name!=='visits';
    el('sa-leads-section').hidden=name!=='leads';
    if(name==='leads')loadLeads(true);
    else loadOverview();
  }
  document.querySelectorAll('.sa-tab').forEach(button=>{
    button.addEventListener('click',()=>{if(checkSession())chooseTab(button.dataset.saTab)});
  });
  el('sa-refresh').addEventListener('click',()=>{
    if(!checkSession())return;
    if(el('sa-leads-section').hidden)loadOverview();else loadLeads(true);
  });

  function cell(textValue){
    const td=document.createElement('td');
    td.textContent=textValue===undefined||textValue===null?'—':String(textValue);
    return td;
  }
  function renderOverview(data){
    const metrics=[
      ['วันนี้',data.today_views],['7 วัน',data.week_views],
      ['30 วัน',data.month_views],['ผู้เข้าชมแยกตามเซสชัน (30 วัน)',data.unique_sessions_30d]
    ];
    const stats=el('sa-stats');stats.replaceChildren();
    for(const [title,value] of metrics){
      const box=document.createElement('div');box.className='sa-stat';
      const small=document.createElement('small');small.textContent=title;
      const strong=document.createElement('strong');strong.textContent=Number(value||0).toLocaleString('th-TH');
      box.append(small,strong);stats.append(box);
    }
    el('sa-visit-note').textContent=
      'มีคำขอประเมินงานทั้งหมด '+Number(data.total_leads||0).toLocaleString('th-TH')+
      ' รายการ (ใหม่ '+Number(data.new_leads||0)+' รายการ) · ผู้เยี่ยมชมเป็นเซสชันนิรนาม ไม่ใช่ชื่อบุคคล';
    const dayData=new Map((data.daily_views||[]).map(row=>[String(row.day),Number(row.views)||0]));
    const entries=[];
    for(let i=13;i>=0;i--){
      const shifted=new Date(Date.now()+7*3600000-i*86400000);
      const date=shifted.toISOString().slice(0,10);
      entries.push({date,views:dayData.get(date)||0});
    }
    const max=Math.max(1,...entries.map(v=>v.views));
    const chart=el('sa-chart');chart.replaceChildren();
    entries.forEach(({date,views})=>{
      const col=document.createElement('div');col.className='sa-bar-col';
      const count=document.createElement('span');count.className='sa-bar-count';count.textContent=views||'';
      const bar=document.createElement('div');bar.className='sa-bar';
      bar.style.height=(Math.max(3,views/max*78))+'px';
      bar.title=date+': '+views+' ครั้ง';
      const label=document.createElement('small');label.className='sa-bar-date';label.textContent=date.slice(8);
      col.append(count,bar,label);chart.append(col);
    });

    const rows=el('sa-visit-rows');rows.replaceChildren();
    const visits=data.visitors_recent||[];
    if(!visits.length){
      const tr=document.createElement('tr'),td=cell('ยังไม่มีสถิติการเข้าชม');td.colSpan=5;
      tr.append(td);rows.append(tr);
    }else{
      visits.forEach(visit=>{
        const tr=document.createElement('tr');
        const session=String(visit.visitor_session||'').slice(0,8).toUpperCase();
        [fmtDate(visit.viewed_at),'ผู้เยี่ยมชม '+session,visit.path,visit.referrer_host||'เข้าตรง',visit.device].forEach(t=>tr.append(cell(t)));
        rows.append(tr);
      });
    }
  }
  async function loadOverview(){
    if(!checkSession())return;
    setStatus('กำลังโหลดข้อมูลผู้เข้าชม...');
    try{
      const data=await request('overview',{session_token:token});
      renderOverview(data);setStatus('อัปเดตข้อมูลล่าสุดแล้ว');
    }catch(e){setStatus('ไม่สามารถโหลดสถิติได้ กรุณาลองใหม่')}
  }
  const filter=el('sa-lead-filter');
  filter.addEventListener('change',()=>renderLeads());
  const create=(tag,className='',text='')=>{
    const e=document.createElement(tag);if(className)e.className=className;
    if(text!==undefined&&text!==null)e.textContent=String(text);return e;
  };
  function leadRow(lead){
    const box=create('article','sa-lead');
    const top=create('div','sa-lead-top');
    const title=create('h4','',lead.business_name||'ไม่มีชื่อธุรกิจ');
    const time=create('time','',fmtDate(lead.created_at));
    top.append(title,time);box.append(top);
    const meta=create('div','sa-lead-line');
    meta.append(create('b','','บริการ:'),document.createTextNode(' '+(lead.service_interest||'—')));
    const area=create('div','sa-lead-line');
    area.append(create('b','','ประเภท/จังหวัด:'),document.createTextNode(' '+(lead.business_type||'—')+' · '+(lead.province||'—')));
    const contact=create('div','sa-lead-line');
    contact.append(create('b','','ติดต่อกลับ:'),document.createTextNode(' '+(lead.contact_channel||'—')));
    const details=create('p','sa-lead-details',lead.project_details||'ไม่ได้ระบุรายละเอียด');
    box.append(meta,area,contact,details);
    const grid=create('div','sa-lead-grid');
    const statusLabel=create('label','sa-lead-field','สถานะลูกค้า');
    const statusSelect=create('select');
    Object.entries(statusLabels).forEach(([key,val])=>{
      const option=create('option','',val);option.value=key;
      option.selected=lead.status===key;statusSelect.append(option);
    });
    statusLabel.append(statusSelect);
    const notesLabel=create('label','sa-lead-field','หมายเหตุภายใน');
    const notes=create('textarea');notes.rows=2;notes.maxLength=5000;notes.value=lead.internal_notes||'';
    notesLabel.append(notes);
    grid.append(statusLabel,notesLabel);box.append(grid);
    const actions=create('div','sa-lead-actions');
    const save=create('button','sa-primary-btn','บันทึกการแก้ไข');save.type='button';
    const del=create('button','sa-danger-btn','ลบข้อมูล');del.type='button';
    const msg=create('span','sa-subtle','');msg.setAttribute('role','status');
    const left=create('div');left.append(save,msg);actions.append(left,del);box.append(actions);
    save.addEventListener('click',async()=>{
      if(!checkSession())return;
      save.disabled=true;msg.textContent=' กำลังบันทึก';
      try{
        await request('lead_update',{session_token:token,lead_id:lead.id,status:statusSelect.value,notes:notes.value});
        lead.status=statusSelect.value;lead.internal_notes=notes.value;
        msg.textContent=' ✓ บันทึกแล้ว';
      }catch(e){msg.textContent=' บันทึกไม่ได้ กรุณาลองใหม่'}
      finally{save.disabled=false}
    });
    del.addEventListener('click',async()=>{
      if(!checkSession())return;
      if(!confirm('ลบข้อมูลของ '+(lead.business_name||'ลูกค้ารายนี้')+' ถาวรจาก SUMOWEB หรือไม่?'))return;
      del.disabled=true;
      try{
        await request('lead_delete',{session_token:token,lead_id:lead.id});
        leads=leads.filter(l=>l.id!==lead.id);
        leadTotal=Math.max(0,leadTotal-1);
        renderLeads();
      }catch(e){msg.textContent=' ลบไม่ได้ กรุณาลองใหม่';del.disabled=false}
    });
    return box;
  }
  function renderLeads(){
    const list=el('sa-lead-list');list.replaceChildren();
    const selected=filter.value;
    const filtered=leads.filter(l=>selected==='all'||l.status===selected);
    el('sa-leads-count').textContent='ทั้งหมด '+leadTotal.toLocaleString('th-TH')+' รายการ';
    if(!filtered.length)list.append(create('p','sa-empty','ยังไม่มีลูกค้าในสถานะนี้'));
    else filtered.forEach(l=>list.append(leadRow(l)));
    el('sa-load-more').hidden=leadOffset>=leadTotal;
  }
  async function loadLeads(reset=false){
    if(!checkSession())return;
    if(reset){leads=[];leadOffset=0;}
    setStatus('กำลังโหลดข้อมูลลูกค้า...');
    try{
      const data=await request('leads',{session_token:token,offset:leadOffset});
      leads.push(...(data.leads||[]));
      leadOffset=leads.length;
      leadTotal=Number(data.total||leads.length);
      renderLeads();setStatus('อัปเดตข้อมูลล่าสุดแล้ว');
    }catch(e){setStatus('ไม่สามารถโหลดรายชื่อลูกค้าได้ กรุณาลองอีกครั้ง')}
  }
  el('sa-load-more').addEventListener('click',()=>loadLeads(false));

  // Anonymous visit measurements: tab-session identifier only; no visitor names,
  // cookies, raw IP addresses, or contact information collected here.
  (async()=>{
    try{
      let id=sessionStorage.getItem('sumoweb-tab-session-v1');
      if(!id){
        id=crypto.randomUUID();sessionStorage.setItem('sumoweb-tab-session-v1',id);
      }
      let referrer='';
      if(document.referrer){
        try{referrer=new URL(document.referrer).hostname}catch(_){}
      }
      const width=window.innerWidth;
      const device=/iPad|Tablet/i.test(navigator.userAgent)||(
        width>610&&width<=1024)?'tablet':width<=610?'mobile':'desktop';
      await request('track',{
        visitor_session:id,
        path:location.pathname,
        referrer_host:referrer.slice(0,160),
        device
      });
    }catch(_){/* Analytics may fail silently without affecting the public site. */}
  })();
})();
