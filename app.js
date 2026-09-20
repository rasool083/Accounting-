"use strict";
(function(){
  function locked(){return !!(DB.settings&&DB.settings.pin&&sessionStorage.getItem('ACC_UNLOCKED')!=='1')}
  function showLock(){var el=document.getElementById('lockscr');if(!el)return;el.classList.add('on');var input=document.getElementById('pinIn');if(input){input.value='';setTimeout(function(){input.focus()},50)}}
  function hideLock(){var el=document.getElementById('lockscr');if(el)el.classList.remove('on');sessionStorage.setItem('ACC_UNLOCKED','1')}
  function bindLockControls(){var ok=document.getElementById('pinOk'),pin=document.getElementById('pinIn'),toggle=document.getElementById('lockToggle');if(ok){ok.addEventListener('click',function(){if(!DB.settings.pin||!pin||pin.value===DB.settings.pin)hideLock();else if(window.toast)toast('PIN نادرست است','d',4000)})}if(pin){pin.addEventListener('keydown',function(e){if(e.key==='Enter'&&ok)ok.click()})}if(toggle){toggle.addEventListener('click',function(){sessionStorage.removeItem('ACC_UNLOCKED');showLock()})}}
  function start(){try{DB.load();}catch(e){var main=document.getElementById('main');if(main)main.innerHTML='<div class="u-empty v3-empty"><strong>خطای بارگذاری داده</strong><br><small>'+String(e&&e.message||e)+'</small></div>';return;}bindLockControls();var guard=window.UIRuntimeGuards;if(guard&&typeof guard.safeRender==='function'){guard.safeRender(function(){window.render();},sessionStorage,document.getElementById('main'));}else{try{window.render();}catch(e){var main2=document.getElementById('main');if(main2)main2.innerHTML='<div class="u-empty v3-empty"><strong>خطای بارگذاری رابط</strong><br><small>'+String(e&&e.message||e)+'</small></div>';}}if(typeof window.__u11Render==='function'){window.__u11Render();}if(locked())showLock();}
  window.App={start:start,render:function(){window.render();if(typeof window.__u11Render==='function')window.__u11Render();},load:function(){DB.load()}};
})();
document.addEventListener('DOMContentLoaded',function(){window.App.start()});
