"use strict";
(function(){
  function locked(){return !!(DB.settings&&DB.settings.pin&&sessionStorage.getItem('ACC_UNLOCKED')!=='1')}
  function showLock(){var x=document.getElementById('lockscr');if(x)x.classList.add('on');var i=document.getElementById('pinIn');if(i){i.value='';setTimeout(function(){i.focus()},50)}}
  function hideLock(){var x=document.getElementById('lockscr');if(x)x.classList.remove('on');sessionStorage.setItem('ACC_UNLOCKED','1')}
  function start(){DB.load();var pin=document.getElementById('pinIn');document.getElementById('pinOk').onclick=function(){if(!DB.settings.pin||pin.value===DB.settings.pin)hideLock();else toast('PIN نادرست است','d')};pin.onkeydown=function(e){if(e.key==='Enter')document.getElementById('pinOk').click()};document.getElementById('lockToggle').onclick=function(){sessionStorage.removeItem('ACC_UNLOCKED');showLock()};AccountingV2.start();if(locked())showLock()}
  window.App={start:start,render:function(){AccountingV2.start()},load:function(){DB.load()}};
})();
document.addEventListener('DOMContentLoaded',function(){window.App.start()});
