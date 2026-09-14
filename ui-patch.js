"use strict";
(function(){
  if(window.__ACCOUNTING_UI_PATCH__)return;window.__ACCOUNTING_UI_PATCH__=true;
  var esc=function(x){return String(x==null?'':x).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})};
  var n=function(x){var v=Number(x);return Number.isFinite(v)?v:0};
  var V=function(id){var e=document.getElementById(id);return e?e.value:''};
  var fill=function(id,v){var e=document.getElementById(id);if(e)e.value=v==null?'':v};
  var S=function(){return DB.state};var today=function(){return DB.todayJ?DB.todayJ():''};
  var save=function(){DB.save();if(window.App&&App.render)App.render()};
  var open=function(id){var e=document.getElementById(id);if(e){e.classList.add('open');e.setAttribute('aria-hidden','false')}};
  function priceEdit(id){var p=(S().prices||[]).find(function(x){return x.id===id});if(!p)return;fill('m-prd',p.productId);fill('m-pru',p.unit||p.pricingUnit||'عدد');fill('m-prc',p.price||p.unitPrice);fill('m-prdte',p.effectiveDate);fill('m-prnote',p.notes);var m=document.getElementById('m-price');if(m){m.dataset.edit=id;open('m-price')}}
  function savePrice(){var productId=V('m-prd'),unit=V('m-pru'),price=n(V('m-prc')),date=V('m-prdte')||today();if(!productId||price<0||!date)throw Error('کالا، قیمت و تاریخ الزامی است');var m=document.getElementById('m-price'),id=m&&m.dataset.edit;var p=(S().prices||[]).find(function(x){return x.id===id});if(!p){p={id:'PR-'+Date.now().toString(36)};S().prices.push(p)}Object.assign(p,{productId:productId,unit:unit,pricingUnit:unit,price:price,unitPrice:price,effectiveDate:date,notes:V('m-prnote')});save();m.classList.remove('open')}
  function genericModal(kind){var m=document.getElementById('m-generic');if(!m)return;m.dataset.kind=kind;open('m-generic')}
  function saveGeneric(){var kind=(document.getElementById('m-generic')||{}).dataset.kind||'expense',amount=n(V('m-gamount')),date=V('m-gdate')||today(),desc=V('m-gdesc');if(amount<=0)throw Error('مبلغ باید بزرگ‌تر از صفر باشد');var row={id:'G-'+Date.now().toString(36),jDate:date,amount:amount,description:desc,status:'POSTED'};if(kind==='purchase'){row.supplierId=V('m-gperson');S().purchases.push(row)}else if(kind==='production'){row.productId=V('m-gproduct');S().productions.push(row)}else S().expenses.push(row);save();mClose('m-generic')}
  function mClose(id){var e=document.getElementById(id);if(e)e.classList.remove('open')}
  document.addEventListener('click',function(e){var b=e.target.closest('[data-ac]');if(!b)return;var a=b.getAttribute('data-ac');try{if(a==='new-price'){var m=document.getElementById('m-price');if(m)delete m.dataset.edit;open('m-price')}else if(a.indexOf('edit-price:')===0)priceEdit(a.split(':')[1]);else if(a==='save-price')savePrice();else if(a==='new-production')genericModal('production');else if(a==='new-purchase')genericModal('purchase');else if(a==='new-expense')genericModal('expense');else if(a==='save-generic')saveGeneric()}catch(err){if(window.toast)toast(err.message||String(err),'d')}});
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='m-prd'){var p=S().products.find(function(x){return x.id===e.target.value});var u=document.getElementById('m-pru');if(p&&u){u.innerHTML='<option>'+esc(p.baseUnit||'عدد')+'</option><option>'+esc(p.packageUnit||'کارتن')+'</option>'}}});
})();
