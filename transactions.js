"use strict";
(function(root,factory){var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.Transactions=api.Transactions})(typeof globalThis!=="undefined"?globalThis:this,function(){
  function uid(prefix){return (prefix||'R-')+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
  function amount(v){return Number(v)||0}
  function required(v,name){if(v===undefined||v===null||v==='')throw new Error(name+' is required')}
  function base(input,type){input=input||{};required(input.jDate||input.date,'jDate');return Object.assign({id:uid(type+'-'),type:type,createdAt:new Date().toISOString()},input,{amount:amount(input.amount)})}
  function addCheck(input){required(input&&input.customerId,'customerId');if(amount(input.amount)<=0)throw new Error('amount must be greater than zero');required(input.dueDate,'dueDate');var r=base(input,'check');r.status=input.status||'نزد ما';r.issueDate=input.issueDate||input.jDate||null;return r}
  function addPurchase(input){required(input&&input.supplierId,'supplierId');if(amount(input.amount)<=0)throw new Error('amount must be greater than zero');return base(input,'purchase')}
  function addPayment(input){required(input&&input.payeeId,'payeeId');if(amount(input.amount)<=0)throw new Error('amount must be greater than zero');return base(input,'payment')}
  function addSaleReturn(input){required(input&&input.customerId,'customerId');return base(input,'saleReturn')}
  function addPurchaseReturn(input){required(input&&input.supplierId,'supplierId');return base(input,'purchaseReturn')}
  return {Transactions:{addCheck:addCheck,addPurchase:addPurchase,addPayment:addPayment,addSaleReturn:addSaleReturn,addPurchaseReturn:addPurchaseReturn,validate:function(input){required(input&&input.jDate,'jDate');if(amount(input.amount)<0)throw new Error('amount must not be negative')}}}
});
