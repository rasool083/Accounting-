'use strict';
(function(root){
  var UNIT_CATALOG=[
    {id:'عدد',name:'عدد'},
    {id:'کیلوگرم',name:'کیلوگرم'},
    {id:'متر',name:'متر'},
    {id:'لیتر',name:'لیتر'},
    {id:'بسته',name:'بسته'},
    {id:'کارتن',name:'کارتن'}
  ];
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})}
  function arr(k){return (root.DB&&Array.isArray(root.DB[k]))?root.DB[k]:[]}
  function byId(k,id){return arr(k).find(function(x){return String(x.id)===String(id)})}
  function opts(items,selected,placeholder){return '<option value="">'+(placeholder||'انتخاب کنید')+'</option>'+items.map(function(x){var id=x.id;var label=x.name||x.title||x.code||id;return '<option value="'+esc(id)+'"'+(String(id)===String(selected)?' selected':'')+'>'+esc(label)+'</option>'}).join('')}
  function units(selected){return '<option value="">انتخاب واحد</option>'+UNIT_CATALOG.map(function(u){return '<option value="'+u.id+'"'+(u.id===selected?' selected':'')+'>'+u.name+'</option>'}).join('')}
  function modal(id,title,body){return '<div class="uo-modal" id="'+id+'"><div class="uo-card"><div class="uo-head"><b>'+title+'</b><button type="button" class="uo-close" data-uo="close:'+id+'">×</button></div><div class="uo-body">'+body+'</div></div></div>'}
  function field(label,id,value,type,extra){return '<label class="uo-field"><span>'+label+'</span><input id="'+id+'" type="'+(type||'text')+'" value="'+esc(value==null?'':value)+'" '+(extra||'')+'></label>'}
  function selectField(label,id,html){return '<label class="uo-field"><span>'+label+'</span><select id="'+id+'">'+html+'</select></label>'}
  function btn(t,a,c){return '<button type="button" class="uo-btn '+(c||'')+'" data-uo="'+esc(a)+'">'+t+'</button>'}
  function table(headers,rows){return rows.length?'<div class="uo-table"><table><thead><tr>'+headers.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>':'<div class="uo-empty">رکوردی ثبت نشده است.</div>'}
  function actions(kind,id){return btn('ویرایش','edit:'+kind+':'+id,'small')+' '+btn('حذف','delete:'+kind+':'+id,'small danger')}
  function page(title,action,body){return '<section class="u-page"><div class="u-title"><h2>'+title+'</h2>'+btn('＋ افزودن',action,'primary')+'</div>'+body+'</section>'}

  function productsPage(){
    var products=arr('products');
    var rows=products.map(function(p){
      var base=p.baseUnit||'عدد', second=p.packageUnit||p.secondUnit||'';
      var pu=p.pricingUnit||base;
      return '<tr><td>'+esc(p.code||p.id)+'</td><td>'+esc(p.name)+'</td><td>'+esc(base)+'</td><td>'+esc(second||'—')+'</td><td>'+esc(second?String(p.unitsPerPackage||p.conversionFactor||1):'—')+'</td><td>'+esc(pu)+'</td><td>'+esc(p.active===false?'غیرفعال':'فعال')+'</td><td>'+actions('product',p.id)+'</td></tr>';
    });
    var body=table(['کد','نام کالا','واحد پایه','واحد دوم','ضریب تبدیل به پایه','واحد قیمت‌گذاری','وضعیت','عملیات'],rows);
    body+=modal('uo-product','کالا جدید / ویرایش',
      field('کد کالا *','uo-p-code','','text','required')+
      field('نام کالا *','uo-p-name','','text','required')+
      selectField('واحد پایه *','uo-p-base',units('عدد'))+
      selectField('واحد دوم','uo-p-second',units(''))+
      field('ضریب واحد دوم به واحد پایه','uo-p-factor','1','number','min="0.000001" step="any"')+
      selectField('واحد قیمت‌گذاری','uo-p-price',units('عدد'))+
      selectField('وضعیت','uo-p-active','<option value="1">فعال</option><option value="0">غیرفعال</option>')+
      field('انبار پیش‌فرض','uo-p-wh','','text')+
      field('توضیحات','uo-p-note','','text')+
      '<div class="uo-hint">واحد قیمت‌گذاری می‌تواند یکی از ۶ واحد باشد، اما برای محاسبه خودکار فروش باید «واحد پایه» یا «واحد دوم» باشد. اگر واحد دوم انتخاب شود، ضریب آن به واحد پایه مبنای تبدیل است.</div>'+ 
      '<div class="uo-save">'+btn('ذخیره','save:product','success')+' '+btn('انصراف','close:uo-product')+'</div>'
    );
    return page('کالاها','new:product',body);
  }
  function openProduct(id){
    var p=id?byId('products',id):null;
    root.__uoProductEditingId=id||'';
    document.getElementById('uo-product')?.remove();
    document.getElementById('main').insertAdjacentHTML('beforeend',modal('uo-product','کالا جدید / ویرایش',
      field('کد کالا *','uo-p-code',p?.code||p?.id||'','text','required')+
      field('نام کالا *','uo-p-name',p?.name||'','text','required')+
      selectField('واحد پایه *','uo-p-base',units(p?.baseUnit||'عدد'))+
      selectField('واحد دوم','uo-p-second',units(p?.packageUnit||p?.secondUnit||''))+
      field('ضریب واحد دوم به واحد پایه','uo-p-factor',p?.unitsPerPackage??p?.conversionFactor??1,'number','min="0.000001" step="any"')+
      selectField('واحد قیمت‌گذاری', 'uo-p-price',units(p?.pricingUnit||p?.baseUnit||'عدد'))+
      selectField('وضعیت','uo-p-active','<option value="1"'+(p?.active!==false?' selected':'')+'>فعال</option><option value="0"'+(p?.active===false?' selected':'')+'>غیرفعال</option>')+
      field('انبار پیش‌فرض','uo-p-wh',p?.warehouseId||'','text')+
      field('توضیحات','uo-p-note',p?.notes||p?.note||'','text')+
      '<div class="uo-hint">واحد قیمت‌گذاری باید با قرارداد تبدیل کالا سازگار باشد. در فروش، انتخاب واحد پایه یا واحد دوم قیمت همان واحد را فعال می‌کند.</div>'+ 
      '<div class="uo-save">'+btn('ذخیره','save:product','success')+' '+btn('انصراف','close:uo-product')+'</div>'
    ));
    document.getElementById('uo-product')?.classList.add('open');
    document.getElementById('uo-p-name')?.focus();
  }
  function saveProduct(){
    var code=(document.getElementById('uo-p-code')?.value||'').trim();
    var name=(document.getElementById('uo-p-name')?.value||'').trim();
    var base=document.getElementById('uo-p-base')?.value||'';
    var second=document.getElementById('uo-p-second')?.value||'';
    var factor=Number(document.getElementById('uo-p-factor')?.value||0);
    var priceUnit=document.getElementById('uo-p-price')?.value||base;
    if(!code||!name||!base){root.toast&&toast('کد، نام و واحد پایه الزامی است','d',3500);return}
    if(second&&!(factor>0)){root.toast&&toast('برای واحد دوم ضریب بزرگ‌تر از صفر وارد کنید','d',3500);return}
    if(priceUnit!==base&&priceUnit!==second){root.toast&&toast('واحد قیمت‌گذاری برای محاسبه خودکار باید واحد پایه یا واحد دوم باشد','d',4500);return}
    var id=root.__uoProductEditingId;
    var p=id?byId('products',id):null;
    if(!p){p={id:uid('P'),createdAt:todayISO()};arr('products').push(p)}
    p.code=code;p.name=name;p.baseUnit=base;p.packageUnit=second;p.secondUnit=second;p.unitsPerPackage=second?factor:1;p.conversionFactor=second?factor:1;p.pricingUnit=priceUnit;p.active=document.getElementById('uo-p-active')?.value!=='0';p.warehouseId=document.getElementById('uo-p-wh')?.value||'';p.notes=document.getElementById('uo-p-note')?.value||'';p.updatedAt=todayISO();
    DB.save('products');DB.auditLog(id?'UPDATE':'CREATE','products',p.id,id?'ویرایش کالا':'ایجاد کالا');
    document.getElementById('uo-product')?.remove();root.__uoProductEditingId='';root.render();
  }
  function deleteProduct(id){
    var p=byId('products',id);if(!p)return;
    var linked=arr('sales').some(function(x){return x.productId===id})||arr('purchases').some(function(x){return x.productId===id})||arr('inventoryMovements').some(function(x){return x.productId===id});
    if(linked){p.active=false;p.updatedAt=todayISO();DB.save('products');DB.auditLog('DEACTIVATE','products',id,'به دلیل وجود سابقه، کالا حذف فیزیکی نشد و غیرفعال شد.');root.render();root.toast&&toast('کالا سابقه دارد؛ به‌جای حذف غیرفعال شد.','i',4000);return}
    if(!confirm('کالا «'+(p.name||'')+'» حذف شود؟'))return;
    DB.products=arr('products').filter(function(x){return String(x.id)!==String(id)});DB.save('products');DB.auditLog('DELETE','products',id,'حذف کالا');root.render();
  }

  function warehousesPage(){
    var ws=arr('warehouses');
    var rows=ws.map(function(w){return '<tr><td>'+esc(w.id)+'</td><td>'+esc(w.name)+'</td><td>'+esc(w.type||'سایر')+'</td><td>'+esc(w.active===false?'غیرفعال':'فعال')+'</td><td>'+actions('warehouse',w.id)+'</td></tr>'});
    return page('انبارها','new:warehouse',table(['کد','نام','نوع','وضعیت','عملیات'],rows)+modal('uo-warehouse','انبار جدید / ویرایش',field('کد انبار *','uo-w-id','','text','required')+field('نام انبار *','uo-w-name','','text','required')+selectField('نوع','uo-w-type','<option>مواد اولیه</option><option>محصول تولیدی</option><option>بازرگانی</option><option>سایر</option>')+selectField('وضعیت','uo-w-active','<option value="1">فعال</option><option value="0">غیرفعال</option>')+field('توضیحات','uo-w-note')+'<div class="uo-save">'+btn('ذخیره','save:warehouse','success')+' '+btn('انصراف','close:uo-warehouse')+'</div>'));
  }
  function openWarehouse(id){
    var w=id?byId('warehouses',id):null;root.__uoWarehouseEditingId=id||'';
    document.getElementById('uo-warehouse')?.remove();
    document.getElementById('main').insertAdjacentHTML('beforeend',modal('uo-warehouse','انبار جدید / ویرایش',field('کد انبار *','uo-w-id',w?.id||'','text','required')+field('نام انبار *','uo-w-name',w?.name||'','text','required')+selectField('نوع','uo-w-type','<option value="مواد اولیه"'+(w?.type==='مواد اولیه'?' selected':'')+'>مواد اولیه</option><option value="محصول تولیدی"'+(w?.type==='محصول تولیدی'?' selected':'')+'>محصول تولیدی</option><option value="بازرگانی"'+(w?.type==='بازرگانی'?' selected':'')+'>بازرگانی</option><option value="سایر"'+(!w||!w.type||w?.type==='سایر'?' selected':'')+'>سایر</option>')+selectField('وضعیت','uo-w-active','<option value="1"'+(w?.active!==false?' selected':'')+'>فعال</option><option value="0"'+(w?.active===false?' selected':'')+'>غیرفعال</option>')+field('توضیحات','uo-w-note',w?.notes||'')+'<div class="uo-save">'+btn('ذخیره','save:warehouse','success')+' '+btn('انصراف','close:uo-warehouse')+'</div>')).classList.add('open');
    document.getElementById('uo-w-name')?.focus();
  }
  function saveWarehouse(){
    var id=(document.getElementById('uo-w-id')?.value||'').trim(),name=(document.getElementById('uo-w-name')?.value||'').trim();if(!id||!name){toast('کد و نام انبار الزامی است','d',3000);return}
    var editing=root.__uoWarehouseEditingId,w=editing?byId('warehouses',editing):null;
    if(!w){if(byId('warehouses',id)){toast('کد انبار تکراری است','d',3000);return}w={id:id,createdAt:todayISO()};DB.warehouses.push(w)}
    else if(id!==w.id&&byId('warehouses',id)){toast('کد انبار تکراری است','d',3000);return}
    w.id=id;w.name=name;w.type=document.getElementById('uo-w-type')?.value||'سایر';w.active=document.getElementById('uo-w-active')?.value!=='0';w.notes=document.getElementById('uo-w-note')?.value||'';w.updatedAt=todayISO();DB.save('warehouses');DB.auditLog(editing?'UPDATE':'CREATE','warehouses',w.id,editing?'ویرایش انبار':'ایجاد انبار');document.getElementById('uo-warehouse')?.remove();root.__uoWarehouseEditingId='';root.render();
  }
  function deleteWarehouse(id){
    var w=byId('warehouses',id);if(!w)return;
    var linked=arr('inventoryMovements').some(function(x){return x.warehouseId===id})||arr('products').some(function(x){return x.warehouseId===id});
    if(linked){w.active=false;DB.save('warehouses');DB.auditLog('DEACTIVATE','warehouses',id,'به دلیل وجود سابقه، انبار غیرفعال شد.');root.render();toast('انبار سابقه دارد؛ به‌جای حذف غیرفعال شد.','i',4000);return}
    if(!confirm('انبار «'+(w.name||'')+'» حذف شود؟'))return;DB.warehouses=arr('warehouses').filter(function(x){return x.id!==id});DB.save('warehouses');DB.auditLog('DELETE','warehouses',id,'حذف انبار');root.render();
  }

  function packagesPage(){
    var ps=arr('paymentPackages');
    var rows=ps.map(function(p){return '<tr><td>'+esc(p.name||p.id)+'</td><td>'+esc(p.effectiveDate||'—')+'</td><td>'+esc(p.active===false?'غیرفعال':'فعال')+'</td><td>'+esc((p.tiers||[]).filter(function(t){return t.active!==false}).length)+'</td><td>'+actions('package',p.id)+'</td></tr>'});
    return page('پله‌ها / بسته‌های پرداخت','new:package',table(['نام بسته','تاریخ اجرا','وضعیت','تعداد پله فعال','عملیات'],rows)+modal('uo-package','پله / بسته جدید',packageForm(null)));
  }
  function packageForm(p){
    p=p||{};var tiers=Array.isArray(p.tiers)&&p.tiers.length?p.tiers:arr('settings').tiers||((DB.settings&&DB.settings.tiers)||[]);var html=field('نام بسته *','uo-p-name',p.name||'','text','required')+field('تاریخ اجرا','uo-p-date',p.effectiveDate||DB.todayJ?.()||'')+selectField('وضعیت','uo-p-active','<option value="1"'+(p.active!==false?' selected':'')+'>فعال</option><option value="0"'+(p.active===false?' selected':'')+'>غیرفعال</option>');
    html+='<div class="uo-tier-title">پله‌ها</div>';
    for(var i=0;i<5;i++){var t=tiers[i]||{maxDays:0,rate:0,active:false};html+='<div class="uo-tier"><b>پله '+(i+1)+'</b>'+field('حداکثر روز','uo-t-max-'+i,t.maxDays,'number','min="0" step="1"')+field('نرخ','uo-t-rate-'+i,(Number(t.rate||0)*100),'number','step="0.01" min="0"')+selectField('وضعیت','uo-t-active-'+i,'<option value="1"'+(t.active!==false?' selected':'')+'>فعال</option><option value="0"'+(t.active===false?' selected':'')+'>غیرفعال</option>')+'</div>'}
    html+='<div class="uo-hint">پله پس از ایجاد قابل اصلاح است. تغییر سیاست برای تاریخ جدید باید با بسته جدید ثبت شود؛ پله قدیمی برای سوابق قبلی حفظ می‌شود.</div><div class="uo-save">'+btn('ذخیره','save:package','success')+' '+btn('انصراف','close:uo-package')+'</div>';return html;
  }
  function openPackage(id){
    var p=id?byId('paymentPackages',id):null;root.__uoPackageEditingId=id||'';document.getElementById('uo-package')?.remove();document.getElementById('main').insertAdjacentHTML('beforeend',modal('uo-package','پله / بسته جدید یا ویرایش',packageForm(p)));document.getElementById('uo-package').classList.add('open');
  }
  function savePackage(){
    var name=(document.getElementById('uo-p-name')?.value||'').trim();if(!name){toast('نام بسته الزامی است','d',3000);return}
    var editing=root.__uoPackageEditingId,p=editing?byId('paymentPackages',editing):null;if(!p){p={id:uid('PK'),createdAt:todayISO(),tiers:[]};DB.paymentPackages.push(p)}
    p.name=name;p.effectiveDate=document.getElementById('uo-p-date')?.value||DB.todayJ?.()||'';p.active=document.getElementById('uo-p-active')?.value!=='0';p.tiers=[];
    for(var i=0;i<5;i++){p.tiers.push({id:'t'+(i+1),maxDays:Number(document.getElementById('uo-t-max-'+i)?.value||0),rate:Number(document.getElementById('uo-t-rate-'+i)?.value||0)/100,active:document.getElementById('uo-t-active-'+i)?.value!=='0'})}
    p.updatedAt=todayISO();DB.save('paymentPackages');DB.auditLog(editing?'UPDATE':'CREATE','paymentPackages',p.id,editing?'ویرایش بسته/پله':'ایجاد بسته/پله');document.getElementById('uo-package')?.remove();root.__uoPackageEditingId='';root.render();
  }
  function deletePackage(id){var p=byId('paymentPackages',id);if(!p)return;if(arr('sales').some(function(s){return s.paymentPackageId===id||s.packageId===id})){p.active=false;DB.save('paymentPackages');toast('این بسته در سوابق فروش استفاده شده؛ حذف فیزیکی نشد و غیرفعال شد.','i',4500);root.render();return}if(confirm('این بسته حذف شود؟')){DB.paymentPackages=arr('paymentPackages').filter(function(x){return x.id!==id});DB.save('paymentPackages');DB.auditLog('DELETE','paymentPackages',id,'حذف بسته');root.render()}}

  function install(){
    var oldRender=root.render;
    if(!oldRender||oldRender.__uoWrapped)return;
    function wrapped(){
      var tab=sessionStorage.getItem('u-tab')||'dashboard';
      if(tab==='products'){document.getElementById('main').innerHTML=productsPage();return}
      if(tab==='warehouses'){document.getElementById('main').innerHTML=warehousesPage();return}
      if(tab==='packages'){document.getElementById('main').innerHTML=packagesPage();return}
      return oldRender.apply(this,arguments);
    }
    wrapped.__uoWrapped=true;root.render=wrapped;
  }
  function stopOld(e){var el=e.target.closest('[data-u]');if(!el)return;var a=el.getAttribute('data-u')||'';if(a.indexOf('new:product')===0||a.indexOf('edit:product:')===0||a.indexOf('delete:product:')===0||a.indexOf('save:product')===0||a.indexOf('new:warehouse')===0||a.indexOf('edit:warehouse:')===0||a.indexOf('delete:warehouse:')===0||a.indexOf('save:warehouse')===0||a.indexOf('new:package')===0||a.indexOf('edit:package:')===0||a.indexOf('delete:package:')===0||a.indexOf('save:package')===0){e.stopImmediatePropagation();e.preventDefault();return true}return false}
  document.addEventListener('click',function(e){
    if(stopOld(e)){
      var el=e.target.closest('[data-u]'),a=el.getAttribute('data-u');
      if(a==='new:product')openProduct('');else if(a.indexOf('edit:product:')===0)openProduct(a.split(':').slice(2).join(':'));else if(a.indexOf('delete:product:')===0)deleteProduct(a.split(':').slice(2).join(':'));else if(a==='save:product')saveProduct();
      else if(a==='new:warehouse')openWarehouse('');else if(a.indexOf('edit:warehouse:')===0)openWarehouse(a.split(':').slice(2).join(':'));else if(a.indexOf('delete:warehouse:')===0)deleteWarehouse(a.split(':').slice(2).join(':'));else if(a==='save:warehouse')saveWarehouse();
      else if(a==='new:package')openPackage('');else if(a.indexOf('edit:package:')===0)openPackage(a.split(':').slice(2).join(':'));else if(a.indexOf('delete:package:')===0)deletePackage(a.split(':').slice(2).join(':'));else if(a==='save:package')savePackage();
      return;
    }
    var u=e.target.closest('[data-uo]');if(!u)return;var a=u.getAttribute('data-uo')||'';e.stopImmediatePropagation();
    if(a.indexOf('close:')===0){document.getElementById(a.slice(6))?.remove();root.__uoProductEditingId=root.__uoWarehouseEditingId=root.__uoPackageEditingId='';}
  },true);
  root.ProductUnitRules={catalog:UNIT_CATALOG.map(function(x){return x.id}),canPriceIn:function(p,u){return !!p&&u===(p.baseUnit||'عدد')||!!p&&u===(p.packageUnit||p.secondUnit||'')};
  install();
})(typeof globalThis!=='undefined'?globalThis:window);

if(typeof module!=='undefined'&&module.exports){module.exports={UNIT_CATALOG:UNIT_CATALOG};}
