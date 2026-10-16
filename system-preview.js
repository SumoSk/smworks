'use strict';
(() => {
 const screens=[{"key":"dashboard","name":"แดชบอร์ด","title":"เห็นยอดขายและงานที่ต้องดูแลในหน้าเดียว","desc":"ดูยอดขายตามช่วงเวลา นัดหมาย และรายการที่ต้องติดตามจากข้อมูลที่ทีมบันทึก"},{"key":"sales","name":"บันทึกยอดขาย","title":"เลือกลูกค้า เพิ่มบริการ แล้วบันทึกยอด","desc":"บันทึกสินค้าและบริการ ราคา ส่วนลด ยอดชำระ และเปิดดูรายการย้อนหลัง"},{"key":"customers","name":"ข้อมูลลูกค้า","title":"ค้นหาลูกค้า แล้วเปิดข้อมูลคนเดิมทำงานต่อ","desc":"ดูชื่อ ช่องทางติดต่อ และข้อมูลลูกค้า โดยไม่ต้องสร้างประวัติใหม่ทุกครั้ง"},{"key":"analysis","name":"วิเคราะห์ลูกค้า","title":"ดูยอดซื้อและเลือกกลุ่มที่จะติดต่อ","desc":"ดูยอดซื้อสะสม ความถี่ และวันที่มาล่าสุด เพื่อเลือกกลุ่มลูกค้าจากข้อมูลจริง"},{"key":"followup","name":"Follow up","title":"ตามผลหลังบริการ พร้อมบันทึกสิ่งที่ต้องดูแลต่อ","desc":"บันทึกผลติดตาม คะแนน และหมายเหตุ รวมถึงรายการที่ต้องให้หมอดู"},{"key":"appointments","name":"ตารางนัด","title":"เปิดตารางแล้วเห็นว่าใครนัดทำอะไร เวลาไหน","desc":"พนักงานบันทึกวัน เวลา ลูกค้า และบริการ แก้หรือยกเลิกนัดได้จากตาราง"}];
 const tabs=[...document.querySelectorAll('[data-system-preview]')],image=document.getElementById('system-preview-image'),dialog=document.getElementById('system-preview-dialog'),large=document.getElementById('system-preview-large');
 if(!tabs.length||!image||!dialog)return;
 let current=screens[0],opener=null;
 function select(button,focus=false){
  current=screens.find(s=>s.key===button.dataset.systemPreview)||screens[0];
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===button));t.tabIndex=t===button?0:-1});
  image.src='assets/system-preview/'+current.key+'.webp?v=20261017';
  image.alt=current.name+'จากหน้าระบบคลินิก โดยใช้ข้อมูลสมมติ';
  document.getElementById('system-preview-image-button').setAttribute('aria-label','ขยายภาพ'+current.name);
  document.getElementById('system-preview-title').textContent=current.title;
  document.getElementById('system-preview-description').textContent=current.desc;
  document.getElementById('system-preview-panel').setAttribute('aria-labelledby',button.id);
  if(focus)button.focus();
 }
 tabs.forEach((button,index)=>{
  button.addEventListener('click',()=>select(button));
  button.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight')next=(index+1)%tabs.length;
   else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=tabs.length-1;
   else return;
   event.preventDefault();select(tabs[next],true);
  });
 });
 function open(event){
  opener=event.currentTarget;
  large.src=image.src;large.alt=image.alt;
  document.getElementById('system-preview-dialog-title').textContent=current.name+' · ข้อมูลสมมติ';
  dialog.showModal();
  document.documentElement.classList.add('system-preview-open');
 }
 document.getElementById('system-preview-enlarge').addEventListener('click',open);
 document.getElementById('system-preview-image-button').addEventListener('click',open);
 document.getElementById('system-preview-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{document.documentElement.classList.remove('system-preview-open');opener?.focus()});
})();