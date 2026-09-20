"use strict";
(function(){
  var extra=[
    {id:"warehouses",label:"انبارها",icon:"🏭"},
    {id:"packages",label:"بسته و پله‌ها",icon:"📐"},
    {id:"transactions",label:"دریافت / پرداخت",icon:"💳"}
  ];
  window.__installNavigationHotfix=function(){
    if(!Array.isArray(window.TABS))return;
    extra.forEach(function(item){
      if(!window.TABS.some(function(t){return t.id===item.id;}))window.TABS.push(item);
    });
    var nav=document.getElementById("nav");
    if(nav&&!nav.__navHotfixBound){
      nav.__navHotfixBound=true;
      nav.addEventListener("click",function(e){
        var b=e.target.closest("[data-tab]");
        if(!b)return;
        var id=b.getAttribute("data-tab");
        if(extra.some(function(t){return t.id===id;})){
          e.preventDefault();
          e.stopImmediatePropagation();
          sessionStorage.setItem("u-tab",id);
          if(typeof window.App==='object'&&typeof window.App.render==='function')window.App.render();
        }else{
          sessionStorage.removeItem("u-tab");
        }
      },true);
    }
  };
  if(document.readyState!=="loading")window.__installNavigationHotfix();
  else document.addEventListener("DOMContentLoaded",window.__installNavigationHotfix,{once:true});
})();
