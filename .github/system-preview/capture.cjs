const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');
const root = path.join(process.cwd(), '.github/system-preview');
const out = path.join(process.cwd(), 'assets/system-preview');
fs.mkdirSync(out, {recursive:true});
const names = ['ลูกค้าตัวอย่าง 01','ลูกค้าตัวอย่าง 02','ลูกค้าตัวอย่าง 03','ลูกค้าตัวอย่าง 04','ลูกค้าตัวอย่าง 05','ลูกค้าตัวอย่าง 06','ลูกค้าตัวอย่าง 07','ลูกค้าตัวอย่าง 08','ลูกค้าตัวอย่าง 09','ลูกค้าตัวอย่าง 10','ลูกค้าตัวอย่าง 11','ลูกค้าตัวอย่าง 12'];
const dateAgo = n => { const d = new Date(); d.setDate(d.getDate()-n); return d.toLocaleDateString('en-CA', {timeZone:'Asia/Bangkok'}); };
const today = dateAgo(0);
const customers = names.map((name,i)=>({id:String(i+1),opd:String(i+1).padStart(4,'0'),name,full_name:name,phone:'000000'+String(i+1).padStart(4,'0'),vip:i<3?'VIP':'ทั่วไป',name_color:i===3?'yellow':'green',birth_th_ddmmyyyy:'15/10/2535',birthday:'1992-10-15',gender:i%2?'ชาย':'หญิง',address:'ที่อยู่ตัวอย่าง',created_at:dateAgo(i*5)+'T08:00:00Z',profile:'',profile_pic_url:'',note:'ข้อมูลสมมติสำหรับแสดงหน้าจอ'}));
const services=['โบทอค (Aestox 100 u)','ฟิลเลอร์ (Neuramis สีดำ)','งานผิว (Meso Chanel)','ทรีทเม้นท์ (ทรีทเมนต์หน้าใส)'];
const sales=Array.from({length:84},(_,i)=>{const c=customers[i%12],v=[5900,6900,2500,990][i%4];return {id:String(i+1),opd:c.opd,name:c.name,phone:c.phone,date:dateAgo(i%48),amount:v,original_amount:v,payment_method:i%2?'เงินสด':'โอน',items:[services[i%4]+' - 1 ชิ้น ราคา '+v+' บาท'],note:'ตัวอย่างรายการบริการ',created_at:dateAgo(i%48)+'T09:00:00Z',status:'recorded',receipt_no:'DEMO-'+String(i+1).padStart(4,'0'),followup_status:'pending'};});
const pitches=customers.map((c,i)=>({id:String(i+1),opd:c.opd,name:c.name,customer_name:c.name,phone:c.phone,outcome:['สนใจ','ขอคิดก่อน','นัดแล้ว'][i%3],promotion:'ติดตามบริการเดิม',content:'แจ้งรายละเอียดบริการและนัดติดตาม',channel:'call',call_type:i%2?'followup':'pitch',followup_score:4,created_at:today+'T09:00:00Z',next_follow_up_at:dateAgo(-3)}));
const appointments=customers.slice(0,6).map((c,i)=>({id:String(i+1),opd:c.opd,guest_name:c.name,guest_phone:c.phone,customer_name:c.name,appt_date:today,start_time:['10:00','11:00','13:00','14:00','15:00','16:00'][i],end_time:['11:00','12:00','14:00','15:00','16:00','17:00'][i],column_id:i%4+1,service:services[i%4],status:'confirmed',customer_type:i%2?'new':'old'}));
const productsMap={'โบทอค':['Aestox 100 u','Allergan 50 u'],'ฟิลเลอร์':['Neuramis สีดำ','Neuramis สีทอง'],'งานผิว':['Meso Chanel'],'ทรีทเม้นท์':['ทรีทเมนต์หน้าใส']};
function api(url,req){
 const u=new URL(url),p=u.pathname;
 if(p==='/api/customers')return customers;
 if(p==='/api/sales'||p==='/api/reccord_sale'||p==='/api/record_sale')return sales;
 if(p==='/api/products_map')return {map:productsMap};
 if(p==='/api/categories')return Object.keys(productsMap).map((name,i)=>({id:i+1,name}));
 if(p==='/api/products')return Object.entries(productsMap).flatMap(([category,list])=>list.map((name,i)=>({id:category+i,name,category,price:5900,active:true})));
 if(p==='/api/pitches/summary')return {summary:{},data:[],success:true};
 if(p.includes('pitches'))return pitches;
 if(p.includes('get_appointments_range'))return appointments;
 if(p.includes('get_appointments')||p.includes('search_appointments'))return appointments;
 if(p.includes('get_roster'))return Array.from({length:28},(_,i)=>({id:i,date:dateAgo(-i),work_date:dateAgo(-i),staff_name:'แพทย์ตัวอย่าง',staff_id:'1',role:'doctor',column_id:1}));
 if(p==='/api/staffs')return [{id:'1',name:'แพทย์ตัวอย่าง',role:'doctor'},{id:'2',name:'พนักงานตัวอย่าง',role:'staff'}];
 if(p.includes('party_focus'))return p.includes('members')?{members:customers.slice(0,4).map(c=>({...c,customer_name:c.name,note:'สนใจบริการเดิม'}))}:{groups:[{id:'1',name:'ลูกค้าติดตามเดือนนี้',member_count:4}]};
 if(p==='/api/call_recommendations')return {should_call:customers.slice(0,3).map(c=>({...c,total:15900,reason:'ถึงรอบติดตามบริการ',reasons:['ถึงรอบติดตามบริการ'],priority:80})),comeback:[],success:true};
 if(p==='/api/sale_pending_summary')return {ar:[],vouchers:[],work:[],debtors:[],pending:[],success:true};
 if(p.includes('ar_summary'))return customers.slice(0,3).map(c=>({...c,balance:1500,last_tx_date:today}));
 if(p.includes('voucher_summary')||p.includes('work_summary'))return [];
 if(p.includes('customer_name_colors'))return {};
 if(p.includes('customer_profile/')){let c=customers[0];return {customer:c,sales:sales.filter(s=>s.opd===c.opd),pitches,profile:c};}
 if(p.includes('get_gallery'))return [];
 if(p.includes('search_customer'))return customers;
 return [];
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const report=[];
 const cases=[['dashboard','dashboard'],['sales','record_sales'],['customers','record_customer'],['analysis','customer_list'],['followup','crm'],['appointments','appointments']];
 for(const [key,template] of cases){
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,locale:'th-TH',timezoneId:'Asia/Bangkok'});
  await context.addInitScript(({customers,today})=>{localStorage.setItem('crm_intel_plan_draft_v3',JSON.stringify({date:today,defaultPromo:'ติดตามบริการเดิม',rows:customers.slice(0,3).map(c=>({opd:c.opd,customer_label:c.name+' — '+c.opd,outcome:'สนใจ',content:'สอบถามผลหลังรับบริการและนัดครั้งถัดไป'}))}));}, {customers,today});
  const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.pathname.startsWith('/api/'))return route.fulfill({json:api(req.url(),req)});
   if(u.hostname==='127.0.0.1'&&u.pathname==='/'+template)return route.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.join(root,template+'.html.txt'),'utf8')});
   if(/chart(\.umd)?(\.min)?\.js|chart\.js/.test(u.href))return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(require.resolve('chart.js/auto').replace(/auto[\\/]auto.cjs$/,'dist/chart.umd.js'),'utf8')});
   if(['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname))return route.continue();
   if(req.resourceType()==='image')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="#e6eeeb"/><circle cx="32" cy="24" r="10" fill="#a0b9ad"/><path d="M12 58a20 20 0 0140 0" fill="#a0b9ad"/></svg>'});
   return route.fulfill({contentType:'text/plain',body:''});
  });
  await page.goto('http://127.0.0.1:4173/'+template,{waitUntil:'networkidle'});
  await page.waitForTimeout(1200);
  if(template==='record_sales'){
   await page.locator('#opd').fill('0001');
   await page.waitForTimeout(350);
   await page.locator('select[name="item[]"]').first().selectOption('โบทอค');
   await page.locator('select[name="subitem[]"]').first().selectOption('Aestox 100 u');
   await page.locator('input[name="price[]"]').first().fill('5900');
   await page.locator('#amount').fill('5900');
   await page.locator('#note').fill('ตัวอย่างบันทึกบริการครั้งนี้');
  }
  if(template==='record_customer')await page.locator('#tabListBtn').click();
  if(template==='appointments')await page.locator('[data-tab="daily"]').click();
  if(template==='customer_list'&&await page.locator('#btnApply').count())await page.locator('#btnApply').click();
  if(template==='crm'){
   const tab=page.locator('[data-view="followup"]');if(await tab.count())await tab.first().click();
  }
  await page.waitForTimeout(500);
  const text=await page.locator('body').innerText();
  await sharp(await page.screenshot({fullPage:false})).webp({quality:86}).toFile(path.join(out,key+'.webp'));
  report.push({key,template,syntheticNamesVisible:text.includes('ลูกค้าตัวอย่าง'),errors,text:text.slice(0,5500)});
  await context.close();
 }
 fs.writeFileSync(path.join(out,'capture-report.json'),JSON.stringify(report,null,2));
 await browser.close();
})();
