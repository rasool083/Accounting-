"use strict";
(function(root,factory){var api=factory(root);if(typeof module!=="undefined"&&module.exports)module.exports=api;root.Repository=api.Repository})(typeof globalThis!=="undefined"?globalThis:this,function(root){
  var PREFIX='ACC_';
  function read(k,def){try{var raw=root.localStorage&&root.localStorage.getItem(PREFIX+k);return raw?JSON.parse(raw):def}catch(e){return def}}
  function write(k,v){try{root.localStorage.setItem(PREFIX+k,JSON.stringify(v));return true}catch(e){return false}}
  function loadAll(){
    var raw={};['people','products','prices','sales','receipts','payments','checks','purchases','saleReturns','purchaseReturns','accounts','transfers','expenses','incomes','adjustments','audit','operations','effects','receiptAllocations','settings'].forEach(function(k){raw[k]=read(k,k==='settings'?null:[])});
    return typeof root.Migration!=='undefined'?root.Migration.normalize(raw):raw;
  }
  function save(table,rows){return write(table,rows)}
  function replaceAll(state){Object.keys(state||{}).forEach(function(k){write(k,state[k])});return true}
  return {Repository:{loadAll:loadAll,save:save,replaceAll:replaceAll}}
});
