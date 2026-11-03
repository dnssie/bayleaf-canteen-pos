/* Admin view adapter over the same browser catalog and receipt source used by Cashier. */
(() => {
  'use strict';
  const receipts=window.BayleafCashierData,catalog=window.BayleafCatalogData;
  const dayKey=receipts.dayKey;
  const dayDate=key=>new Date(key+'T00:00:00.000Z');
  const keyOf=date=>date.toISOString().slice(0,10);
  const shortDate=key=>new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'}).format(dayDate(key));
  const validDay=key=>typeof key==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(key)&&!isNaN(dayDate(key))&&keyOf(dayDate(key))===key;
  function range(period,anchor,custom){
    if(period==='custom'){
      if(!custom||!validDay(custom.start)||!validDay(custom.end)||custom.end<custom.start)throw new Error('Choose a valid start and end date.');
      return {period,anchor:custom.start,start:custom.start,end:custom.end,label:custom.start===custom.end?shortDate(custom.start):shortDate(custom.start)+' – '+shortDate(custom.end)};
    }
    if(!validDay(anchor))throw new Error('Choose a valid report date.');
    const date=dayDate(anchor);let start=new Date(date),end=new Date(date),label=shortDate(anchor);
    if(period==='weekly'){
      start.setUTCDate(date.getUTCDate()-date.getUTCDay());end=new Date(start);end.setUTCDate(start.getUTCDate()+6);
      const same=start.getUTCMonth()===end.getUTCMonth()&&start.getUTCFullYear()===end.getUTCFullYear();
      label=same?String(start.getUTCDate()).padStart(2,'0')+'–'+shortDate(keyOf(end)):shortDate(keyOf(start))+' – '+shortDate(keyOf(end));
    }else if(period==='monthly'){
      start=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1));end=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0));
      label=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',month:'long',year:'numeric'}).format(date);
    }else if(period!=='daily')throw new Error('Choose a listed report period.');
    return {period,anchor,start:keyOf(start),end:keyOf(end),label};
  }
  const summarize=transactions=>{
    const gross=transactions.reduce((s,t)=>s+t.subtotal,0),discount=transactions.reduce((s,t)=>s+t.discount,0),net=transactions.reduce((s,t)=>s+t.total,0),count=transactions.length;
    return {gross,discount,net,count,average:count?Math.round(net/count):0};
  };
  function buckets(transactions,periodRange){
    const {period,start,end}=periodRange,values=[];
    if(period==='weekly'){
      for(let i=0;i<7;i++){const date=dayDate(start);date.setUTCDate(date.getUTCDate()+i);const key=keyOf(date);values.push({start:key,end:key,label:new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',weekday:'short'}).format(date)+' '+date.getUTCDate()});}
    }else if(period==='monthly'){
      const month=start.slice(0,8),last=dayDate(end).getUTCDate(),name=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',month:'short'}).format(dayDate(start));
      for(const [a,b]of [[1,7],[8,14],[15,21],[22,last]])values.push({start:month+String(a).padStart(2,'0'),end:month+String(b).padStart(2,'0'),label:String(a).padStart(2,'0')+'–'+String(b).padStart(2,'0')+' '+name});
    }else values.push({start,end,label:shortDate(start)});
    return values.map(bucket=>({...bucket,...summarize(transactions.filter(t=>{const day=dayKey(t.createdAt);return day>=bucket.start&&day<=bucket.end;}))}));
  }
  function assertAdmin(){if(window.BayleafDemo.session()?.role!=='admin')throw new Error('Sign in as Admin to continue.');}
  async function listTransactions(){assertAdmin();return receipts.listTransactions();}
  async function getTransaction(id){assertAdmin();return receipts.getTransaction(id);}
  async function report(period,anchor,custom){assertAdmin();const periodRange=range(period,anchor,custom),all=await listTransactions();const transactions=all.filter(t=>{const day=dayKey(t.createdAt);return day>=periodRange.start&&day<=periodRange.end;});return {...periodRange,...summarize(transactions),transactions,buckets:buckets(transactions,periodRange)};}
  function csv(report){
    const cell=value=>{let text=String(value);if(/^[=+\-@\t\r\n]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
    const columns=['Transaction no.','Completed at (Asia/Manila)','Cashier','Order type','Gross sales (PHP)','Discount (PHP)','Net sales (PHP)','Payment method'];
    const rows=report.transactions.map(t=>[t.id,new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',dateStyle:'short',timeStyle:'medium'}).format(new Date(t.createdAt)),t.cashier,t.orderType,(t.subtotal/100).toFixed(2),(t.discount/100).toFixed(2),(t.total/100).toFixed(2),'Cash']);
    return '\uFEFF'+[columns,...rows].map(row=>row.map(cell).join(',')).join('\r\n');
  }
  window.BayleafAdminData={listMenu:catalog.listMenu,saveItem:catalog.saveItem,setAvailability:catalog.setAvailability,signature:catalog.signature,listTransactions,getTransaction,report,csv,dayKey,shortDate,validDay,range};
})();
