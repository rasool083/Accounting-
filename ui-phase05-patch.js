'use strict';
(function(){
function patch(){
 if(!window.Transactions||window.Transactions.__phase05Patched)return;
 const original=window.Transactions.addSale;
 window.Transactions.addSale=function(x){const discount=Math.max(0,Number(x&&x.discount)||0),row=original.call(this,x);if(discount>0){row.grossAmount=row.amount;row.discount=discount;row.netAmount=Math.max(0,row.grossAmount-discount);row.amount=row.netAmount;const opId=row.operationId,op=(DB.state.operations||[]).find(o=>o.OperationID===opId),ef=(DB.state.effects||[]).find(e=>e.OperationID===opId&&e.RecordID===row.id);if(ef)ef.Value=row.amount;DB.save()}return row};
 window.Transactions.__phase05Patched=true;
}
 if(window.Transactions)patch(); else window.addEventListener('load',patch);
})();
