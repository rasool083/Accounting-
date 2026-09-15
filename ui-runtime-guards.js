'use strict';
(function(root, factory){
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.UIRuntimeGuards = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  var VALID_V3_TABS = Object.freeze([
    'dashboard','people','products','warehouses','inventory','prices','sales',
    'transactions','packages','accounts','purchases','production','reports','settings'
  ]);
  function normalizeV3Tab(value){
    value = String(value || '');
    return VALID_V3_TABS.indexOf(value) >= 0 ? value : 'dashboard';
  }
  function safeRenderV3(renderFn, storage, mainEl){
    var requested = storage && typeof storage.getItem === 'function' ? storage.getItem('v3-tab') : null;
    var normalized = normalizeV3Tab(requested);
    if (storage && typeof storage.setItem === 'function' && normalized !== requested) storage.setItem('v3-tab', normalized);
    try {
      renderFn();
      return {ok:true, recovered:normalized !== requested};
    } catch(firstError){
      if (storage && typeof storage.setItem === 'function') storage.setItem('v3-tab','dashboard');
      try {
        renderFn();
        return {ok:true, recovered:true};
      } catch(secondError){
        if (mainEl) mainEl.innerHTML = '<div class="v3-empty"><strong>خطای بارگذاری رابط</strong><br><small>' + String((secondError && secondError.message) || (firstError && firstError.message) || 'Unknown error') + '</small></div>';
        return {ok:false, recovered:true, error:secondError};
      }
    }
  }
  return {VALID_V3_TABS:VALID_V3_TABS, normalizeV3Tab:normalizeV3Tab, safeRenderV3:safeRenderV3};
});
