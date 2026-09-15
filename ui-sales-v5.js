'use strict';
(function(root){
  const E=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const A=k=>Array.isArray(DB[k])?DB[k]:[];
  const N=v=>Number(v)||0;
  const F=v=>Math.round(N(v)).toLocaleString('en-US');
  const today=()=>DB.todayJ?DB.todayJ():'';
  const id=p=>(window.uid?uid(p):p+Date.now().toString(36)+Math.random().toString(36).slice(2));
  const btn=(t,a,c='')=>'<button type="button" class="u-btn '+c+'" data-s5="'+E(a)+'">'+t+'</button>';
  const inp=(l,i,v='',type='text',x='')=>'<label class="u-field"><span>'+l+'</span><input id="'+i+'" type="'+type+'" value="'+E(v)+'" '+x+'></label>';
  const sel=(l,i,h)=>'<label class="u-field"><span>'+l+'</span><select id="'+i+'">'+h+'</select></label>';
  const modal=(i,t,b)=>'<div class="u-modal" id="'+i+'"><div class="u-card"><div class="u-head"><b>'+t+'</b><button type="button" class="u-close" data-s5="close:'+i+'">×</button></div><div class="u-body">'+b+'</div></div></div>';
  const customers=()=>A('people').filter(x=>x.active!==false&&((Array.isArray(x.roles)?x.roles:[x.role]).includes('customer')));
  const products=()=>A('products').filter(x=>x.active!==false);
  const opts=(a,ph)=>'<option value="">'+(ph||'انتخاب کنید')+'</option>'+a.map(x=>'<option value="'+E(x.id)+'">'+E(x.name||x.code||x.id)+'</option>').join('');
  function product(i){return A('products').find(x=>String(x.id)===String(i))||{}}

  // فروش همیشه با «قیمت هر عدد» از تاریخچه قیمت محاسبه می‌شود؛
  // واحد انتخابی فقط تعیین می‌کند چند عدد/قطعه فروخته شده است.
  function price(pid){
    const p=product(pid),d=today(),pieceUnit=p.baseUnit||'عدد';
    const rows=A('prices').filter(x=>String(x.productId)===String(pid)&&String(x.unit||x.pricingUnit||pieceUnit)===String(pieceUnit)&&String(x.effectiveDate||'')<=String(d)).sort((a,b)=>String(b.effectiveDate||'').localeCompare(String(a.effectiveDate||'')));
    return N(rows[0]?.price??rows[0]?.unitPrice);
  }

  function calculateSalePricing({product,unit,quantity,piecePrice,discount}){
    const qty=N(quantity);
    const pieces=unit==='کارتن'?qty*N(product?.unitsPerPackage||1):qty;
    const gross=pieces*N(piecePrice);
    const off=Math.max(0,N(discount));
    const net=Math.max(0,gross-off);
    return {unit:unit==='کارتن'?'کارتن':'عدد',quantity:qty,unitPrice:N(piecePrice),baseQuantity:pieces,gross,discount:off,net};
  }
  root.SaleUnitPricing={calculate:calculateSalePricing};

  function selectedUnit(){return document.getElementById('s5-unit')?.value||'عدد'}
  function recalc(){
    const pid=document.getElementById('s5-product')?.value,p=product(pid),kind=selectedUnit(),qty=N(document.getElementById('s5-qty')?.value||0);
    const piecePrice=price(pid);
    const result=calculateSalePricing({product:p,unit:kind,quantity:qty,piecePrice,discount:N(document.getElementById('s5-discount')?.value||0)});
    document.getElementById('s5-price').value=result.unitPrice||0;
    document.getElementById('s5-baseqty').value=result.baseQuantity;
    document.getElementById('s5-calc').textContent='تعداد قطعه: '+F(result.baseQuantity)+' عدد | مبلغ ناخالص: '+F(result.gross)+' | تخفیف: '+F(result.discount)+' | مبلغ نهایی: '+F(result.net);
    return {p,unit:result.unit,qty:result.quantity,unitPrice:result.unitPrice,baseQty:result.baseQuantity,gross:result.gross,discount:result.discount,net:result.net}
  }
  function salesPage(){
    const rows=A('sales').slice().reverse().filter(x=>!x.isDiscountDocument).map(x=>'<tr><td>'+E(x.invoiceNo||'—')+'</td><td>'+E(x.jDate||'')+'</td><td>'+E(A('people').find(p=>p.id===x.customerId)?.name||'—')+'</td><td>'+E(product(x.productId).name||'—')+'</td><td>'+E(x.salesUnit||x.unit||'عدد')+'</td><td>'+F(x.quantity)+'</td><td>'+F(x.unitPrice)+'</td><td>'+F(x.grossAmount??x.amount)+'</td><td>'+F(x.discount||0)+'</td><td>'+F(x.netAmount??x.amount)+'</td></tr>');
    const table=rows.length?'<div class="u-table"><table><thead><tr><th>فاکتور</th><th>تاریخ</th><th>مشتری</th><th>کالا</th><th>واحد</th><th>مقدار</th><th>قیمت هر عدد</th><th>ناخالص</th><th>تخفیف</th><th>نهایی</th></tr></thead><tbody>'+rows.join('')+'</tbody></table></div>':'<div class="u-empty">فروشی ثبت نشده است.</div>';
    const saleModal=modal('s5-sale','ثبت فروش',sel('مشتری','s5-customer',opts(customers(),'انتخاب مشتری'))+sel('کالا','s5-product',opts(products(),'انتخاب کالا'))+sel('واحد فروش','s5-unit','<option value="عدد">عدد</option><option value="کارتن">کارتن</option>')+inp('مقدار','s5-qty','1','number','min="0.000001" step="any"')+inp('قیمت هر عدد','s5-price','0','number','readonly')+inp('تعداد قطعه','s5-baseqty','0','number','readonly')+inp('تخفیف این فاکتور','s5-discount','0','number','min="0" step="any"')+'<div id="s5-calc" class="u-calc">تعداد قطعه: ۰ عدد | مبلغ ناخالص: ۰ | تخفیف: ۰ | مبلغ نهایی: ۰</div>'+inp('شماره فاکتور','s5-invoice')+inp('تاریخ','s5-date',today())+'<div class="u-save">'+btn('ثبت فروش','save:sale','success')+btn('انصراف','close:s5-sale')+'</div>');
    const discountModal=modal('s5-discount','تخفیف مستقل',sel('مشتری','s5-d-customer',opts(customers(),'انتخاب مشتری'))+inp('مبلغ تخفیف','s5-d-amount','0','number','min="0" step="any"')+inp('شماره مرجع','s5-d-invoice','تخفیف')+inp('تاریخ','s5-d-date',today())+inp('توضیحات','s5-d-note')+'<div class="u-note">تخفیف مستقل به‌صورت سند صفرمحصول ثبت می‌شود تا از مانده حساب مشتری کسر شود؛ در محاسبه فروش اصلی به‌عنوان قیمت کالا وارد نمی‌شود.</div><div class="u-save">'+btn('ثبت تخفیف','save:discount','success')+btn('انصراف','close:s5-discount')+'</div>');
    return '<section class="u-page"><div class="u-title"><h2>فروش و فاکتور</h2>'+btn('＋ فروش جدید','new:sale','primary')+btn('＋ تخفیف مستقل','new:discount','warning')+'</div>'+table+saleModal+discountModal+'</section>';
  }
  function openSale(){document.getElementById('s5-sale').classList.add('open');recalc()}
  function saveSale(){const customerId=document.getElementById('s5-customer').value,productId=document.getElementById('s5-product').value,date=document.getElementById('s5-date').value;const x=recalc();if(!customerId||!productId||!date||!(x.qty>0)){toast('مشتری، کالا، مقدار و تاریخ الزامی است','d',3000);return}const s={id:id('S'),invoiceNo:document.getElementById('s5-invoice').value||id('INV'),jDate:date,customerId,productId,salesUnit:x.unit,unit:x.unit,quantity:x.qty,baseQuantity:x.baseQty,unitPrice:x.unitPrice,grossAmount:x.gross,discount:x.discount,netAmount:x.net,amount:x.net,createdAt:today()};DB.sales.push(s);DB.save('sales');DB.auditLog('CREATE','sales',s.id,'ثبت فروش');document.getElementById('s5-sale').classList.remove('open');root.render()}
  function saveDiscount(){const customerId=document.getElementById('s5-d-customer').value,amount=N(document.getElementById('s5-d-amount').value),date=document.getElementById('s5-d-date').value;if(!customerId||!(amount>0)||!date){toast('مشتری، مبلغ و تاریخ تخفیف الزامی است','d',3000);return}const s={id:id('SD'),invoiceNo:document.getElementById('s5-d-invoice').value||'تخفیف',jDate:date,customerId,productId:'',quantity:0,baseQuantity:0,unitPrice:0,grossAmount:-amount,discount:amount,netAmount:-amount,amount:-amount,isDiscountDocument:true,note:document.getElementById('s5-d-note').value,createdAt:today()};DB.sales.push(s);DB.save('sales');DB.auditLog('CREATE','sales',s.id,'ثبت تخفیف مستقل');document.getElementById('s5-discount').classList.remove('open');root.render()}
  const originalRender=root.render;root.render=function(){if((sessionStorage.getItem('u-tab')||'dashboard')==='sales'){document.getElementById('main').innerHTML=salesPage();return}return originalRender.apply(this,arguments)};
  document.addEventListener('click',function(e){const el=e.target.closest('[data-s5]');if(!el)return;const a=el.getAttribute('data-s5')||'';if(a==='new:sale'){e.preventDefault();e.stopImmediatePropagation();openSale();return}if(a==='new:discount'){e.preventDefault();e.stopImmediatePropagation();document.getElementById('s5-discount').classList.add('open');return}if(a==='save:sale'){e.preventDefault();e.stopImmediatePropagation();saveSale();return}if(a==='save:discount'){e.preventDefault();e.stopImmediatePropagation();saveDiscount();return}if(a.indexOf('close:')===0){e.preventDefault();e.stopImmediatePropagation();document.getElementById(a.slice(6))?.classList.remove('open');return}},true);
  document.addEventListener('input',function(e){if(['s5-product','s5-unit','s5-qty','s5-discount'].includes(e.target.id))recalc()},true);
  document.addEventListener('change',function(e){if(['s5-product','s5-unit'].includes(e.target.id))recalc()},true);
})(window);
