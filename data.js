'use strict';
(function(root){
const KEY='ACCOUNTING_PROJECT_V1';
const defaults={settings:{currency:'ریال',dayBasis:30,graceDays:30,tiers:[{id:'t1',maxDays:30,rate:0,active:true},{id:'t2',maxDays:60,rate:.06,active:true},{id:'t3',maxDays:120,rate:.10,active:true},{id:'t4',maxDays:9999,rate:.15,active:true}]},customers:[],products:[],prices:[],sales:[],receipts:[],checks:[],purchases:[],payments:[],expenses:[],incomes:[],inventoryMovements:[],operations:[],effects:[],audit:[],receiptAllocations:[]};
function clone(x){return JSON.parse(JSON.stringify(x));}
function load(){try{return Object.assign(clone(defaults),JSON.parse(localStorage.getItem(KEY)||'null')||{});}catch(e){return clone(defaults);}}
let state=load();function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function next(p){return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;}
function getCustomer(id){return state.customers.find(x=>x.id===id);}
function getProduct(id){return state.products.find(x=>x.id===id);}
function currentPrice(productId,date,customerId){return state.prices.filter(x=>x.productId===productId&&String(x.effectiveDate)<=String(date)&&(x.customerId===customerId||!x.customerId)).sort((a,b)=>String(b.effectiveDate).localeCompare(String(a.effectiveDate))||Number(Boolean(b.customerId))-Number(Boolean(a.customerId)))[0]||null;}
function add(table,row){state[table].push(row);save();return row;}
function todayJ(){const d=new Date(),a=AccountingDomain.DateEngine.g2j(d.getFullYear(),d.getMonth()+1,d.getDate());return `${a[0]}/${String(a[1]).padStart(2,'0')}/${String(a[2]).padStart(2,'0')}`;}
root.DB={get state(){return state;},save,load:function(){state=load();return state;},next,getCustomer,getProduct,currentPrice,add,todayJ,defaults};
})(typeof globalThis!=='undefined'?globalThis:this);
