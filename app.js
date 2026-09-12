"use strict";
(function(){
  function locked(){return !!(DB.settings&&DB.settings.pin&&sessionStorage.getItem('ACC_UNLOCKED')!=='1')}
  function showLock(){var el=document.getElementById('lockscr');if(!el)return;el.classList.add('on');var input=document.getElementById('pinIn');input.value='';setTimeout(function(){input.focus()},50)}
  function hideLock(){var el=document.getElementById('lockscr');if(el)el.classList.remove('on');sessionStorage.setItem('ACC_UNLOCKED','1')}
  function start(){
    DB.load();
    var lock=document.getElementById('lockscr'),pin=document.getElementById('pinIn');
    document.getElementById('pinOk').addEventListener('click',function(){if(!DB.settings.pin||pin.value===DB.settings.pin)hideLock();else toast('PIN نادرست است','d')});
    pin.addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('pinOk').click()});
    document.getElementById('lockToggle').addEventListener('click',function(){sessionStorage.removeItem('ACC_UNLOCKED');showLock()});
    render();if(locked())showLock();
  }
  window.App={start:start,render:render,load:function(){DB.load()}};
})();
document.addEventListener('DOMContentLoaded',function(){window.App.start()});
