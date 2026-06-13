Traffic Fixer Thailand - GitHub Ready Package

วิธีเปิดเล่นบนคอม
1) เปิดไฟล์ index.html ด้วย Chrome / Edge / Safari

วิธีอัปขึ้น GitHub Pages
1) แตกไฟล์ ZIP
2) อัปไฟล์ทั้งหมดในโฟลเดอร์ traffic_fixer_thailand ไปที่ root ของ repository
3) เข้า Settings > Pages
4) เลือก Deploy from a branch
5) เลือก branch main และ folder /root
6) รอ GitHub สร้างลิงก์ แล้วเปิดเล่นได้จาก Safari/Chrome

ไฟล์สำคัญ
- index.html : ไฟล์เกมหลัก รวม CSS/JavaScript ในไฟล์เดียว
- ipad_singlefile.html : ไฟล์เดี่ยวสำหรับส่งเข้า iPad หรือเปิดผ่าน Safari
- .nojekyll : ช่วยให้ GitHub Pages เสิร์ฟไฟล์ตรง ๆ

หมายเหตุเวอร์ชันนี้
- iPad ลากนิ้วเพื่อสร้างถนนได้เมื่อเลือกเครื่องมือถนน
- มือเปล่าลากแผนที่ได้ และจีบ 2 นิ้วเพื่อซูมได้
- รถเข้าอาคารที่ drop-off node หน้าอาคารแล้วถือว่าเข้าอาคารสำเร็จ ไม่ค้างหน้าอาคาร
- รถกลับรถได้เฉพาะ 4 แยก และปลายถนน/ทางตันเมื่อถนนขาด
- ถ้าถนนขาด รถจะพยายามกลับบ้านแทนการค้างถาวร


git status
git add .
git commit -m "Update sumogame"
git push