'use strict';
(function(){
  var esc=function(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})};
  var people=function(){return Array.isArray(DB.people)?DB.people:[]};
  var byId=function(id){return people().find(function(p){return String(p.id)===String(id)})};
  var roleLabel={customer:'مشتری',supplier:'تأمین‌کننده',partner:'شریک',worker:'کارگر',other:'سایر'};
  var roleOptions=function(selected){return Object.keys(roleLabel).map(function(k){return '<option value="'+k+'"'+(selected===k?' selected':'')+'>'+roleLabel[k]+'</option>'}).join('')};
  var modalCss='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,.62);backdrop-filter:blur(5px);';
  var cardCss='width:min(440px,calc(100vw - 20px));max-height:92vh;overflow:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 22px 70px rgba(2,8,23,.35);';
  var fieldCss='display:block;margin:0 0 9px';
  var inputCss='width:100%;padding:9px 10px;border:1px solid #dce3ec;border-radius:9px;background:#f8fafc;outline:0;box-sizing:border-box';
  function form(person){
    person=person||{};
    var role=Array.isArray(person.roles)?person.roles[0]:(person.role||'customer');
    return '<div id="people-modal" style="'+modalCss+'">'+
      '<div style="'+cardCss+'" role="dialog" aria-modal="true" aria-labelledby="people-modal-title">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 13px;border-bottom:1px solid #e5e7eb;background:#fbfdff">'+
      '<b id="people-modal-title" style="font-size:14px">'+(person.id?'ویرایش شخص':'شخص جدید')+'</b><button type="button" data-people-action="close" aria-label="بستن" style="width:32px;height:32px;border:0;border-radius:9px;background:#eef2f7;font-size:21px">×</button></div>'+ 
      '<div style="padding:12px 13px">'+
      field('نام *','people-name',person.name||'','text',true)+
      field('شرکت / مجموعه','people-company',person.company||'')+
      field('تلفن','people-phone',person.phone||'','tel')+
      field('آدرس','people-address',person.address||'')+
      '<label style="'+fieldCss+'"><span style="display:block;color:#68758a;font-size:10.5px;font-weight:800;margin-bottom:4px">نقش</span><select id="people-role" style="'+inputCss+'">'+roleOptions(role)+'</select></label>'+ 
      '<label style="'+fieldCss+'"><span style="display:block;color:#68758a;font-size:10.5px;font-weight:800;margin-bottom:4px">وضعیت</span><select id="people-active" style="'+inputCss+'"><option value="1"'+(person.active!==false?' selected':'')+'>فعال</option><option value="0"'+(person.active===false?' selected':'')+'>غیرفعال</option></select></label>'+ 
      '<div style="display:flex;gap:7px;justify-content:flex-start;flex-wrap:wrap;margin-top:11px"><button type="button" data-people-action="save" style="border:1px solid #15803d;background:#15803d;color:#fff;border-radius:9px;padding:8px 13px;font-weight:800">ذخیره</button><button type="button" data-people-action="close" style="border:1px solid #dce3ec;background:#fff;border-radius:9px;padding:8px 13px;font-weight:800">انصراف</button></div>'+ 
      '</div></div></div>';
  }
  function field(label,id,value,type,required){return '<label style="'+fieldCss+'"><span style="display:block;color:#68758a;font-size:10.5px;font-weight:800;margin-bottom:4px">'+label+'</span><input id="'+id+'" type="'+(type||'text')+'" value="'+esc(value)+'" '+(required?'required':'')+' style="'+inputCss+'"></label>'}
  function page(){
    var rows=people().map(function(p){var role=Array.isArray(p.roles)?p.roles.map(function(r){return roleLabel[r]||r}).join('، '):(roleLabel[p.role]||p.role||'—');return '<tr><td>'+esc(p.name||'—')+'</td><td>'+esc(p.company||'—')+'</td><td>'+esc(p.phone||'—')+'</td><td>'+esc(role)+'</td><td><span style="display:inline-block;padding:4px 8px;border-radius:99px;font-size:10px;font-weight:800;background:'+(p.active===false?'#fee2e2;color:#991b1b':'#dcfce7;color:#166534')+'">'+(p.active===false?'غیرفعال':'فعال')+'</span></td><td><button class="u-btn icon" data-people-action="edit" data-id="'+esc(p.id)+'">ویرایش</button> <button class="u-btn icon danger" data-people-action="delete" data-id="'+esc(p.id)+'">حذف</button></td></tr>'}).join('');
    return '<section class="u-page"><div class="u-title"><h2>اشخاص</h2><button class="u-btn primary" data-people-action="new">＋ افزودن شخص</button></div><div class="u-cardbox" style="margin-bottom:10px"><div class="u-summary">ثبت و مدیریت اشخاص در یک پنجره مرکزی؛ فهرست اشخاص همیشه در همین صفحه قابل مشاهده است.</div></div>'+(rows?'<div class="u-table"><table><thead><tr><th>نام</th><th>شرکت</th><th>تلفن</th><th>نقش</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="u-empty">هنوز شخصی ثبت نشده است.</div>')+'</section>';
  }
  function open(person){document.getElementById('main').insertAdjacentHTML('beforeend',form(person));var n=document.getElementById('people-name');if(n){n.focus();n.select&&n.select()}}
  function close(){document.getElementById('people-modal')?.remove()}
  function savePerson(){
    var name=(document.getElementById('people-name')?.value||'').trim();
    if(!name){window.toast&&toast('نام شخص الزامی است','d',3000);return}
    var editing=window.__peopleEditingId?byId(window.__peopleEditingId):null;
    var p=editing||{id:uid('P'),createdAt:todayISO()};
    p.name=name;p.company=document.getElementById('people-company')?.value.trim()||'';p.phone=document.getElementById('people-phone')?.value.trim()||'';p.address=document.getElementById('people-address')?.value.trim()||'';p.role=document.getElementById('people-role')?.value||'other';p.roles=[p.role];p.active=document.getElementById('people-active')?.value!=='0';p.updatedAt=todayISO();
    if(!editing) DB.people.push(p);
    DB.auditLog(editing?'UPDATE':'CREATE','people',p.id,editing?'ویرایش شخص':'ایجاد شخص');
    DB.save('people');window.__peopleEditingId='';close();window.render();
  }
  function deletePerson(id){
    var p=byId(id);if(!p)return;
    var linked=DB.sales.some(function(x){return x.customerId===id})||DB.receipts.some(function(x){return x.customerId===id})||DB.checks.some(function(x){return x.customerId===id});
    if(linked){p.active=false;p.updatedAt=todayISO();DB.auditLog('DEACTIVATE','people',id,'به دلیل وجود سوابق مالی، شخص حذف فیزیکی نشد و غیرفعال شد.');DB.save('people');window.render();window.toast&&toast('این شخص سابقه مالی دارد؛ به‌جای حذف، غیرفعال شد.','i',4500);return}
    if(!window.confirm('شخص «'+(p.name||'')+'» حذف شود؟'))return;
    DB.people=people().filter(function(x){return String(x.id)!==String(id)});DB.auditLog('DELETE','people',id,'حذف شخص بدون سابقه مالی');DB.save('people');window.render();
  }
  var originalRender=window.render;
  window.render=function(){
    var activeTab=sessionStorage.getItem('u-tab')||'dashboard';
    if(activeTab==='people'){
      try{nav();document.getElementById('main').innerHTML=page()}catch(e){document.getElementById('main').innerHTML='<div class="u-empty">خطا در نمایش اشخاص: '+esc(e.message||e)+'</div>'}
      return;
    }
    return originalRender.apply(this,arguments);
  };
  document.addEventListener('click',function(e){
    if((sessionStorage.getItem('u-tab')||'dashboard')!=='people')return;
    var el=e.target.closest('[data-people-action]');if(!el)return;
    var a=el.getAttribute('data-people-action');
    if(a==='new'){window.__peopleEditingId='';open(null)}
    else if(a==='edit'){window.__peopleEditingId=el.getAttribute('data-id')||'';open(byId(window.__peopleEditingId))}
    else if(a==='delete'){deletePerson(el.getAttribute('data-id')||'')}
    else if(a==='close'){window.__peopleEditingId='';close()}
    else if(a==='save'){savePerson()}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.getElementById('people-modal'))close()});
})();
