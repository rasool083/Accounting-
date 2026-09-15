'use strict';
(function(){
  // The warehouse editor is inserted through insertAdjacentHTML in the override layer.
  // Recover the modal-open state after the legacy handler finishes, without touching people-ui.js.
  window.addEventListener('click',function(e){
    var el=e.target.closest('[data-u]');
    if(!el)return;
    var a=el.getAttribute('data-u')||'';
    if(a==='new:warehouse'||a.indexOf('edit:warehouse:')===0){
      setTimeout(function(){var m=document.getElementById('uo-warehouse');if(m)m.classList.add('open')},0);
    }
  },true);
})();
