'use strict';
(function(root){
function dashboard(){const s=DB.state;return {customers:s.customers.length,products:s.products.length,sales:s.sales.reduce((n,x)=>n+Number(x.amount||0),0),receipts:s.receipts.filter(x=>x.status!=='برگشتی'&&x.status!=='باطل').reduce((n,x)=>n+Number(x.amount||0),0),checks:s.checks.length,operations:s.operations.length};}
function customerBalances(date){return DB.state.customers.map(c=>{const f=Transactions.customerStatement(c.id,date||DB.todayJ());return {customer:c,balance:f.totalRem,credit:f.credit,interest:f.totalInt};});}
root.Reports={dashboard,customerBalances};
})(typeof globalThis!=='undefined'?globalThis:this);
