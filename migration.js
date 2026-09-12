"use strict";
(function(root,factory){var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.Migration=api.Migration})(typeof globalThis!=="undefined"?globalThis:this,function(){
  var arrays=['people','products','prices','sales','receipts','payments','checks','purchases','saleReturns','purchaseReturns','accounts','transfers','expenses','incomes','adjustments','audit'];
  function normalize(input){
    var src=input&&typeof input==='object'?input:{};var out=Object.assign({},src);
    arrays.forEach(function(k){if(!Array.isArray(out[k]))out[k]=[]});
    if(!out.settings||typeof out.settings!=='object')out.settings={};
    var d={currency:'ریال',dayBasis:30,graceDays:30,pin:'',tiers:[{id:'t1',maxDays:30,rate:0,active:true},{id:'t2',maxDays:60,rate:.06,active:true},{id:'t3',maxDays:120,rate:.10,active:true},{id:'t4',maxDays:9999,rate:.15,active:true}]};
    out.settings=Object.assign(d,out.settings);return out;
  }
  return {Migration:{normalize:normalize}}
});
