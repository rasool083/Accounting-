'use strict';
(function(){
function addTab(id,label){const nav=document.getElementById('nav');if(!nav||nav.querySelector(`[data-tab="${id}"]`))return;const b=document.createElement('button');b.type='button';b.dataset.tab=id;b.textContent=label;b.onclick=function(){nav.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');window.ProjectUI.render();};nav.appendChild(b)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{addTab('warehouse','انبارها');addTab('capital','پله‌های سود');},30));
})();
