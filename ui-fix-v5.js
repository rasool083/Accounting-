'use strict';
(function(root){
  const E=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const A=k=>Array.isArray(DB[k])?DB[k]:[];
  const F=v=>Math.round(Number(v)||0).toLocaleString('en-US');
  const today=()=>DB.todayJ?DB.todayJ():'';
  const id=p=>(window.uid?uid(p):p+Date.now().toString(36)+Math.random().toString(36).slice(2));
  const btn=(t,a,c='')=>'<button type="button" class="u-btn '+c+'" data-v5="'+E(a)+'">'+t+'</button>';
  const inp=(l,id_,v='',type='text',x='')=>'<label class="u-field"><span>'+l+'</span><input id="'+id_+'" type="'+type+'" value="'+E(v)+'" '+x+'></label>';
  const sel=(l,id_,h)=>'<label class="u-field"><span>'+l+'</span><select id="'+id_+'">'+h+'</select></label>';
  const modal=(id_,title,body)=>'<div class="u-modal" id="'+id_+'"><div class="u-card v5-modal-card"><div class="u-head"><b>'+title+'</b><button type="button" class="u-close" data-v5="close:'+id_+'">×</button></div><div class="u-body">'+body+'</div></div></div>';
  const table=(h,rows)=>rows.length?'<div class="u-table"><table><thead><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>':'<div class="u-empty">رکوردی ثبت نشده است.</div>';
  const page=(title,add,body)=>'<section class="u-page"><div class="u-title"><h2>'+title+'</h2>'+btn('＋ افزودن',add,'primary')+'</div>'+body+'</section>';
  const action=(t,i)=>btn('ویرایش','edit:'+t+':'+i,'icon')+' '+btn('غیرفعال','deactivate:'+t+':'+i,'icon danger');
  function warehousesPage(){
    const rows=A('warehouses').map(w=>'<tr><td>'+E(w.id)+'</td><td>'+E(w.name||'')+'</td><td>'+E(w.type||'سایر')+'</td><td><span class="pp-status '+(w.active===false?'off':'on')+'">'+(w.active===false?'غیرفعال':'فعال')+'</span></td><td>'+action('warehouse',w.id)+'</td></tr>');
    const types='<option value="مواد اولیه">مواد اولیه</option><option value="محصول تولیدی">محصول تولیدی</option><option value="بازرگانی">بازرگانی</option><option value="سایر">سایر</option>';
    return page('انبارها','new:warehouse',table(['کد','نام','نوع','وضعیت','عملیات'],rows)+modal('v5-warehouse','انبار جدید / ویرایش',inp('کد انبار *','v5-w-id')+inp('نام انبار *','v5-w-name')+sel('نوع','v5-w-type',types)+sel('وضعیت','v5-w-active','<option value="1">فعال</option><option value="0">غیرفعال</option>')+inp('توضیحات','v5-w-note')+'<div class="u-save">'+btn('ذخیره','save:warehouse','success')+btn('انصراف','close:v5-warehouse')+'</div>'));
  }
  function openWarehouse(rawId){
    const id_=rawId||''; root.__v5WarehouseId=id_;
    const w=id_?A('warehouses').find(x=>String(x.id)===String(id_)):null;
    document.getElementById('v5-w-id').value=w?.id||'';
    document.getElementById('v5-w-name').value=w?.name||'';
    document.getElementById('v5-w-type').value=w?.type||'سایر';
    document.getElementById('v5-w-active').value=w?.active===false?'0':'1';
    document.getElementById('v5-w-note').value=w?.notes||'';
    document.getElementById('v5-w-id').readOnly=!!w;
    document.getElementById('v5-warehouse').classList.add('open');
  }
  function saveWarehouse(){
    const code=(document.getElementById('v5-w-id').value||'').trim(),name=(document.getElementById('v5-w-name').value||'').trim();
    if(!code||!name){toast('کد و نام انبار الزامی است','d',3000);return}
    let w=root.__v5WarehouseId?A('warehouses').find(x=>String(x.id)===String(root.__v5WarehouseId)):null;
    const creating=!w;
    if(!w){if(A('warehouses').some(x=>String(x.id)===code)){toast('کد انبار تکراری است','d',3000);return}w={id:code};DB.warehouses.push(w)}
    w.name=name;w.type=document.getElementById('v5-w-type').value;w.active=document.getElementById('v5-w-active').value!=='0';w.notes=document.getElementById('v5-w-note').value.trim();w.updatedAt=today();if(creating)w.createdAt=today();
    DB.save('warehouses');DB.auditLog(creating?'CREATE':'UPDATE','warehouses',w.id,creating?'ایجاد انبار':'ویرایش انبار');
    document.getElementById('v5-warehouse').classList.remove('open');root.__v5WarehouseId='';root.render();
  }
  function deactivateWarehouse(i){const w=A('warehouses').find(x=>String(x.id)===String(i));if(!w)return;if(!confirm('انبار «'+(w.name||'')+'» غیرفعال شود؟'))return;w.active=false;w.updatedAt=today();DB.save('warehouses');DB.auditLog('DEACTIVATE','warehouses',w.id,'انبار غیرفعال شد');root.render()}
  function packagesPage(){
    let ps=A('paymentPackages');
    if(!ps.length){ps=[{id:'PKG-DEFAULT',name:'پله عمومی',active:true,tiers:(DB.settings&&DB.settings.tiers)||[]}];DB.paymentPackages=ps;DB.save('paymentPackages')}
    const rows=ps.map(p=>{const active=(p.tiers||[]).filter(t=>t.active!==false).length;return '<tr><td>'+E(p.name||p.id)+'</td><td>'+active+'</td><td><span class="pp-status '+(p.active===false?'off':'on')+'">'+(p.active===false?'غیرفعال':'فعال')+'</span></td><td>'+btn('ویرایش','edit:package:'+p.id,'icon')+' '+(p.id==='PKG-DEFAULT'?'':btn('غیرفعال','deactivate:package:'+p.id,'icon danger'))+'</td></tr>'}).join('');
    return page('بسته و پله سود','new:package',table(['بسته','پله فعال','وضعیت','عملیات'],rows)+modal('v5-package','بسته شرایط پرداخت',inp('نام بسته *','v5-pkg-name')+sel('وضعیت','v5-pkg-active','<option value="1">فعال</option><option value="0">غیرفعال</option>')+'<div id="v5-tiers"></div>'+btn('＋ افزودن پله','new:tier','primary')+'<div class="u-save">'+btn('ذخیره بسته','save:package','success')+btn('انصراف','close:v5-package')+'</div>')+modal('v5-tier','پله سود',inp('حداکثر روز *','v5-tier-days','30','number','min="0" step="1"')+inp('نرخ ماهانه (%) *','v5-tier-rate','0','number','min="0" step="0.01"')+sel('وضعیت','v5-tier-active','<option value="1">فعال</option><option value="0">غیرفعال</option>')+inp('توضیحات','v5-tier-note')+'<div class="u-save">'+btn('ذخیره پله','save:tier','success')+btn('انصراف','close:v5-tier')+'</div>'));
  }
  function renderTiers(){const box=document.getElementById('v5-tiers');if(!box)return;const tiers=root.__v5DraftTiers||[];box.innerHTML=tiers.length?tiers.map((t,i)=>'<div class="u-tier"><b>پله '+(i+1)+'</b><div class="u-summary">تا '+F(t.maxDays)+' روز · '+F((Number(t.rate)||0)*100)+'٪ · '+(t.active===false?'غیرفعال':'فعال')+'</div>'+btn('ویرایش','edit:tier:'+i,'icon')+' '+btn('حذف','delete:tier:'+i,'icon danger')+'</div>').join(''):'<div class="u-empty">پله‌ای ثبت نشده است.</div>'}
  function openPackage(id_){root.__v5PackageId=id_||'';const p=id_?A('paymentPackages').find(x=>String(x.id)===String(id_)):null;root.__v5DraftTiers=JSON.parse(JSON.stringify(p?.tiers||((DB.settings&&DB.settings.tiers)||[])));document.getElementById('v5-pkg-name').value=p?.name||'';document.getElementById('v5-pkg-active').value=p?.active===false?'0':'1';renderTiers();document.getElementById('v5-package').classList.add('open')}
  function openTier(i){root.__v5TierIndex=Number(i);const t=root.__v5DraftTiers[i]||{id:id('T'),maxDays:30,rate:0,active:true,notes:''};document.getElementById('v5-tier-days').value=t.maxDays??30;document.getElementById('v5-tier-rate').value=(Number(t.rate)||0)*100;document.getElementById('v5-tier-active').value=t.active===false?'0':'1';document.getElementById('v5-tier-note').value=t.notes||'';document.getElementById('v5-tier').classList.add('open')}
  function saveTier(){const d=Number(document.getElementById('v5-tier-days').value),r=Number(document.getElementById('v5-tier-rate').value)/100;if(!(d>=0)||!(r>=0)){toast('حداکثر روز و نرخ را صحیح وارد کنید','d',3000);return}const t=root.__v5TierIndex>=0?root.__v5DraftTiers[root.__v5TierIndex]:{id:id('T')};t.maxDays=d;t.rate=r;t.active=document.getElementById('v5-tier-active').value!=='0';t.notes=document.getElementById('v5-tier-note').value.trim();if(root.__v5TierIndex>=0)root.__v5DraftTiers[root.__v5TierIndex]=t;else root.__v5DraftTiers.push(t);root.__v5DraftTiers.sort((a,b)=>Number(a.maxDays)-Number(b.maxDays));document.getElementById('v5-tier').classList.remove('open');renderTiers()}
  function savePackage(){const name=(document.getElementById('v5-pkg-name').value||'').trim();if(!name){toast('نام بسته الزامی است','d',3000);return}let p=root.__v5PackageId?A('paymentPackages').find(x=>String(x.id)===String(root.__v5PackageId)):null;const creating=!p;if(!p){p={id:id('PKG')};DB.paymentPackages.push(p)}p.name=name;p.active=document.getElementById('v5-pkg-active').value!=='0';p.tiers=JSON.parse(JSON.stringify(root.__v5DraftTiers||[]));p.updatedAt=today();if(creating)p.createdAt=today();DB.save('paymentPackages');DB.auditLog(creating?'CREATE':'UPDATE','paymentPackages',p.id,creating?'ایجاد بسته':'ویرایش بسته و پله‌ها');document.getElementById('v5-package').classList.remove('open');root.render()}
  function deactivatePackage(i){const p=A('paymentPackages').find(x=>String(x.id)===String(i));if(!p)return;if(!confirm('بسته «'+(p.name||'')+'» غیرفعال شود؟'))return;p.active=false;DB.save('paymentPackages');DB.auditLog('DEACTIVATE','paymentPackages',p.id,'بسته غیرفعال شد');root.render()}
  const originalRender=root.render;
  root.render=function(){const tab=sessionStorage.getItem('u-tab')||'dashboard';if(tab==='warehouses'){document.getElementById('main').innerHTML=warehousesPage();return}if(tab==='packages'){document.getElementById('main').innerHTML=packagesPage();return}return originalRender.apply(this,arguments)};
  document.addEventListener('click',function(e){const el=e.target.closest('[data-v5]');if(!el)return;const a=el.getAttribute('data-v5')||'';if(a==='new:warehouse'){e.preventDefault();e.stopImmediatePropagation();openWarehouse('');return}if(a.indexOf('edit:warehouse:')===0){e.preventDefault();e.stopImmediatePropagation();openWarehouse(a.slice(15));return}if(a.indexOf('deactivate:warehouse:')===0){e.preventDefault();e.stopImmediatePropagation();deactivateWarehouse(a.slice(21));return}if(a==='save:warehouse'){e.preventDefault();e.stopImmediatePropagation();saveWarehouse();return}if(a==='new:package'){e.preventDefault();e.stopImmediatePropagation();openPackage('');return}if(a.indexOf('edit:package:')===0){e.preventDefault();e.stopImmediatePropagation();openPackage(a.slice(13));return}if(a.indexOf('deactivate:package:')===0){e.preventDefault();e.stopImmediatePropagation();deactivatePackage(a.slice(19));return}if(a==='new:tier'){e.preventDefault();e.stopImmediatePropagation();openTier(-1);return}if(a.indexOf('edit:tier:')===0){e.preventDefault();e.stopImmediatePropagation();openTier(Number(a.slice(10)));return}if(a.indexOf('delete:tier:')===0){e.preventDefault();e.stopImmediatePropagation();const i=Number(a.slice(12));if(i>=0){root.__v5DraftTiers.splice(i,1);renderTiers()}return}if(a==='save:tier'){e.preventDefault();e.stopImmediatePropagation();saveTier();return}if(a==='save:package'){e.preventDefault();e.stopImmediatePropagation();savePackage();return}if(a.indexOf('close:')===0){e.preventDefault();e.stopImmediatePropagation();document.getElementById(a.slice(6))?.classList.remove('open');return}},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){document.querySelectorAll('.u-modal.open').forEach(x=>x.classList.remove('open'))}});
})(window);
