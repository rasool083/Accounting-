"use strict";
var SK="ACC_";
var Store={
  get:function(k,def){try{var r=localStorage.getItem(SK+k);return r?JSON.parse(r):def}catch(e){return def}},
  set:function(k,v){try{localStorage.setItem(SK+k,JSON.stringify(v));return true}catch(e){toast("خطا در ذخیره","d",4000);return false}},
  remove:function(k){try{localStorage.removeItem(SK+k)}catch(e){}}
};
function uid(p){return (p||"")+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}
function fmt(n){n=parseFloat(n)||0;return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,",")}
function parseN(s){return parseFloat(String(s||"").replace(/[,\s٬]/g,""))||0}
function todayISO(){return new Date().toISOString().slice(0,19).replace("T"," ")}
function p2(n){return n<10?"0"+n:""+n}
function dv(a,b){return Math.floor(a/b)}
function g2j(gy,gm,gd){return window.DateEngine?DateEngine.g2j(gy,gm,gd):(function(){var m=[0,31,59,90,120,151,181,212,243,273,304,334],jy=(gy<=1600)?0:979;gy-=(gy<=1600)?621:1600;var gy2=gm>2?gy+1:gy,d=365*gy+dv(gy2+3,4)-dv(gy2+99,100)+dv(gy2+399,400)-80+gd+m[gm-1];jy+=33*dv(d,12053);d%=12053;jy+=4*dv(d,1461);d%=1461;if(d>365){jy+=dv(d-1,365);d=(d-1)%365}var jm=d<186?1+dv(d,31):7+dv(d-186,30),jd=1+(d<186?d%31:(d-186)%30);return [jy,p2(jm),p2(jd)]})()}
function j2g(jy,jm,jd){return window.DateEngine?DateEngine.j2g(jy,jm,jd):null}
function todayJ(){var d=new Date();return g2j(d.getFullYear(),d.getMonth()+1,d.getDate()).join("/")}
function parseJ(s){return window.DateEngine?DateEngine.parseJ(s):String(s||"").split(/[\/-]/).map(Number)}
function diffJ(a,b){return window.DateEngine?DateEngine.diffJ(a,b):0}
function monthKey(jStr){var p=parseJ(jStr);return p&&p.length===3?p[0]+"/"+p[1]:""}
var DB={
  people:[],products:[],prices:[],sales:[],receipts:[],payments:[],checks:[],purchases:[],saleReturns:[],purchaseReturns:[],accounts:[],transfers:[],expenses:[],incomes:[],adjustments:[],audit:[],
  warehouses:[],inventoryMovements:[],productions:[],paymentPackages:[],treasuryAccounts:[],settings:null,
  load:function(){
    var state=window.Repository?Repository.loadAll():null;
    this.people=state?state.people:Store.get("people",[]);this.products=state?state.products:Store.get("products",[]);this.prices=state?state.prices:Store.get("prices",[]);this.sales=state?state.sales:Store.get("sales",[]);this.receipts=state?state.receipts:Store.get("receipts",[]);this.payments=state?state.payments:Store.get("payments",[]);this.checks=state?state.checks:Store.get("checks",[]);this.purchases=state?state.purchases:Store.get("purchases",[]);this.saleReturns=state?state.saleReturns:Store.get("saleReturns",[]);this.purchaseReturns=state?state.purchaseReturns:Store.get("purchaseReturns",[]);this.accounts=state?state.accounts:Store.get("accounts",[]);this.transfers=state?state.transfers:Store.get("transfers",[]);this.expenses=state?state.expenses:Store.get("expenses",[]);this.incomes=state?state.incomes:Store.get("incomes",[]);this.adjustments=state?state.adjustments:Store.get("adjustments",[]);this.audit=state?state.audit.slice(-500):Store.get("audit",[]).slice(-500);this.settings=(state&&state.settings)||Store.get("settings",null)||this.defaultSettings();
    this.warehouses=Store.get("warehouses",[{id:"WH-RM",name:"مواد اولیه",type:"مواد اولیه",active:true,notes:""},{id:"WH-FG",name:"محصول تولیدی",type:"محصول تولیدی",active:true,notes:""},{id:"WH-TR",name:"بازرگانی",type:"بازرگانی",active:true,notes:""}]);
    this.inventoryMovements=Store.get("inventoryMovements",[]);this.productions=Store.get("productions",[]);this.paymentPackages=Store.get("paymentPackages",this.settings.paymentPackages||[]);this.treasuryAccounts=Store.get("treasuryAccounts",this.accounts||[]);
  },
  save:function(what){
    if(what===undefined){["people","products","prices","sales","receipts","payments","checks","purchases","saleReturns","purchaseReturns","accounts","transfers","expenses","incomes","adjustments","audit","warehouses","inventoryMovements","productions","paymentPackages","treasuryAccounts","settings"].forEach(function(k){Store.set(k,DB[k])});return true}
    if(Array.isArray(this[what]))return window.Repository&&["people","products","prices","sales","receipts","payments","checks","purchases","saleReturns","purchaseReturns","accounts","transfers","expenses","incomes","adjustments","audit"].indexOf(what)>=0?Repository.save(what,this[what]):Store.set(what,this[what]);
    if(what==="settings")return Store.set("settings",this.settings)
  },
  defaultSettings:function(){return {currency:"ریال",dayBasis:30,graceDays:30,pin:"",tiers:[{id:"t1",maxDays:30,rate:0,active:true},{id:"t2",maxDays:60,rate:.06,active:true},{id:"t3",maxDays:120,rate:.10,active:true},{id:"t4",maxDays:9999,rate:.15,active:true}]}},
  auditLog:function(action,table,recordId,note){this.audit.push({id:uid("A"),at:todayISO(),action:action,table:table,recordId:recordId||"",note:note||""});this.audit=this.audit.slice(-500);this.save("audit")},
  getCustomer:function(id){return this.people.find(function(p){return p.id===id})},
  getProduct:function(id){return this.products.find(function(p){return p.id===id})},
  currentPrice:function(productId,atDate){var target=atDate||todayJ(),best=null;for(var i=0;i<this.prices.length;i++){var p=this.prices[i];if(p.productId!==productId||String(p.effectiveDate||"")>String(target))continue;if(!best||String(p.effectiveDate||"")>String(best.effectiveDate||""))best=p}return best}
};
function getMultiplier(days,tiers,basis){return window.Finance?Finance.getMultiplier(days,tiers,basis):1}
function fifo(customerId,calcDate){return window.Finance?Finance.fifo({customerId:customerId,calcDate:calcDate,settings:DB.settings,sales:DB.sales,receipts:DB.receipts}):{alloc:[],credit:0,totalInt:0,totalRem:0,totalSV:0,totalOrig:0}}
function customerSummary(id){return window.Finance?Finance.customerSummary({customerId:id,calcDate:todayJ(),settings:DB.settings,sales:DB.sales,receipts:DB.receipts}):{totalSales:0,totalReceipts:0,balance:0,credit:0,interest:0,engine:null}}
DB.getPerson=DB.getCustomer;DB.todayJ=todayJ;
Object.defineProperty(DB,"state",{configurable:true,get:function(){return {people:DB.people,products:DB.products,prices:DB.prices,sales:DB.sales,receipts:DB.receipts,payments:DB.payments,checks:DB.checks,purchases:DB.purchases,saleReturns:DB.saleReturns,purchaseReturns:DB.purchaseReturns,accounts:DB.accounts,transfers:DB.transfers,expenses:DB.expenses,incomes:DB.incomes,adjustments:DB.adjustments,audit:DB.audit,settings:DB.settings,warehouses:DB.warehouses,inventoryMovements:DB.inventoryMovements,productions:DB.productions,paymentPackages:DB.paymentPackages,treasuryAccounts:DB.treasuryAccounts}});
