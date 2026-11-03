/* Optional Admin interactions. All data reads/writes are delegated to the replaceable adapters. */
(() => {
  'use strict';
  const screen=document.body.dataset.adminScreen;if(!screen||window.BayleafDemo.session()?.role!=='admin')return;
  const data=window.BayleafAdminData,{money,esc}=window.BayleafOrder;
  const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
  const set=(selector,value)=>all(selector).forEach(n=>n.textContent=value);
  const today=data.dayKey(new Date());
  const time=value=>data.shortDate(data.dayKey(value))+' · '+new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'}).format(new Date(value));
  const badge=item=>`<span class="badge${item.active?'':' badge--inactive'}">${item.active?'Active':'Inactive'}</span>`;
  function message(text,error=false){const note=$('[data-admin-message]');note.hidden=false;note.textContent=text;note.classList.toggle('admin-message--error',error);}
  function clock(){set('[data-header-date]',new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'}).format(new Date()));set('[data-header-time]',new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'}).format(new Date()));}
  clock();setInterval(clock,60000);
  function parsePrice(value){const text=value.trim();if(!/^\d+(?:\.\d{1,2})?$/.test(text))return null;const [whole,decimal='']=text.split('.');const cents=Number(whole)*100+Number(decimal.padEnd(2,'0'));return Number.isSafeInteger(cents)?cents:null;}
  function tableRows(transactions,from='transactions',date='',selection=null){
    return transactions.map(t=>`<tr><td>${esc(t.id)}</td><td>${esc(time(t.createdAt))}</td><td>${esc(t.cashier)}</td><td>${money(t.total)}</td><td><a href="transaction-details.html?id=${encodeURIComponent(t.id)}&from=${encodeURIComponent(from)}${date?'&date='+encodeURIComponent(date):''}${selection?.kind==='range'?'&start='+selection.start+'&end='+selection.end:selection?.kind==='all'?'&all=1':''}">View details</a></td></tr>`).join('');
  }
  function drawTransactions(transactions,from,date){set('[data-transaction-count]','Showing '+transactions.length+' transactions');$('[data-transaction-rows]').innerHTML=tableRows(transactions,from,date);$('[data-transaction-empty]').hidden=transactions.length>0;}
  function metrics(view){set('[data-metric="0"]',money(view.net));set('[data-metric="1"]',String(view.count));set('[data-metric="2"]',money(view.average));set('[data-gross]',money(view.gross));set('[data-discounts]',money(view.discount));set('[data-net]',money(view.net));}
  function drawBars(container,view){
    container.className='report-bars '+(view.period==='monthly'?'monthly-bars':'weekly-bars');
    const max=Math.max(1,...view.buckets.map(b=>b.net));
    container.innerHTML=view.buckets.map(b=>`<div class="chart-column"><div class="bar-area"><strong>${money(b.net)}</strong><span class="sales-bar" style="height:${Math.round(b.net/max*110)}px"></span></div><span class="bar-label">${esc(b.label)}</span><span class="muted">${b.count} ${b.count===1?'transaction':'transactions'}</span></div>`).join('');
  }
  async function menu(){
    let items=[],selected=null,returnFocus=null,busy=false;
    const form=$('[data-menu-form]'),modal=$('[data-menu-modal]'),statusModal=$('[data-status-modal]'),search=$('[data-menu-search]'),category=$('[data-menu-category]');
    const initialNodes=[...document.querySelector('.admin-workspace').children].filter(n=>!n.classList.contains('admin-modal-layer'));
    function filter(){
      const query=search.value.trim().toLowerCase(),visible=items.filter(item=>(!query||item.name.toLowerCase().includes(query))&&(!category.value||item.category===category.value));
      set('[data-page-subtitle]',items.length+' menu items · '+items.filter(i=>i.active).length+' active · '+items.filter(i=>!i.active).length+' inactive');
      $('[data-menu-rows]').innerHTML=visible.map(item=>`<tr data-menu-row="${esc(item.id)}"${item.active?'':' class="inactive-menu-row"'}><td title="${esc(item.name)}">${esc(item.name)}</td><td>${esc(item.category)}</td><td>${money(item.price)}</td><td>${badge(item)}</td><td><div class="menu-row-actions"><button type="button" data-edit-item="${esc(item.id)}">Edit</button><button type="button" data-toggle-item="${esc(item.id)}" class="${item.active?'destructive-link':''}">${item.active?'Deactivate':'Activate'}</button></div></td></tr>`).join('');
      $('[data-menu-empty]').hidden=visible.length>0;
    }
    async function refresh(){items=await data.listMenu();filter();}
    function inert(on){document.querySelector('.sidebar').inert=on;initialNodes.forEach(n=>n.inert=on);}
    function close(){if(busy)return;modal.hidden=true;statusModal.hidden=true;inert(false);const target=returnFocus?.dataset.editItem?document.querySelector('[data-edit-item="'+CSS.escape(returnFocus.dataset.editItem)+'"]'):returnFocus?.dataset.toggleItem?document.querySelector('[data-toggle-item="'+CSS.escape(returnFocus.dataset.toggleItem)+'"]'):returnFocus; (target?.isConnected?target:$('[data-add-item]')).focus({preventScroll:true});}
    function resetErrors(){all('[data-error],[data-form-error],[data-confirm-error]').forEach(n=>{n.hidden=true;n.textContent='';});all('[data-menu-form] input,[data-menu-form] select').forEach(n=>{n.removeAttribute('aria-invalid');n.closest('.field').classList.remove('field--error');});}
    function openForm(item,trigger){
      selected=item?JSON.parse(JSON.stringify(item)):null;returnFocus=trigger;form.dataset.mode=item?'edit':'add';form.reset();resetErrors();
      set('#menu-dialog-title',item?'Edit Menu Item':'Add Menu Item');set('[data-form-description]',item?'Update this item on the cashier menu.':'Add a new item to the menu.');set('[data-save-item]',item?'Save Changes':'Save');
      form.elements.name.value=item?.name||'';form.elements.category.value=item?.category||'';form.elements.price.value=item?(item.price/100).toFixed(2):'';
      $('[data-form-status]').innerHTML=item?'<div class="form-current-status"><span>Status</span>'+badge(item)+'</div>':'<p class="small muted">New items appear on the cashier menu right away.</p>';
      modal.hidden=false;inert(true);modal.querySelector('[role=dialog]').focus({preventScroll:true});
    }
    function openStatus(item,trigger){
      selected=JSON.parse(JSON.stringify(item));returnFocus=trigger;resetErrors();
      set('#status-dialog-title',item.active?'Deactivate menu item?':'Activate menu item?');set('[data-confirm-name]',item.name);
      set('[data-confirm-description]',item.name+(item.active?' will be hidden from the cashier menu. Past orders and receipts will stay the same.':' will be available on the cashier menu. Past orders and receipts will stay the same.'));
      const confirm=$('[data-confirm-status]');confirm.textContent=item.active?'Deactivate Item':'Activate Item';confirm.classList.toggle('btn--danger',item.active);
      statusModal.hidden=false;inert(true);statusModal.querySelector('[role=dialog]').focus({preventScroll:true});
    }
    document.addEventListener('click',event=>{
      const add=event.target.closest('[data-add-item]'),edit=event.target.closest('[data-edit-item]'),toggle=event.target.closest('[data-toggle-item]');
      if(add)openForm(null,add);else if(edit){const item=items.find(i=>i.id===edit.dataset.editItem);if(item)openForm(item,edit);}else if(toggle){const item=items.find(i=>i.id===toggle.dataset.toggleItem);if(item)openStatus(item,toggle);}else if(event.target.closest('[data-close-modal]'))close();
    });
    document.addEventListener('keydown',event=>{
      const layer=!modal.hidden?modal:!statusModal.hidden?statusModal:null;if(!layer)return;
      if(event.key==='Escape'){event.preventDefault();close();return;}
      if(event.key==='Tab'){const focusable=[...layer.querySelectorAll('button,input,select,[href]')].filter(n=>!n.disabled&&!n.hidden);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===layer.querySelector('[role=dialog]'))){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
    });
    function setBusy(value){busy=value;all('.admin-dialog button').forEach(n=>n.disabled=value);all('[data-menu-form] input,[data-menu-form] select').forEach(n=>n.disabled=value);}
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(busy)return;resetErrors();
      const values={name:form.elements.name.value.trim(),category:form.elements.category.value,price:parsePrice(form.elements.price.value)};
      const errors={};if(!values.name)errors.name='Enter an item name.';if(!['Ulam','Gulay','Rice','Add-ons'].includes(values.category))errors.category='Select a category.';if(values.price===null)errors.price='Enter a non-negative price with up to two decimal places.';
      for(const [key,text]of Object.entries(errors)){const note=$('[data-error="'+key+'"]');note.textContent=text;note.hidden=false;form.elements[key].setAttribute('aria-invalid','true');form.elements[key].closest('.field').classList.add('field--error');}
      if(Object.keys(errors).length){form.elements[Object.keys(errors)[0]].focus();return;}
      setBusy(true);
      try{const saved=await data.saveItem(selected?.id||null,values,selected?data.signature(selected):null);await refresh();setBusy(false);close();message(saved.name+(selected?' updated.':' added.'));}
      catch(error){setBusy(false);set('[data-form-error]',error.message);$('[data-form-error]').hidden=false;}
    });
    $('[data-confirm-status]').addEventListener('click',async()=>{
      if(busy||!selected)return;setBusy(true);
      try{const saved=await data.setAvailability(selected.id,!selected.active,data.signature(selected));await refresh();setBusy(false);close();message(saved.name+(saved.active?' activated.':' deactivated.'));}
      catch(error){setBusy(false);set('[data-confirm-error]',error.message);$('[data-confirm-error]').hidden=false;}
    });
    search.addEventListener('input',filter);category.addEventListener('change',filter);
    window.addEventListener('bayleaf:catalog-changed',()=>refresh().catch(error=>message(error.message,true)));
    window.addEventListener('storage',event=>{if(event.key===window.BayleafCatalogData.key||event.key===null)refresh().catch(error=>message(error.message,true));});
    try{await refresh();}catch(error){$('[data-menu-rows]').innerHTML='';$('[data-add-item]').disabled=true;throw error;}
  }
  async function transactions(){
    let records=await data.listTransactions();const search=$('[data-transaction-search]'),date=$('[data-admin-date]'),wrapper=date.closest('.admin-date'),params=new URLSearchParams(location.search);
    let selection=params.get('all')==='1'?{kind:'all'}:data.validDay(params.get('start'))&&data.validDay(params.get('end'))&&params.get('end')>=params.get('start')?{kind:'range',start:params.get('start'),end:params.get('end')}:{kind:'date',start:data.validDay(params.get('date'))?params.get('date'):today};
    const picker=window.BayleafDates.create(wrapper,{today,title:'Filter transaction dates',allowRange:true,reset:'all',resetLabel:'All dates',presets:[{value:'daily',label:'Today'},{value:'weekly',label:'This week'},{value:'monthly',label:'This month'},{value:'all',label:'All dates'}]});
    function filter(){
      const query=search.value.trim().toLowerCase(),start=selection.start,end=selection.end||start;
      const visible=records.filter(t=>{const day=data.dayKey(t.createdAt);return(!query||t.id.toLowerCase().includes(query))&&(selection.kind==='all'||day>=start&&day<=end);});
      date.value=start||'';
      const label=selection.kind==='all'?'All dates':start===end?data.shortDate(start):data.shortDate(start)+' – '+data.shortDate(end);
      set('[data-date-label]',label);picker.set({...selection,end});
      $('[data-transaction-rows]').innerHTML=tableRows(visible,'transactions',date.value,selection);$('[data-transaction-empty]').hidden=visible.length>0;
      set('[data-transaction-count]','Showing '+visible.length+' of '+records.length+' transactions');$('[data-clear-filters]').hidden=!query&&selection.kind==='all';
      if(!visible.length){set('[data-transaction-empty] h3',records.length?'No matching transactions':'No transactions yet');set('[data-transaction-empty] p',records.length?'Try another transaction number or date.':'Completed cash payments will appear here.');}
    }
    wrapper.addEventListener('datefilterchange',event=>{
      const next=event.detail;if(next.kind==='preset'){if(next.period==='all')selection={kind:'all'};else{const bounds=data.range(next.period,today);selection={kind:next.period==='daily'?'date':'range',start:bounds.start,end:bounds.end};}}else selection={kind:next.kind,start:next.start,end:next.end};filter();
    });
    search.addEventListener('input',filter);date.addEventListener('change',()=>{if(date.value&&!data.validDay(date.value))return;selection=date.value?{kind:'date',start:date.value}:{kind:'all'};filter();});
    $('[data-clear-filters]').addEventListener('click',()=>{search.value='';selection={kind:'all'};filter();});
    window.addEventListener('storage',event=>{if(event.key==='bayleaf.demo.transactions.v1'||event.key===null)data.listTransactions().then(v=>{records=v;filter();}).catch(error=>message(error.message,true));});filter();
  }
  async function details(){
    const params=new URLSearchParams(location.search),id=params.get('id'),view=id?await data.getTransaction(id):null;
    if(!view){$('.payment-columns').hidden=true;$('.receipt-actions').hidden=true;message('Transaction not found. Choose a completed transaction from the list.',true);return;}
    set('[data-page-subtitle]',view.id);set('[data-receipt-id]',view.id);set('[data-receipt-date]',time(view.createdAt));set('[data-cashier]',view.cashier);set('[data-order-type]',view.orderType);set('[data-item-count]',String(view.count));set('[data-subtotal]',money(view.subtotal));set('[data-discount-value]',money(view.discount));set('[data-discount-label]',view.discount?'Discount':'Discount (none)');set('[data-discount-status]',view.discount?'Applied · '+money(view.discount):'Not applied');set('[data-total]',money(view.total));set('[data-cash]',money(view.cash));set('[data-change]',money(view.change));
    $('[data-items]').innerHTML=view.items.map(i=>`<div class="payment-item"><div><p>${esc(i.name)}</p>${i.components.length?`<small class="meal-components">${i.components.map(esc).join(' + ')} · included</small>`:''}<small>${i.quantity} × ${money(i.unitPrice)}</small></div><span>${money(i.quantity*i.unitPrice)}</span></div>`).join('');
    $('[data-print]').addEventListener('click',()=>window.print());
    const from=params.get('from'),date=params.get('date'),start=params.get('start'),end=params.get('end');const rangeQuery=data.validDay(start)&&data.validDay(end)&&end>=start?'?start='+start+'&end='+end:params.get('all')==='1'?'?all=1':'';if(['reports','reports-weekly','reports-monthly','dashboard'].includes(from)){$('[data-details-back]').href=from+'.html'+(rangeQuery||(data.validDay(date)?'?date='+date:''));$('[data-details-back]').lastChild.textContent=from==='dashboard'?'Back to Dashboard':'Back to sales report';}else if(rangeQuery||data.validDay(date))$('[data-details-back]').href='transactions.html'+(rangeQuery||'?date='+date);
  }
  async function report(){
    const period=screen==='reports-weekly'?'weekly':screen==='reports-monthly'?'monthly':'daily',date=$('[data-admin-date]'),requested=new URLSearchParams(location.search).get('date');
    let anchor=data.validDay(requested)?requested:today,view=null,generation=0;
    if(period==='monthly'){date.type='month';date.value=anchor.slice(0,7);}else date.value=anchor;
    const wrapper=date.closest('.admin-date'),picker=window.BayleafDates.create(wrapper,{today,mode:period==='monthly'?'month':period==='weekly'?'week':'date',title:period==='monthly'?'Choose reporting month':period==='weekly'?'Choose reporting week':'Choose report date',help:period==='weekly'?'Choose a day in the existing Sunday–Saturday reporting week. Arrow keys move; Escape closes.':undefined,reset:period,resetLabel:period==='daily'?'Reset to today':period==='weekly'?'Reset to this week':'Reset to this month',presets:[{value:period,label:period==='daily'?'Today':period==='weekly'?'This week':'This month'}]});
    wrapper.addEventListener('datefilterchange',event=>{const selected=event.detail.kind==='preset'?today:event.detail.start;date.value=period==='monthly'?selected.slice(0,7):selected;date.dispatchEvent(new Event('change',{bubbles:true}));});
    async function refresh(){const seq=++generation;view=null;$('[data-export-csv]').disabled=true;const next=await data.report(period,anchor);if(seq!==generation)return;view=next;metrics(view);set('[data-date-label]',view.label);picker.set({kind:period==='monthly'?'month':'date',start:anchor,end:anchor});all('[data-report-period]').forEach(a=>{const p=a.dataset.reportPeriod;a.href=(p==='daily'?'reports':'reports-'+p)+'.html?date='+anchor;});
      if(period==='daily'){set('[data-report-heading]','Sales summary · '+view.label);drawTransactions(view.transactions,'reports',anchor);}else{drawBars($('[data-report-bars]'),view);set('[data-report-context]',view.count+' transactions paid in cash · '+view.label);}
      $('[data-export-csv]').disabled=false;
    }
    function fail(error){view=null;$('[data-export-csv]').disabled=true;all('[data-metric],[data-gross],[data-net],[data-discounts]').forEach(n=>n.textContent='—');all('[data-transaction-rows],[data-report-bars]').forEach(n=>n.innerHTML='');set('[data-report-context]','Report data unavailable');message(error.message,true);}
    date.addEventListener('change',()=>{let value=date.value;if(period==='monthly')value+='-01';if(!data.validDay(value)){date.value=period==='monthly'?anchor.slice(0,7):anchor;message('Choose a valid report date.',true);return;}anchor=value;refresh().catch(fail);});
    $('[data-export-csv]').addEventListener('click',()=>{if(!view)return;const text=data.csv(view),url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8;'})),link=document.createElement('a');link.href=url;link.download='bayleaf-sales-'+period+'-'+view.start+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message('CSV exported for '+view.label+'.');});
    $('[data-export-csv]').disabled=true;await refresh();
    window.addEventListener('storage',event=>{if(event.key==='bayleaf.demo.transactions.v1'||event.key===null)refresh().catch(fail);});
  }
  async function dashboard(){
    const date=$('[data-admin-date]'),period=$('[data-dashboard-period]'),wrapper=date.closest('.admin-date'),params=new URLSearchParams(location.search);
    date.value=data.validDay(params.get('date'))?params.get('date'):today;
    let custom=data.validDay(params.get('start'))&&data.validDay(params.get('end'))&&params.get('end')>=params.get('start')?{start:params.get('start'),end:params.get('end')}:null;
    const chartEmpty=$('[data-dashboard-chart]').innerHTML,recentEmpty=$('[data-dashboard-recent]').innerHTML;let generation=0;
    const picker=window.BayleafDates.create(wrapper,{today,title:'Choose dashboard dates',allowRange:true,reset:'daily',resetLabel:'Reset to today',presets:[{value:'daily',label:'Today'},{value:'weekly',label:'This week'},{value:'monthly',label:'This month'}]});
    function customOption(){if(custom){if(!period.querySelector('[value=custom]'))period.add(new Option('Custom dates','custom'));period.value='custom';date.value=custom.start;}else period.querySelector('[value=custom]')?.remove();}
    customOption();
    async function refresh(){
      if(!data.validDay(date.value)){message('Choose a valid date.',true);return;}const seq=++generation,view=await data.report(custom?'custom':period.value,date.value,custom);if(seq!==generation)return;
      $('[data-dashboard-chart]').hidden=false;$('[data-dashboard-recent]').hidden=false;metrics(view);set('[data-date-label]',view.period==='daily'?(date.value===today?'Today · ':'')+data.shortDate(date.value):view.label);
      set('[data-dashboard-period-label]',custom?'Custom dates':period.options[period.selectedIndex].textContent);picker.set(custom?{kind:'range',...custom}:{kind:'date',start:date.value,end:date.value});
      set('[data-metric-note="0"]',view.count?'Net sales after discounts':view.period==='daily'&&date.value===today?'No completed sales today':'No completed sales in this period');set('[data-metric-note="1"]',view.count?'Completed cash payments':view.period==='daily'&&date.value===today?'No completed transactions today':'No completed transactions in this period');set('[data-metric-note="2"]',view.count?'Average per transaction':'Available after your first sale');
      if(!view.count){$('[data-dashboard-chart]').className='';$('[data-dashboard-chart]').innerHTML=chartEmpty;$('[data-dashboard-recent]').innerHTML=recentEmpty;}
      else{drawBars($('[data-dashboard-chart]'),view);$('[data-dashboard-recent]').innerHTML='<section class="transactions-panel"><table class="transactions-table"><thead><tr><th>TRANSACTION NO.</th><th>DATE &amp; TIME</th><th>CASHIER</th><th>TOTAL</th><th>ACTION</th></tr></thead><tbody>'+tableRows(view.transactions.slice(0,5),'dashboard',date.value,custom?{kind:'range',...custom}:null)+'</tbody></table></section>';}
    }
    wrapper.addEventListener('datefilterchange',event=>{const next=event.detail;if(next.kind==='preset'){custom=null;period.value=next.period;date.value=today;}else if(next.kind==='range'){custom={start:next.start,end:next.end};}else{custom=null;period.value='daily';date.value=next.start;}customOption();refresh().catch(error=>message(error.message,true));});
    date.addEventListener('change',()=>{custom=null;if(period.value==='custom')period.value='daily';customOption();refresh().catch(error=>message(error.message,true));});
    period.addEventListener('change',()=>{custom=null;date.value=today;customOption();refresh().catch(error=>message(error.message,true));});
    window.addEventListener('storage',event=>{if(event.key==='bayleaf.demo.transactions.v1'||event.key===null)refresh().catch(error=>message(error.message,true));});await refresh();
  }
  (async()=>{try{if(screen==='menu')await menu();else if(screen==='transactions')await transactions();else if(screen==='transaction-details')await details();else if(screen==='dashboard')await dashboard();else await report();}catch(error){
    if(screen==='transaction-details'){$('.payment-columns').hidden=true;$('.receipt-actions').hidden=true;}
    if(screen==='dashboard'){all('[data-metric]').forEach(n=>n.textContent='—');$('[data-dashboard-chart]').hidden=true;$('[data-dashboard-recent]').hidden=true;}
    if(screen==='transactions'){$('[data-transaction-rows]').innerHTML='';set('[data-transaction-count]','Transaction data unavailable');}
    if(screen.startsWith('reports')){all('[data-metric]').forEach(n=>n.textContent='—');all('[data-transaction-rows],[data-report-bars]').forEach(n=>n.innerHTML='');all('[data-gross],[data-net],[data-discounts]').forEach(n=>n.textContent='—');}
    message(error.message,true);
  }})();
})();
