'use strict';
(function(){function start(){DB.load();ProjectUI.render();}window.App={start,render:()=>ProjectUI.render()};})();
document.addEventListener('DOMContentLoaded',()=>window.App.start());
