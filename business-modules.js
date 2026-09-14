"use strict";
(function(root){
  var STATUS={
    RECEIVED:'نزد ما',
    DEPOSITED:'تودیع‌شده',
    COLLECTED:'وصول شده',
    RETURNED:'برگشتی',
    SPENT:'خرج‌شده',
    VOID:'باطل'
  };
  var allowed={
    'نزد ما':['نزد ما','تودیع‌شده','وصول شده','برگشتی','خرج‌شده','باطل'],
    'تودیع‌شده':['تودیع‌شده','وصول شده','برگشتی','خرج‌شده'],
    'وصول شده':['وصول شده'],
    'برگشتی':['برگشتی'],
    'خرج‌شده':['خرج‌شده'],
    'باطل':['باطل']
  };
  function checkStatusTransition(from,to){
    if(!allowed[from]||allowed[from].indexOf(to)<0) throw new Error('INVALID_CHECK_STATUS_TRANSITION');
    return true;
  }
  root.AccountingModules={STATUS:STATUS,checkStatusTransition:checkStatusTransition};
})(typeof window!=='undefined'?window:globalThis);
