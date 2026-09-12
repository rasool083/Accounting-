"use strict";
var SK="ACC_";
var Store={
  get:function(k,def){try{var r=localStorage.getItem(SK+k);return r?JSON.parse(r):def}catch(e){return def}},
  set:function(k,v){try{localStorage.setItem(SK+k,JSON.stringify(v));return true}catch(e){toast("خطا در ذخیره","d",4000);return false}},
  remove:function(k){try{localStorage.removeItem(SK+k)}catch(e){}}
};
function uid(p){return (p||"")+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function fmt(n){n=parseFloat(n)||0;return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,",")}
function parseN(s){return parseFloat(String(s||"").replace(/[,\s٬]/g,""))||0}
function todayISO(){return new Date().toISOString().slice(0,19).replace("T"," ")}
function p2(n){return n<10?"0"+n:""+n}
function dv(a,b){return Math.floor(a/b)}
function g2j(gy,gm,gd){
  var m=[0,31,59,90,120,151,181,212,243,273,304,334];
  var jy=(gy<=1600)?0:979;gy-=(gy<=1600)?621:1600;
  var gy2=(gm>2)?(gy+1):gy;
  var d=(365*gy)+dv(gy2+3,4)-dv(gy2+99,100)+dv(gy2+399,400)-80+gd+m[gm-1];
  jy+=33*dv(d,12053);d%=12053;jy+=4*dv(d,1461);d%=1461;
  if(d>365){jy+=dv(d-1,365);d=(d-1)%365}
  var jm=(d<186)?1+dv(d,31):7+dv(d-186,30);
  var jd=1+((d<186)?(d%31):((d-186)%30));
  return [jy,p2(jm),p2(jd)]
}
function j2g(jy,jm,jd){
  var gy=(jy<=979)?621:1600;jy-=(jy<=979)?0:979;
  var d=(365*jy)+dv(jy,33)*8+dv((jy%33)+3,4)+78+jd+((jm<7)?(jm-1)*31:((jm-7)*30)+186);
  gy+=400*dv(d,146097);d%=146097;
  if(d>36524){gy+=100*dv(d,36524);d%=36524;if(d>=365)d++}
  gy+=4*dv(d,1461);d%=1461;
  if(d>365){gy+=dv(d,365);d%=365}
  var gdm=[0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
  var gm=1;while(gm<=12&&d>=gdm[gm]){d-=gdm[gm];gm++}
  return [gy,gm,d+1]
}
function todayJ(){var d=new Date();return g2j(d.getFullYear(),d.getMonth()+1,d.getDate()).join("/")}
function parseJ(s){if(!s)return null;var m=String(s).match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);return m?[+m[1],+m[2],+m[3]]:null}
function diffJ(a,b){
  var g1=j2g(a[0],a[1],a[2]),g2=j2g(b[0],b[1],b[2]);
  return Math.round((new Date(g2[0],g2[1]-1,g2[2])-new Date(g1[0],g1[1]-1,g1[2]))/86400000)
}
function monthKey(jStr){var p=parseJ(jStr);return p?p[0]+"/"+p[1]:""}
var DB={
  people:[],products:[],prices:[],sales:[],receipts:[],audit:[],settings:null,
  load:function(){
    this.people=Store.get("people",[]);
    this.products=Store.get("products",[]);
    this.prices=Store.get("prices",[]);
    this.sales=Store.get("sales",[]);
    this.receipts=Store.get("receipts",[]);
    this.audit=Store.get("audit",[]).slice(-500);
    this.settings=Store.get("settings",null)||this.defaultSettings()
  },
  save:function(what){
    if(Array.isArray(this[what]))Store.set(what,this[what]);
    else if(what==="settings")Store.set("settings",this.settings)
  },
  defaultSettings:function(){
    return {currency:"ریال",dayBasis:30,graceDays:30,pin:"",tiers:[
      {id:"t1",maxDays:30,rate:0,active:true},
      {id:"t2",maxDays:60,rate:0.06,active:true},
      {id:"t3",maxDays:120,rate:0.10,active:true},
      {id:"t4",maxDays:9999,rate:0.15,active:true}
    ]}
  },
  auditLog:function(action,table,recordId,note){
    this.audit.push({id:uid("A"),at:todayISO(),action:action,table:table,recordId:recordId||"",note:note||""});
    this.audit=this.audit.slice(-500);
    this.save("audit")
  },
  getCustomer:function(id){return this.people.find(function(p){return p.id===id})},
  getProduct:function(id){return this.products.find(function(p){return p.id===id})},
  currentPrice:function(productId,atDate){
    var target=atDate||todayJ(),best=null;
    for(var i=0;i<this.prices.length;i++){
      var p=this.prices[i];
      if(p.productId!==productId)continue;
      if(String(p.effectiveDate||"")>String(target))continue;
      if(!best||String(p.effectiveDate||"")>String(best.effectiveDate||""))best=p;
    }
    return best;
  }
};
function getMultiplier(days,tiers,basis){
  var act=tiers.filter(function(t){return t.active!==false}).sort(function(a,b){return a.maxDays-b.maxDays});
  if(!act.length)return 1;
  var sel=act[act.length-1];
  for(var i=0;i<act.length;i++){if(days<=act[i].maxDays){sel=act[i];break}}
  if(!sel||!sel.rate)return 1;
  return 1+(sel.rate*days/basis);
}
function fifo(customerId,calcDate){
  var s=DB.settings;
  var calcArr=parseJ(calcDate)||parseJ(todayJ());
  var sales=DB.sales.filter(function(x){return x.customerId===customerId}).sort(function(a,b){
    var d=String(a.jDate||"").localeCompare(String(b.jDate||""));
    return d||String(a.id).localeCompare(String(b.id))
  });
  var receipts=DB.receipts.filter(function(x){
    return x.customerId===customerId&&x.status!=="باطل"&&x.status!=="برگشتی"
  }).sort(function(a,b){return String(a.jDate||"").localeCompare(String(b.jDate||""))});
  var alloc=sales.map(function(s){return {sale:s,orig:s.amount,remaining:s.amount,days:0,mult:1,settlement:0,interest:0}});
  var credit=0;
  for(var i=0;i<receipts.length;i++){
    var r=receipts[i],rem=r.amount;
    for(var j=0;j<alloc.length;j++){
      if(rem<=0)break;
      if(alloc[j].remaining<=0)continue;
      if(String(alloc[j].sale.jDate||"")>String(r.jDate||""))break;
      var take=Math.min(rem,alloc[j].remaining);
      alloc[j].remaining-=take;rem-=take;
    }
    if(rem>0)credit+=rem;
  }
  var totalInt=0,totalRem=0,totalSV=0,totalOrig=0;
  for(var i=0;i<alloc.length;i++){
    var a=alloc[i];
    if(a.remaining>0){
      var p=parseJ(a.sale.jDate);
      if(p){
        var d=diffJ(p,calcArr);
        a.days=d;a.mult=getMultiplier(d,s.tiers,s.dayBasis);
        a.settlement=a.remaining*a.mult;a.interest=a.settlement-a.remaining;
        totalInt+=a.interest;totalRem+=a.remaining;totalSV+=a.settlement;totalOrig+=a.orig
      }
    }
  }
  return {alloc:alloc,credit:credit,totalInt:totalInt,totalRem:totalRem,totalSV:totalSV,totalOrig:totalOrig}
}
function customerSummary(id){
  var f=fifo(id,todayJ());
  var sales=DB.sales.filter(function(s){return s.customerId===id});
  var receipts=DB.receipts.filter(function(r){return r.customerId===id&&r.status!=="باطل"&&r.status!=="برگشتی"});
  var totalSales=0,totalReceipts=0;
  for(var i=0;i<sales.length;i++)totalSales+=(sales[i].amount||0);
  for(var i=0;i<receipts.length;i++)totalReceipts+=(receipts[i].amount||0);
  return {totalSales:totalSales,totalReceipts:totalReceipts,balance:f.totalRem,credit:f.credit,interest:f.totalInt,engine:f}
                                              }
