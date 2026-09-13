'use strict';
(function(root){
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const n=x=>Number(x)||0, today=()=>DB.todayJ(), pname=id=>(DB.getPerson(id)||{}).name||'—', prname=id=>(DB.getProduct(id)||{}).name||'—';
const opt=a=>(a||[]).map(x=>`<option value="${esc(x.id)}">${esc(x.name||x.code||x.id)}</option>`).join('');
const fld=(l,id,t='text',v='')=>`<div><label>${l}</label><input id="${id}" type="${t}" value="${esc(v)}"></div>`;
const sel=(l,id,o)=>`<div><label>${l}</label><select id="${id}">${o}</select></div>`;
const addBox=(title,html)=>{const main=document.getElementById('main');if(main){const s=document.createElement('section');s.className='bx';s.innerHTML=`<h3>${title}</h3>${html}`;main.appendChild(s);}};
const val=id=>document.getElementById(id)?.value||'';
const run=(f)=>{try{f();DB.save();ProjectUI.render();}catch(e){console.error(e);alert(e.message||'خطا')}};
function advanced(){const people=DB.state.people||[], products=DB.state.products||[], wh=DB.state.warehouses||[];
 if(location.hash==='')location.hash='#dashboard';
 const page=document.querySelector('#nav button.on')?.dataset.tab;
 if(page==='inventory'){
  addBox('انتقال بین انبارها',`<div class="row">${sel('کالا','trProduct',opt(products))}${sel('از انبار','trFrom',opt(wh))}${sel('به انبار','trTo',opt(wh))}${fld('مقدار پایه','trQty','number','1')}${fld('تاریخ','trDate','text',today())}</div>${fld('یادداشت','trNote')}<div class="actions"><button class="btn s" id="doTransfer">ثبت انتقال</button></div>`);
  document.getElementById('doTransfer').onclick=()=>run(()=>Transactions.transferWarehouse({id:DB.next('TRN'),productId:val('trProduct'),fromWarehouseId:val('trFrom'),toWarehouseId:val('trTo'),baseQty:n(val('trQty')),jDate:val('trDate'),notes:val('trNote')}));
 }
 if(page==='production'){
  addBox('فرمول تولید — تعریف و نسخه‌بندی',`<div class="row">${fld('شناسه فرمول','fId')}${sel('محصول','fProduct',opt(products))}${fld('تاریخ اثر','fDate','text',today())}${fld('نسخه','fVersion','number','1')}</div>${fld('Inputs JSON','fInputs','text','[]')}${fld('Outputs JSON','fOutputs','text','[]')}${fld('یادداشت','fNotes')}<div class="actions"><button class="btn" id="saveFormula">ثبت فرمول</button></div>`);
  document.getElementById('saveFormula').onclick=()=>run(()=>Transactions.addFormula({id:val('fId'),productId:val('fProduct'),effectiveDate:val('fDate'),version:n(val('fVersion))||1'),inputs:JSON.parse(val('fInputs')||'[]'),outputs:JSON.parse(val('fOutputs')||'[]'),notes:val('fNotes')}));
  addBox('تاریخچه Cost Basis',`<div class="row">${sel('کالا','cProduct',opt(products))}${fld('Cost Basis','cBasis','number','0')}${fld('تاریخ اثر','cDate','text',today())}</div>${fld('منبع','cSource','text','MANUAL')}<div class="actions"><button class="btn" id="saveCost">ثبت Cost Basis</button></div>`);
  document.getElementById('saveCost').onclick=()=>run(()=>Transactions.addCostSnapshot({productId:val('cProduct'),costBasis:n(val('cBasis')),effectiveDate:val('cDate'),source:val('cSource')}));
 }
 if(page==='purchases'){
  addBox('مرجوعی خرید',`<div class="row">${sel('خرید اصلی','prOriginal',opt(DB.state.purchases))}${fld('مقدار مرجوعی','prQty','number','1')}${fld('تاریخ','prDate','text',today())}</div><div class="actions"><button class="btn w" id="savePurchaseReturn">ثبت مرجوعی خرید</button></div>`);
  document.getElementById('savePurchaseReturn').onclick=()=>run(()=>{const p=DB.state.purchases.find(x=>x.id===val('prOriginal'));if(!p)throw Error('PURCHASE_NOT_FOUND');Transactions.addPurchaseReturn({originalPurchaseId:p.id,productId:p.productId,supplierId:p.supplierId,warehouseId:p.warehouseId,quantity:n(val('prQty')),jDate:val('prDate')})});
 }
 if(page==='sales'){
  addBox('مرجوعی فروش',`<div class="row">${sel('فروش اصلی','srOriginal',opt(DB.state.sales))}${fld('مقدار مرجوعی','srQty','number','1')}${fld('تاریخ','srDate','text',today())}</div><div class="actions"><button class="btn w" id="saveSaleReturn">ثبت مرجوعی فروش</button></div>`);
  document.getElementById('saveSaleReturn').onclick=()=>run(()=>{const s=DB.state.sales.find(x=>x.id===val('srOriginal'));if(!s)throw Error('SALE_NOT_FOUND');Transactions.addSaleReturn({originalSaleId:s.id,customerId:s.customerId,productId:s.productId,quantity:n(val('srQty')),jDate:val('srDate')})});
 }
 if(page==='payments'){
  addBox('حساب‌های خزانه و انتقال',`<div class="row">${fld('نام حساب جدید','taName')}${sel('نوع','taType','<option value="cash">صندوق</option><option value="bank">بانک</option><option value="card">کارت</option>')}${fld('موجودی افتتاحیه','taOpening','number','0')}</div><div class="actions"><button class="btn" id="saveTreasury">ثبت حساب</button></div><hr><div class="row">${sel('مبدأ','ttFrom',opt(DB.state.treasuryAccounts))}${sel('مقصد','ttTo',opt(DB.state.treasuryAccounts))}${fld('مبلغ','ttAmount','number','0')}${fld('تاریخ','ttDate','text',today())}</div><div class="actions"><button class="btn s" id="doTreasury">ثبت انتقال</button></div>`);
  document.getElementById('saveTreasury').onclick=()=>run(()=>Transactions.addTreasuryAccount({name:val('taName'),type:val('taType'),openingBalance:n(val('taOpening'))}));
  document.getElementById('doTreasury').onclick=()=>run(()=>Transactions.addTreasuryTransfer({sourceAccountId:val('ttFrom'),destinationAccountId:val('ttTo'),amount:n(val('ttAmount')),jDate:val('ttDate')}));
 }
 if(page==='expenses'){
  addBox('درآمد',`<div class="row">${fld('شناسه','incId')}${fld('شرح','incDesc')}${fld('مبلغ','incAmount','number','0')}${fld('تاریخ','incDate','text',today())}</div><div class="actions"><button class="btn s" id="saveIncome">ثبت درآمد</button></div>`);
  document.getElementById('saveIncome').onclick=()=>run(()=>Transactions.addIncome({id:val('incId')||DB.next('INC'),description:val('incDesc'),amount:n(val('incAmount')),jDate:val('incDate')}));
 }
 if(page==='capital'){
  addBox('کارکنان و حقوق',`<div class="row">${fld('نام کارمند','empName')}${fld('سمت','empRole')}${fld('شروع کار','empStart','text',today())}</div><div class="actions"><button class="btn" id="saveEmployee">ثبت کارمند</button></div><hr><div class="row">${sel('کارمند','payEmployee',opt(DB.state.employees))}${fld('دوره','payPeriod','text',today().slice(0,7))}${fld('حقوق ناخالص','payGross','number','0')}${fld('سهم کارفرما','payEmployer','number','0')}${fld('کسورات کارمند','payDeduction','number','0')}</div><div class="actions"><button class="btn s" id="savePayroll">ثبت حقوق</button></div>`);
  document.getElementById('saveEmployee').onclick=()=>run(()=>Transactions.addEmployee({name:val('empName'),role:val('empRole'),startDate:val('empStart')}));
  document.getElementById('savePayroll').onclick=()=>run(()=>Transactions.addPayroll({employeeId:val('payEmployee'),period:val('payPeriod'),grossPay:n(val('payGross')),employerContribution:n(val('payEmployer')),employeeDeduction:n(val('payDeduction'))}));
 }
 if(page==='receipts'){
  addBox('جایگزینی چک',`<div class="row">${sel('چک اصلی','repOriginal',opt((DB.state.receipts||[]).filter(x=>x.type==='چک')))}${fld('شماره چک جدید','repNo')}${fld('بانک جدید','repBank')}${fld('مبلغ','repAmount','number','0')}${fld('سررسید','repDue','text',today())}${fld('تاریخ','repDate','text',today())}</div><div class="actions"><button class="btn w" id="replaceCheck">ثبت جایگزینی</button></div>`);
  document.getElementById('replaceCheck').onclick=()=>run(()=>{const o=DB.state.receipts.find(x=>x.id===val('repOriginal'));if(!o)throw Error('RECEIPT_NOT_FOUND');Transactions.replaceCheck(o.id,{amount:n(val('repAmount'))||o.amount,checkNo:val('repNo'),bank:val('repBank'),dueDate:val('repDue'),jDate:val('repDate')})});
 }
 if(page==='reports'){
  addBox('کنترل و ردیابی عملیات',`<div class="kpi"><div class="k"><div class="l">Operations</div><div class="v">${DB.state.operations.length}</div></div><div class="k"><div class="l">Effects</div><div class="v">${DB.state.effects.length}</div></div><div class="k"><div class="l">AuditLog</div><div class="v">${DB.state.audit.length}</div></div><div class="k"><div class="l">Allocation</div><div class="v">${DB.state.receiptAllocations.length}</div></div></div>${DB.state.audit.length?`<div class="tbl-wrap"><table><thead><tr><th>زمان</th><th>عملیات</th><th>عمل</th><th>جدول</th><th>نتیجه</th></tr></thead><tbody>${DB.state.audit.slice().reverse().slice(0,50).map(a=>`<tr><td>${esc(a.Timestamp||a.RecordedAt||'')}</td><td>${esc(a.OperationID||'')}</td><td>${esc(a.Action||'')}</td><td>${esc(a.Table||'')}</td><td>${esc(a.Result||'')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="em">AuditLog خالی است.</div>'}`);
 }
}
const old=ProjectUI.render;ProjectUI.render=function(){old();setTimeout(advanced,0)};
})(typeof globalThis!=='undefined'?globalThis:this);
