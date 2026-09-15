'use strict';
(function(root, factory){
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.UIRuntimeGuards = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  var VALID_UI_TABS = Object.freeze([
    'dashboard','people','products','warehouses','inventory','prices','sales',
    'transactions','accounts','packages','statement','reports','settings'
  ]);
  function normalizeTab(value){
    value = String(value || '');
    return VALID_UI_TABS.indexOf(value) >= 0 ? value : 'dashboard';
  }
  function safeRender(renderFn, storage, mainEl){
    var keys = ['u-tab','v3-tab'];
    var requested = null;
    var activeKey = 'u-tab';
    if(storage && typeof storage.getItem === 'function'){
      for(var i=0;i<keys.length;i++){
        var candidate = storage.getItem(keys[i]);
        if(candidate){requested=candidate;activeKey=keys[i];break;}
      }
    }
    var normalized = normalizeTab(requested);
    if(storage && typeof storage.setItem === 'function'){
      storage.setItem('u-tab', normalized);
      storage.setItem('v3-tab', normalized);
    }
    try{
      renderFn();
      return {ok:true,recovered:normalized!==requested,key:activeKey};
    }catch(firstError){
      if(storage && typeof storage.setItem === 'function'){
        storage.setItem('u-tab','dashboard');
        storage.setItem('v3-tab','dashboard');
      }
      try{
        renderFn();
        return {ok:true,recovered:true,key:activeKey};
      }catch(secondError){
        if(mainEl)mainEl.innerHTML='<div class="u-empty v3-empty"><strong>خطای بارگذاری رابط</strong><br><small>'+String((secondError&&secondError.message)||(firstError&&firstError.message)||'Unknown error')+'</small></div>';
        return {ok:false,recovered:true,error:secondError,key:activeKey};
      }
    }
  }
  return {VALID_UI_TABS:VALID_UI_TABS,normalizeTab:normalizeTab,safeRender:safeRender};
});
