"use strict";
(function(root,factory){var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.Backup=api.Backup})(typeof globalThis!=="undefined"?globalThis:this,function(){
  function exportData(state){return JSON.stringify({schemaVersion:2,exportedAt:new Date().toISOString(),data:state||{}},null,2)}
  function importData(text){var parsed;try{parsed=JSON.parse(text)}catch(e){throw new Error('JSON backup is invalid')};var data=parsed&&parsed.data?parsed.data:parsed;if(!data||typeof data!=='object')throw new Error('JSON backup is invalid');return typeof globalThis.Migration!=='undefined'?globalThis.Migration.normalize(data):data}
  return {Backup:{export:exportData,import:importData}}
});
