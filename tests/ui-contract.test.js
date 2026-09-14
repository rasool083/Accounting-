const test=require('node:test');const assert=require('node:assert/strict');
function salesTotal(unitPrice,unit,qty,unitsPerPackage){return (Number(unitPrice)||0)*(Number(qty)||0)*(unit==='package'?(Number(unitsPerPackage)||1):1)}
function netTotal(gross,discount){return Math.max(0,(Number(gross)||0)-(Number(discount)||0))}
function rowState(r){if(r.returned||r.status==='برگشتی')return 'returned';if(r.status==='وصول شده')return 'collected';return r.type==='پرداخت'?'paid':'received'}
test('کارتن با قیمت پایه هر قطعه محاسبه می‌شود',()=>assert.equal(salesTotal(100000,'package',1,36),3600000));
test('فروش واحد پایه مستقیم محاسبه می‌شود',()=>assert.equal(salesTotal(100000,'base',2,36),200000));
test('تخفیف از مبلغ نهایی کم می‌شود',()=>assert.equal(netTotal(5000000,3000000),2000000));
test('برگشتی اولویت رنگی دارد',()=>assert.equal(rowState({returned:true,status:'وصول شده'}),'returned'));
test('وصول شده سبز است',()=>assert.equal(rowState({status:'وصول شده'}),'collected'));
