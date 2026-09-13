'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function el(){return {innerHTML:'',dataset:{},value:'',addEventListener(){},closest(){return null;},matches(){return false;},querySelector(){return null;},querySelectorAll(){return[];}};}
test('v2 UI modules load and render dashboard without DOM runtime errors',()=>{
 const elements={nav:el(),main:el(), 'modal-root':el()};
 const context={console,Date,alert(){},localStorage:{_data:{},getItem(k){return this._data[k]??null;},setItem(k,v){this._data[k]=String(v);}},document:{getElementById(id){return elements[id]||(elements[id]=el());},addEventListener(){}},window:{},structuredClone};context.globalThis=context;context.window=context;
 for(const file of ['domain.js','operations.js','business-modules.js','data.js','inventory.js','transactions.js','transactions-modules.js','transactions-ui-support.js','reports.js','project-ui-v2.js','app.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
 context.DB.load();context.ProjectUI.render();
 assert.match(elements.main.innerHTML,/فروش خالص/);assert.match(elements.nav.innerHTML,/اشخاص/);
});
