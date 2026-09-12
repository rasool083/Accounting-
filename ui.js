"use strict";
function toast(msg,type,ms){
  type=type||"";ms=ms||2200;
  var el=document.createElement("div");
  el.className="t "+type;el.textContent=msg;
  document.getElementById("toast").appendChild(el);
  setTimeout(function(){el.style.transition=".25s";el.style.opacity="0";setTimeout(function(){el.remove()},250)},ms)
}
function modal(title,bodyHTML,actions){
  var ov=document.createElement("div");
  ov.className="mod";
  ov.innerHTML='<div class="mod-box"><div class="mod-hd"><h3>'+esc(title)+'</h3><button class="btn ic g" data-close>✕</button></div><div class="mod-bd">'+bodyHTML+'</div><div class="mod-ft"></div></div>';
  document.body.appendChild(ov);
  var ft=ov.querySelector(".mod-ft");
  (actions||[]).forEach(function(a){
    var b=document.createElement("button");
    b.className="btn "+(a.cls||"");
    b.textContent=a.label;
    b.addEventListener("click",function(){
      var r=a.click?a.click(ov):true;
      if(r!==false)ov.remove()
    });
    ft.appendChild(b)
  });
  ov.querySelector("[data-close]").addEventListener("click",function(){ov.remove()});
  ov.addEventListener("click",function(e){if(e.target===ov)ov.remove()});
  return ov
}
function confirmBox(msg,cb){
  modal("تأیید",'<p style="font-size:13px;line-height:1.9">'+esc(msg)+'</p>',[
    {label:"انصراف",cls:"g",click:function(){cb(false)}},
    {label:"تأیید",cls:"r",click:function(){cb(true)}}
  ])
}
var TABS=[
  {id:"dashboard",label:"داشبورد",icon:"📊"},
  {id:"people",label:"اشخاص",icon:"👥"},
  {id:"products",label:"کالاها",icon:"📦"},
  {id:"prices",label:"قیمت‌ها",icon:"💰"},
  {id:"sales",label:"فروش",icon:"🧾"},
  {id:"receipts",label:"دریافت‌ها",icon:"💵"},
  {id:"statement",label:"حساب جاری",icon:"📋"},
  {id:"month",label:"بستن ماه",icon:"📅"},
  {id:"audit",label:"رویدادها",icon:"🔐"},
  {id:"backup",label:"پشتیبان",icon:"💾"},
  {id:"settings",label:"تنظیمات",icon:"⚙️"}
];
var currentTab="dashboard";
function renderNav(){
  var nav=document.getElementById("nav");
  nav.innerHTML=TABS.map(function(t){
    return '<button data-t="'+t.id+'" class="'+(t.id===currentTab?"on":"")+'">'+t.icon+" "+t.label+"</button>"
  }).join("");
  nav.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click",function(){currentTab=b.dataset.t;render()})
  })
}
function render(){
  renderNav();
  var main=document.getElementById("main");
  var map={dashboard:renderDashboard,people:renderPeople,products:renderProducts,prices:renderPrices,sales:renderSales,receipts:renderReceipts,statement:renderStatement,month:renderMonth,audit:renderAudit,backup:renderBackup,settings:renderSettings};
  try{main.innerHTML=(map[currentTab]||renderDashboard)()}
  catch(e){main.innerHTML='<div class="bx"><div class="em">خطا: '+esc(e.message)+"</div></div>"}
}
function renderDashboard(){
  var s=DB.sales,r=DB.receipts;
  var totalSales=0,totalReceipts=0;
  for(var i=0;i<s.length;i++)totalSales+=(s[i].amount||0);
  for(var i=0;i<r.length;i++)if(r[i].status!=="باطل"&&r[i].status!=="برگشتی")totalReceipts+=(r[i].amount||0);
  var balance=totalSales-totalReceipts,totalInt=0;
  DB.people.filter(function(p){return p.role==="customer"}).forEach(function(c){totalInt+=customerSummary(c.id).interest});
  return '<div class="kpi"><div class="k p"><div class="l">کل فروش</div><div class="v">'+fmt(totalSales)+'</div></div>'
    +'<div class="k s"><div class="l">دریافت مؤثر</div><div class="v">'+fmt(totalReceipts)+'</div></div>'
    +'<div class="k d"><div class="l">مانده مطالبات</div><div class="v">'+fmt(balance)+'</div></div>'
    +'<div class="k w"><div class="l">سود دیرکرد</div><div class="v">'+fmt(totalInt)+'</div></div></div>'
    +'<div class="bx"><h3>آمار کلی</h3>'
    +'<div class="info-line"><b>اشخاص</b><span>'+DB.people.length+'</span></div>'
    +'<div class="info-line"><b>کالاها</b><span>'+DB.products.length+'</span></div>'
    +'<div class="info-line"><b>قیمت‌ها</b><span>'+DB.prices.length+'</span></div>'
    +'<div class="info-line"><b>فاکتورها</b><span>'+DB.sales.length+'</span></div>'
    +'<div class="info-line"><b>دریافت‌ها</b><span>'+DB.receipts.length+'</span></div></div>'
}
function renderPeople(){
  var filter=window._peopleFilter||"customer";
  var list=DB.people.filter(function(p){return p.role===filter});
  return '<div class="tabs-l2"><button data-f="customer" class="'+(filter==="customer"?"on":"")+'">مشتریان</button><button data-f="supplier" class="'+(filter==="supplier"?"on":"")+'">تأمین‌کنندگان</button></div>'
    +'<div class="bx"><h3>افزودن شخص</h3><div class="row">'
    +'<div><label>نام *</label><input id="pName"></div>'
    +'<div><label>شرکت</label><input id="pCompany"></div>'
    +'<div><label>تلفن</label><input id="pPhone"></div></div>'
    +'<div class="actions"><button class="btn s" id="addPersonBtn">➕ افزودن</button></div></div>'
    +'<div class="bx"><h3>لیست <span class="cnt">'+list.length+'</span></h3>'
    +(list.length===0?'<div class="em">خالی</div>':'<div class="tbl-wrap"><table><thead><tr><th>نام</th><th>شرکت</th><th>تلفن</th><th></th></tr></thead><tbody>'
      +list.map(function(p){return '<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.company||"—")+'</td><td class="num">'+esc(p.phone||"—")+'</td><td><button class="btn ic r" data-del="'+p.id+'">✕</button></td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderProducts(){
  return '<div class="bx"><h3>افزودن کالا</h3><div class="row">'
    +'<div><label>نام *</label><input id="prName"></div>'
    +'<div><label>واحد پایه</label><input id="prUnit" value="عدد"></div>'
    +'<div><label>واحد بسته</label><input id="prPkg" value="کارتن"></div>'
    +'<div><label>تعداد در بسته</label><input id="prPpp" type="number" value="1"></div></div>'
    +'<div class="actions"><button class="btn s" id="addProductBtn">➕ افزودن</button></div></div>'
    +'<div class="bx"><h3>لیست <span class="cnt">'+DB.products.length+'</span></h3>'
    +(DB.products.length===0?'<div class="em">خالی</div>':'<div class="tbl-wrap"><table><thead><tr><th>نام</th><th>واحد</th><th>در بسته</th><th></th></tr></thead><tbody>'
      +DB.products.map(function(p){return '<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.unit||"")+'</td><td class="num">'+(p.ppp||1)+'</td><td><button class="btn ic r" data-del-product="'+p.id+'">✕</button></td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderPrices(){
  var list=DB.prices.slice().sort(function(a,b){return String(b.effectiveDate||"").localeCompare(String(a.effectiveDate||""))});
  return '<div class="bx"><h3>ثبت قیمت جدید</h3><div class="row">'
    +'<div><label>کالا</label><select id="prdProd">'+DB.products.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>'}).join("")+'</select></div>'
    +'<div><label>قیمت هر عدد</label><input id="prdPrice" type="number"></div>'
    +'<div><label>تاریخ اعتبار</label><input id="prdDate" value="'+todayJ()+'"></div></div>'
    +'<div class="actions"><button class="btn s" id="addPriceBtn">➕ ثبت قیمت</button></div></div>'
    +'<div class="bx"><h3>تاریخچه <span class="cnt">'+list.length+'</span></h3>'
    +(list.length===0?'<div class="em">خالی</div>':'<div class="tbl-wrap"><table><thead><tr><th>کالا</th><th>قیمت</th><th>تاریخ</th><th></th></tr></thead><tbody>'
      +list.map(function(x){var p=DB.getProduct(x.productId);return '<tr><td>'+esc(p?p.name:"—")+'</td><td class="num"><b>'+fmt(x.price)+'</b></td><td class="num">'+esc(x.effectiveDate||"")+'</td><td><button class="btn ic r" data-del-price="'+x.id+'">✕</button></td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderSales(){
  var list=DB.sales.slice().sort(function(a,b){return String(b.createdAt||"").localeCompare(String(a.createdAt||""))});
  return '<div class="bx"><h3>فاکتور فروش جدید</h3><div class="row">'
    +'<div><label>مشتری</label><select id="saleCust">'+DB.people.filter(function(p){return p.role==="customer"}).map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join("")+'</select></div>'
    +'<div><label>کالا</label><select id="saleProd">'+DB.products.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>'}).join("")+'</select></div>'
    +'<div><label>واحد</label><select id="saleUnit"><option>عدد</option><option>کارتن</option></select></div>'
    +'<div><label>مقدار</label><input id="saleQty" type="number" value="1"></div></div>'
    +'<div class="row"><div><label>تعداد کل عدد</label><input id="salePieces" readonly></div>'
    +'<div><label>قیمت هر عدد</label><input id="salePrice" type="number" value="0"></div>'
    +'<div><label>مبلغ کل</label><input id="saleTotal" readonly></div>'
    +'<div><label>تاریخ</label><input id="saleDate" value="'+todayJ()+'"></div></div>'
    +'<div class="actions"><button class="btn s" id="addSaleBtn">➕ ثبت فاکتور</button></div></div>'
    +'<div class="bx"><h3>فاکتورها <span class="cnt">'+list.length+'</span></h3>'
    +(list.length===0?'<div class="em">خالی</div>':'<div class="tbl-wrap"><table><thead><tr><th>تاریخ</th><th>مشتری</th><th>مبلغ</th><th></th></tr></thead><tbody>'
      +list.map(function(x){var c=DB.getCustomer(x.customerId);return '<tr><td class="num">'+esc(x.jDate||"")+'</td><td>'+esc(c?c.name:"—")+'</td><td class="num"><b>'+fmt(x.amount)+'</b></td><td><button class="btn ic r" data-del-sale="'+x.id+'">✕</button></td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderReceipts(){
  var list=DB.receipts.slice().sort(function(a,b){return String(b.createdAt||"").localeCompare(String(a.createdAt||""))});
  return '<div class="bx"><h3>ثبت دریافت</h3><div class="row">'
    +'<div><label>مشتری</label><select id="recCust">'+DB.people.filter(function(p){return p.role==="customer"}).map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join("")+'</select></div>'
    +'<div><label>نوع</label><select id="recType"><option>نقد</option><option>چک</option><option>کارت</option></select></div>'
    +'<div><label>مبلغ</label><input id="recAmount" type="number"></div></div>'
    +'<div class="row"><div><label>تاریخ</label><input id="recDate" value="'+todayJ()+'"></div>'
    +'<div><label>سررسید</label><input id="recDue"></div>'
    +'<div><label>وضعیت</label><select id="recStatus"><option>وصول شده</option><option>نزد ما</option><option>تودیع‌شده</option><option>برگشتی</option><option>باطل</option></select></div></div>'
    +'<div class="actions"><button class="btn s" id="addReceiptBtn">➕ ثبت</button></div></div>'
    +'<div class="bx"><h3>دریافت‌ها <span class="cnt">'+list.length+'</span></h3>'
    +(list.length===0?'<div class="em">خالی</div>':'<div class="tbl-wrap"><table><thead><tr><th>تاریخ</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody>'
      +list.map(function(x){var c=DB.getCustomer(x.customerId);var cls={"وصول شده":"s","نزد ما":"i","تودیع‌شده":"i","برگشتی":"d","باطل":"m"}[x.status]||"m";return '<tr><td class="num">'+esc(x.jDate||"")+'</td><td>'+esc(c?c.name:"—")+'</td><td class="num"><b>'+fmt(x.amount)+'</b></td><td><span class="tag '+cls+'">'+esc(x.status||"")+'</span></td><td><button class="btn ic r" data-del-receipt="'+x.id+'">✕</button></td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderStatement(){
  var customers=DB.people.filter(function(p){return p.role==="customer"});
  if(!customers.length)return '<div class="bx"><div class="em">ابتدا مشتری اضافه کنید</div></div>';
  var sel=window._stmtCustomer||customers[0].id;window._stmtCustomer=sel;
  var calcDate=window._stmtDate||todayJ();window._stmtDate=calcDate;
  var f=fifo(sel,calcDate);
  var totalSales=0,totalReceipts=0;
  DB.sales.filter(function(s){return s.customerId===sel}).forEach(function(s){totalSales+=(s.amount||0)});
  DB.receipts.filter(function(r){return r.customerId===sel&&r.status!=="باطل"&&r.status!=="برگشتی"}).forEach(function(r){totalReceipts+=(r.amount||0)});
  return '<div class="bx"><h3>صورت‌حساب</h3><div class="row">'
    +'<div><label>مشتری</label><select id="stmtSel">'+customers.map(function(c){return '<option value="'+c.id+'" '+(c.id===sel?"selected":"")+'>'+esc(c.name)+'</option>'}).join("")+'</select></div>'
    +'<div><label>تاریخ محاسبه</label><input id="stmtDate" value="'+calcDate+'"></div></div></div>'
    +'<div class="kpi"><div class="k p"><div class="l">فروش اصل</div><div class="v">'+fmt(totalSales)+'</div></div>'
    +'<div class="k s"><div class="l">دریافت</div><div class="v">'+fmt(totalReceipts)+'</div></div>'
    +'<div class="k d"><div class="l">مانده</div><div class="v">'+fmt(f.totalRem)+'</div></div>'
    +'<div class="k v"><div class="l">ارزش تسویه</div><div class="v">'+fmt(f.totalSV)+'</div></div>'
    +'<div class="k w"><div class="l">سود دیرکرد</div><div class="v">'+fmt(f.totalInt)+'</div></div>'
    +'<div class="k s"><div class="l">اعتبار</div><div class="v">'+fmt(f.credit)+'</div></div></div>'
    +'<div class="bx"><h3>موتور FIFO + سود پله‌ای</h3>'
    +(f.alloc.length===0?'<div class="em">فاکتوری نیست</div>':'<div class="tbl-wrap"><table><thead><tr><th>تاریخ</th><th>اصل</th><th>مانده</th><th>روز</th><th>ضریب</th><th>ارزش</th><th>سود</th></tr></thead><tbody>'
      +f.alloc.map(function(a){return '<tr><td class="num">'+esc(a.sale.jDate||"")+'</td><td class="num">'+fmt(a.orig)+'</td><td class="num">'+fmt(a.remaining)+'</td><td class="num">'+a.days+'</td><td class="num">'+a.mult.toFixed(3)+'</td><td class="num">'+fmt(a.settlement)+'</td><td class="num" style="color:#dc2626">'+fmt(a.interest)+'</td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderMonth(){
  var months={};
  DB.sales.forEach(function(s){
    var mk=monthKey(s.jDate);if(!mk)return;
    if(!months[mk])months[mk]={sales:0,receipts:0,salesCount:0};
    months[mk].sales+=(s.amount||0);months[mk].salesCount++
  });
  var custIds={};
  DB.receipts.filter(function(r){return r.status!=="باطل"&&r.status!=="برگشتی"}).forEach(function(r){custIds[r.customerId]=1});
  Object.keys(custIds).forEach(function(cid){
    var sales=DB.sales.filter(function(s){return s.customerId===cid}).sort(function(a,b){return String(a.jDate||"").localeCompare(String(b.jDate||""))});
    var receipts=DB.receipts.filter(function(r){return r.customerId===cid&&r.status!=="باطل"&&r.status!=="برگشتی"}).sort(function(a,b){return String(a.jDate||"").localeCompare(String(b.jDate||""))});
    var alloc=sales.map(function(s){return {s:s,rem:s.amount}});
    receipts.forEach(function(r){
      var rem=r.amount;
      alloc.forEach(function(a){
        if(rem<=0)return;
        if(a.rem<=0)return;
        if(String(a.s.jDate||"")>String(r.jDate||""))return;
        var take=Math.min(rem,a.rem);a.rem-=take;rem-=take;
        var mk=monthKey(a.s.jDate);
        if(mk){if(!months[mk])months[mk]={sales:0,receipts:0,salesCount:0};months[mk].receipts+=take}
      })
    })
  });
  var keys=Object.keys(months).sort();
  return '<div class="bx"><h3>بستن ماه</h3>'
    +(keys.length===0?'<div class="em">داده‌ای نیست</div>':'<div class="tbl-wrap"><table><thead><tr><th>ماه</th><th>فروش</th><th>دریافت</th><th>مانده</th><th>درصد</th></tr></thead><tbody>'
      +keys.map(function(k){var m=months[k];var pct=m.sales>0?((m.receipts/m.sales)*100).toFixed(1):"0";return '<tr><td class="num">'+k+'</td><td class="num">'+fmt(m.sales)+'</td><td class="num">'+fmt(m.receipts)+'</td><td class="num">'+fmt(m.sales-m.receipts)+'</td><td class="num">'+pct+'%</td></tr>'}).join("")
      +'</tbody></table></div>')+'</div>'
}
function renderAudit(){
  var list=DB.audit.slice().reverse().slice(0,200);
  return '<div class="bx"><h3>رویدادها <span class="cnt">'+list.length+'</span></h3>'
    +(list.length===0?'<div class="em">خالی</div>':'<div class="tbl-wrap"><table><thead><tr><th>زمان</th><th>عملیات</th><th>جدول</th></tr></thead><tbody>'
      +list.map(function(x){return '<tr><td style="font-size:10px">'+esc(x.at||"")+'</td><td>'+esc(x.action||"")+'</td><td>'+esc(x.table||"")+'</td></tr>'}).join("")
      +'</tbody></table></div>')+'<div class="actions"><button class="btn r" id="clearAuditBtn">پاک کردن</button></div></div>'
}
function renderBackup(){
  return '<div class="bx"><h3>پشتیبان‌گیری</h3>'
    +'<div class="actions"><button class="btn s" id="expJsonBtn">📥 خروجی JSON</button><button class="btn g" id="impJsonBtn">📤 بازیابی</button><input type="file" id="impFile" accept=".json" style="display:none"><button class="btn r" id="wipeAllBtn">🗑 پاک کردن همه</button></div></div>'
    +'<div class="bx"><h3>خروجی CSV</h3><div class="actions">'
    +'<button class="btn g" data-csv="sales">فروش</button>'
    +'<button class="btn g" data-csv="receipts">دریافت‌ها</button>'
    +'<button class="btn g" data-csv="people">اشخاص</button>'
    +'<button class="btn g" data-csv="products">کالاها</button>'
    +'<button class="btn g" data-csv="prices">قیمت‌ها</button>'
    +'<button class="btn g" data-csv="statement">حساب جاری</button></div></div>'
    +'<div class="bx"><h3>وضعیت</h3>'
    +'<div class="info-line"><b>اشخاص</b><span>'+DB.people.length+'</span></div>'
    +'<div class="info-line"><b>کالاها</b><span>'+DB.products.length+'</span></div>'
    +'<div class="info-line"><b>فروش</b><span>'+DB.sales.length+'</span></div>'
    +'<div class="info-line"><b>دریافت</b><span>'+DB.receipts.length+'</span></div></div>'
}
function renderSettings(){
  var s=DB.settings;
  return '<div class="bx"><h3>تنظیمات عمومی</h3><div class="row">'
    +'<div><label>واحد پول</label><input id="setCurrency" value="'+esc(s.currency)+'"></div>'
    +'<div><label>مبنای روزشمار</label><input id="setBasis" type="number" value="'+s.dayBasis+'"></div>'
    +'<div><label>مهلت تشویقی</label><input id="setGrace" type="number" value="'+s.graceDays+'"></div></div>'
    +'<div class="actions"><button class="btn s" id="saveGeneralBtn">💾 ذخیره</button></div></div>'
    +'<div class="bx"><h3>پله‌های سود دیرکرد</h3><div class="tbl-wrap"><table><thead><tr><th>سقف روز</th><th>نرخ</th><th></th></tr></thead><tbody>'
    +s.tiers.map(function(t,i){return '<tr><td class="num">'+(t.maxDays>=9999?"∞":t.maxDays)+'</td><td class="num">'+(t.rate*100).toFixed(2)+'%</td><td><button class="btn ic r" data-del-tier="'+i+'">✕</button></td></tr>'}).join("")
    +'</tbody></table></div><div class="actions"><button class="btn s" id="addTierBtn">➕ افزودن پله</button></div></div>'
    +'<div class="bx"><h3>رمز عبور</h3><div class="row"><div><label>رمز</label><input id="setPin" value="'+esc(s.pin||"")+'" maxlength="12"></div></div>'
    +'<div class="actions"><button class="btn s" id="savePinBtn">💾 ذخیره رمز</button></div></div>'
}
function addPerson(){
  var name=document.getElementById("pName").value.trim();
  if(!name)return toast("نام الزامی","d");
  var role=window._peopleFilter||"customer";
  var person={id:uid("P-"),role:role,name:name,company:document.getElementById("pCompany").value.trim(),phone:document.getElementById("pPhone").value.trim(),createdAt:todayISO()};
  DB.people.push(person);DB.save("people");DB.auditLog("CREATE","people",person.id);
  toast("ثبت شد","s");render()
}
function delPerson(id){confirmBox("حذف شود؟",function(ok){if(!ok)return;DB.people=DB.people.filter(function(x){return x.id!==id});DB.save("people");DB.auditLog("DELETE","people",id);toast("حذف","s");render()})}
function addProduct(){
  var name=document.getElementById("prName").value.trim();
  if(!name)return toast("نام الزامی","d");
  var p={id:uid("K-"),name:name,unit:document.getElementById("prUnit").value.trim()||"عدد",pkg:document.getElementById("prPkg").value.trim()||"کارتن",ppp:parseN(document.getElementById("prPpp").value)||1,createdAt:todayISO()};
  DB.products.push(p);DB.save("products");DB.auditLog("CREATE","products",p.id);
  toast("ثبت","s");render()
}
function delProduct(id){confirmBox("حذف شود؟",function(ok){if(!ok)return;DB.products=DB.products.filter(function(x){return x.id!==id});DB.save("products");toast("حذف","s");render()})}
function addPrice(){
  var productId=document.getElementById("prdProd").value;
  var price=parseN(document.getElementB
