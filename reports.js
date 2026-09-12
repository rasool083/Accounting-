"use strict";
(function(root,factory){var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.Reports=api.Reports})(typeof globalThis!=="undefined"?globalThis:this,function(){
  function rowsFor(state,key,cid,from,to){return (state[key]||[]).filter(function(x){return (!cid||x.customerId===cid)&&(!from||String(x.jDate)>=String(from))&&(!to||String(x.jDate)<=String(to))})}
  function customerStatement(input){
    input=input||{};var state=input.state||{};var sales=rowsFor(state,'sales',input.customerId,input.from,input.to).map(function(x){return Object.assign({kind:'sale',debit:Number(x.amount)||0,credit:0},x)});
    var receipts=rowsFor(state,'receipts',input.customerId,input.from,input.to).filter(function(x){return x.status!=='باطل'&&x.status!=='برگشتی'}).map(function(x){return Object.assign({kind:'receipt',debit:0,credit:Number(x.amount)||0},x)});
    return sales.concat(receipts).sort(function(a,b){return String(a.jDate).localeCompare(String(b.jDate))||String(a.id).localeCompare(String(b.id))})
  }
  function customerBalance(input){
    input=input||{};var state=input.state||{};var calcDate=input.calcDate;
    var sales=(state.sales||[]).filter(function(x){return x.customerId===input.customerId&&String(x.jDate)<=String(calcDate)});
    var receipts=(state.receipts||[]).filter(function(x){return x.customerId===input.customerId&&String(x.jDate)<=String(calcDate)&&x.status!=='باطل'&&x.status!=='برگشتی'});
    var f=root.Finance?root.Finance.customerSummary({customerId:input.customerId,calcDate:calcDate,settings:state.settings||{dayBasis:30,tiers:[]},sales:sales,receipts:receipts}):{balance:sales.reduce(function(n,x){return n+(Number(x.amount)||0)},0)-receipts.reduce(function(n,x){return n+(Number(x.amount)||0)},0),interest:0};
    return {balance:f.balance,interest:f.interest,totalSales:sales.reduce(function(n,x){return n+(Number(x.amount)||0)},0),totalReceipts:receipts.reduce(function(n,x){return n+(Number(x.amount)||0)},0),credit:f.credit||0,engine:f.engine||null}
  }
  function dashboard(state,calcDate){var s=state.sales||[],r=state.receipts||[];return {sales:s.reduce(function(n,x){return n+(Number(x.amount)||0)},0),receipts:r.filter(function(x){return x.status!=='باطل'&&x.status!=='برگشتی'}).reduce(function(n,x){return n+(Number(x.amount)||0)},0),customers:(state.people||[]).filter(function(x){return x.role==='customer'}).length}}
  return {Reports:{customerStatement:customerStatement,customerBalance:customerBalance,dashboard:dashboard}}
});
