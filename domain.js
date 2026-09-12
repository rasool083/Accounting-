"use strict";
(function(root,factory){
  var api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.DateEngine=api.DateEngine;root.Finance=api.Finance;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  function p2(n){return n<10?"0"+n:""+n}
  function dv(a,b){return Math.floor(a/b)}
  function g2j(gy,gm,gd){
    var m=[0,31,59,90,120,151,181,212,243,273,304,334];
    var jy=gy>1600?979:0;gy-=gy>1600?1600:621;
    var gy2=gm>2?gy+1:gy;
    var d=365*gy+dv(gy2+3,4)-dv(gy2+99,100)+dv(gy2+399,400)-80+gd+m[gm-1];
    jy+=33*dv(d,12053);d%=12053;jy+=4*dv(d,1461);d%=1461;
    if(d>365){jy+=dv(d-1,365);d=(d-1)%365}
    var jm=d<186?1+dv(d,31):7+dv(d-186,30),jd=1+(d<186?d%31:(d-186)%30);
    return [jy,p2(jm),p2(jd)]
  }
  function j2g(jy,jm,jd){
    jy+=1595;
    var d=-355668+365*jy+dv(jy,33)*8+dv((jy%33)+3,4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186);
    var gy=400*dv(d,146097);d%=146097;
    if(d>36524){gy+=100*dv(d-1,36524);d=(d-1)%36524;if(d>=365)d++}
    gy+=4*dv(d,1461);d%=1461;
    if(d>365){gy+=dv(d-1,365);d=(d-1)%365}
    var gd=d+1,md=[0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31],gm=1;
    while(gm<=12&&gd>md[gm]){gd-=md[gm];gm++}
    return [gy,gm,gd]
  }
  function parseJ(s){
    if(Array.isArray(s))return s.map(Number);
    var m=String(s||"").match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    return m?[+m[1],+m[2],+m[3]]:null
  }
  function diffJ(a,b){
    var x=j2g(a[0],a[1],a[2]),y=j2g(b[0],b[1],b[2]);
    return Math.round((Date.UTC(y[0],y[1]-1,y[2])-Date.UTC(x[0],x[1]-1,x[2]))/86400000)
  }
  function getMultiplier(days,tiers,basis){
    days=Math.max(0,Number(days)||0);basis=Number(basis)||30;
    var act=(tiers||[]).filter(function(t){return t.active!==false}).slice().sort(function(a,b){return a.maxDays-b.maxDays});
    if(!act.length)return 1;
    var sel=act[act.length-1];
    for(var i=0;i<act.length;i++){if(days<=Number(act[i].maxDays)){sel=act[i];break}}
    return 1+((Number(sel.rate)||0)*days/basis)
  }
  function fifo(input){
    input=input||{};
    var customerId=input.customerId,calc=parseJ(input.calcDate);
    if(!calc)throw new Error("calcDate must be YYYY/MM/DD");
    var settings=input.settings||{dayBasis:30,tiers:[]};
    var sales=(input.sales||[]).filter(function(x){return x.customerId===customerId&&parseJ(x.jDate)}).slice();
    sales.sort(function(a,b){return String(a.jDate).localeCompare(String(b.jDate))||String(a.id).localeCompare(String(b.id))});
    var receipts=(input.receipts||[]).filter(function(x){
      return x.customerId===customerId&&x.status!=="باطل"&&x.status!=="برگشتی"&&parseJ(x.jDate)&&String(x.jDate)<=String(input.calcDate)
    }).slice();
    receipts.sort(function(a,b){return String(a.jDate).localeCompare(String(b.jDate))||String(a.id).localeCompare(String(b.id))});
    var alloc=sales.map(function(s){return {sale:s,orig:Number(s.amount)||0,remaining:Number(s.amount)||0,days:0,mult:1,settlement:0,interest:0}}),credit=0,receiptAllocations=[];
    receipts.forEach(function(r){
      var rem=Number(r.amount)||0;
      for(var i=0;i<alloc.length&&rem>0;i++){
        var a=alloc[i];if(a.remaining<=0)continue;if(String(a.sale.jDate)>String(r.jDate))break;
        var duration=diffJ(parseJ(a.sale.jDate),parseJ(r.jDate));
        var mult=getMultiplier(duration,settings.tiers,settings.dayBasis);
        var maxSettlement=a.remaining*mult;
        var settlement=Math.min(rem,maxSettlement);
        var principalReduction=settlement/mult;
        a.remaining-=principalReduction;rem-=settlement;
        receiptAllocations.push({ReceiptID:r.id,SaleID:a.sale.id,SettlementAmount:settlement,PrincipalReduction:principalReduction,DurationDays:duration,Multiplier:mult});
      }
      if(rem>0)credit+=rem
    });
    var totalInt=0,totalRem=0,totalSV=0,totalOrig=0;
    alloc.forEach(function(a){
      if(a.remaining<=0)return;
      var d=diffJ(parseJ(a.sale.jDate),calc);a.days=d;a.mult=getMultiplier(d,settings.tiers,settings.dayBasis);
      a.settlement=a.remaining*a.mult;a.interest=a.settlement-a.remaining;
      totalInt+=a.interest;totalRem+=a.remaining;totalSV+=a.settlement;totalOrig+=a.orig
    });
    return {alloc:alloc,credit:credit,totalInt:totalInt,totalRem:totalRem,totalSV:totalSV,totalOrig:totalOrig,receiptAllocations:receiptAllocations}
  }
  function buildReceiptAllocations(input){
    return fifo(input).receiptAllocations.map(function(row){return Object.freeze({ReceiptID:row.ReceiptID,SaleID:row.SaleID,SettlementAmount:row.SettlementAmount,PrincipalReduction:row.PrincipalReduction,DurationDays:row.DurationDays,Multiplier:row.Multiplier})});
  }
  function customerSummary(input){
    var f=fifo(input),sales=(input.sales||[]).filter(function(x){return x.customerId===input.customerId&&String(x.jDate)<=String(input.calcDate)}),receipts=(input.receipts||[]).filter(function(x){return x.customerId===input.customerId&&x.status!=="باطل"&&x.status!=="برگشتی"&&String(x.jDate)<=String(input.calcDate)});
    return {totalSales:sales.reduce(function(n,x){return n+(Number(x.amount)||0)},0),totalReceipts:receipts.reduce(function(n,x){return n+(Number(x.amount)||0)},0),balance:f.totalRem,credit:f.credit,interest:f.totalInt,engine:f}
  }
  return {DateEngine:{g2j:g2j,j2g:j2g,parseJ:parseJ,diffJ:diffJ},Finance:{getMultiplier:getMultiplier,fifo:fifo,buildReceiptAllocations:buildReceiptAllocations,customerSummary:customerSummary}}
});
