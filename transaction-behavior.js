'use strict';
(function(){
  function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
  function people(){return (DB.people||[]).filter(x=>x.active!==false && (Array.isArray(x.roles)?x.roles:[x.role]).includes('customer'));}
  function accounts(){return ((DB.treasuryAccounts&&DB.treasuryAccounts.length)?DB.treasuryAccounts:DB.accounts||[]).filter(x=>x.active!==false);}
  function targetCell(row,status,selected){
    let list=[];
    if(status==='وصول شده')list=accounts().map(x=>({id:x.id,name:x.name||x.title||x.id}));
    else if(status==='تودیع شده')list=people().map(x=>({id:x.id,name:x.name||x.id}));
    else if(status==='برگشتی')return '<span class="target-empty">برگشتی</span>';
    else return '<span class="target-empty">—</span>';
    return '<select class="inline-target"><option value="">انتخاب کنید</option>'+list.map(x=>'<option value="'+esc(x.id)+'" '+(String(x.id)===String(selected||'')?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select>';
  }
  function refreshRowTarget(select){
    const row=select.closest('tr');if(!row)return;
    const id=select.dataset.id,kind=select.dataset.kind;
    const r=(kind==='receipt'?DB.receipts:DB.payments).find(x=>x.id===id);if(!r)return;
    const cell=row.querySelector('.target-cell');if(!cell)return;
    const selected=r.status==='تودیع شده'?r.depositPersonId:r.accountId;
    cell.innerHTML=targetCell(row,r.status,selected);
  }
  function hydrate(){
    document.querySelectorAll('.inline-status').forEach(refreshRowTarget);
  }
  document.addEventListener('change',function(e){
    if(e.target.matches('.inline-status')){
      const id=e.target.dataset.id,kind=e.target.dataset.kind,r=(kind==='receipt'?DB.receipts:DB.payments).find(x=>x.id===id);if(!r)return;
      r.status=e.target.value;
      if(r.status==='وصول شده')r.depositPersonId='';
      if(r.status==='تودیع شده')r.accountId='';
      DB.save();refreshRowTarget(e.target);
      return;
    }
    if(e.target.matches('.inline-target')){
      const row=e.target.closest('tr'),status=row?.querySelector('.inline-status')?.value,id=row?.querySelector('.inline-status')?.dataset.id,kind=row?.querySelector('.inline-status')?.dataset.kind,r=(kind==='receipt'?DB.receipts:DB.payments).find(x=>x.id===id);if(!r)return;
      if(status==='وصول شده')r.accountId=e.target.value;
      else if(status==='تودیع شده')r.depositPersonId=e.target.value;
      DB.save();
    }
  });
  const old=window.render;
  window.render=function(){const out=old();setTimeout(hydrate,0);return out;};
  if(window.App){const oldApp=window.App.render;window.App.render=function(){const r=oldApp();setTimeout(hydrate,0);return r;};}
})();
