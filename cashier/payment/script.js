/* Phase 4 presentation/controller. All persistence is delegated to BayleafCashierData. */
(() => {
  'use strict';
  const screen=document.body.dataset.cashierScreen;
  if(!screen||window.BayleafDemo.session()?.role!=='cashier')return;
  const data=window.BayleafCashierData,{money,esc}=window.BayleafOrder;
  const $=s=>document.querySelector(s);
  const set=(selector,value)=>document.querySelectorAll(selector).forEach(n=>n.textContent=value);
  const dateTime=value=>{
    const date=new Date(value),opts={timeZone:'Asia/Manila'};
    return new Intl.DateTimeFormat('en-GB',{...opts,day:'2-digit',month:'short',year:'numeric'}).format(date)+' · '+new Intl.DateTimeFormat('en-US',{...opts,hour:'numeric',minute:'2-digit',hour12:true}).format(date);
  };
  function clock(){set('[data-header-date]',new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'}).format(new Date()));set('[data-header-time]',new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'}).format(new Date()));}
  clock();setInterval(clock,60000);
  function message(text){const note=$('[data-payment-message]');note.hidden=false;note.textContent=text;}
  function unavailable(text){$('[data-screen-content]').hidden=true;document.querySelectorAll('.receipt-actions').forEach(n=>n.hidden=true);message(text);}
  function render(view){
    set('[data-total]',money(view.total));set('[data-subtotal]',money(view.subtotal));set('[data-discount-value]',money(view.discount));
    set('[data-order-type]',view.orderType);set('[data-item-count]',String(view.count));set('[data-cashier]',view.cashier);
    set('[data-discount-label]',screen==='payment'?(view.discount?'Employee discount · On':'Employee discount · Off'):(view.discount?'Discount':'Discount (none)'));
    set('[data-discount-status]',view.discount?'Applied · '+money(view.discount):'Not applied');
    $('[data-items]').innerHTML=view.items.map(i=>`<div class="payment-item"><div><p>${esc(i.name)}</p>${i.components.length?`<small class="meal-components">${i.components.map(esc).join(' + ')} · included</small>`:''}<small>${i.quantity} × ${money(i.unitPrice)}</small></div><span>${money(i.quantity*i.unitPrice)}</span></div>`).join('');
    if(view.id){
      set('[data-receipt-id]',view.id);set('[data-receipt-date]',dateTime(view.createdAt));set('[data-cash]',money(view.cash));set('[data-change]',money(view.change));
      set('[data-paid-description]',money(view.cash)+' received in cash for this '+money(view.total)+' order.');
      if(screen==='order-details')set('[data-page-subtitle]',view.id);
    }else set('[data-summary-meta]',dateTime(new Date())+' · '+view.cashier);
  }
  function parseCash(value){
    // Exact decimal-to-cent parsing. Reject signs, exponents, grouping and more than two decimal places.
    const text=value.trim();if(!/^\d+(?:\.\d{1,2})?$/.test(text))return null;
    const [whole,decimal='']=text.split('.');const result=Number(whole)*100+Number(decimal.padEnd(2,'0'));
    return Number.isSafeInteger(result)?result:null;
  }
  async function payment(){
    const view=await data.getCheckout();render(view);
    const input=$('#cash-received'),form=$('[data-cash-form]'),button=$('[data-confirm-payment]');
    let paying=false;input.value='';
    function validate(){
      const cash=parseCash(input.value),hasValue=input.value.trim()!=='',short=cash!==null&&cash<view.total;
      const invalid=hasValue&&(cash===null||short),error=$('#cash-error');
      input.setAttribute('aria-invalid',String(invalid));input.closest('.field').classList.toggle('field--error',invalid);
      error.hidden=!invalid;$('[data-still-needed]').hidden=!short;
      set('[data-change]',money(cash!==null?Math.max(0,cash-view.total):0));
      if(short){set('[data-shortage-title]','Not enough cash · '+money(view.total-cash)+' short');set('[data-shortage-help]','Collect '+money(view.total)+' before confirming payment.');set('[data-shortage]',money(view.total-cash));}
      else if(invalid){set('[data-shortage-title]','Enter a valid cash amount');set('[data-shortage-help]','Use a positive amount with up to two decimal places.');}
      button.disabled=paying||cash===null||short;
      button.querySelector('img').src='../assets/icons/'+(button.disabled?'7eb9d':'a840d')+'.svg';
      return cash;
    }
    input.addEventListener('input',validate);validate();input.focus({preventScroll:true});
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(paying)return;
      const cash=validate();if(cash===null||cash<view.total){input.focus();return;}
      paying=true;validate();
      try{
        // Guard against another tab changing quantities/type/discount while this screen was open.
        const latest=await data.getCheckout();
        if(JSON.stringify(latest)!==JSON.stringify(view))throw new Error('This order changed in another page. Return to Take Order and review it.');
        const receipt=await data.completeCash(view.checkoutId,cash);
        window.BayleafDemo.go('cashier/payment-complete.html?id='+encodeURIComponent(receipt.id));
      }catch(error){message(error.message);paying=false;validate();}
    });
  }
  async function receipt(){
    const id=new URLSearchParams(location.search).get('id'),view=id?await data.getTransaction(id):null;
    if(!view){unavailable('Receipt not found. Open Recent Transactions to choose a completed order.');return;}
    render(view);
    $('[data-print]').addEventListener('click',()=>window.print());
  }
  async function history(){
    const records=await data.listTransactions(),search=$('[data-history-search]'),date=$('[data-history-date]');
    // Empty date means all dates, so a newly completed payment remains discoverable on later days.
    date.value='';
    function filter(){
      const query=search.value.trim().toLowerCase(),day=date.value;
      const visible=records.filter(t=>(!query||t.id.toLowerCase().includes(query))&&(!day||data.dayKey(t.createdAt)===day));
      $('[data-history-rows]').innerHTML=visible.map(t=>`<tr><td>${esc(t.id)}</td><td>${esc(dateTime(t.createdAt))}</td><td>Cash</td><td>${money(t.total)}</td><td><a href="order-details.html?id=${encodeURIComponent(t.id)}">View receipt</a></td></tr>`).join('');
      const empty=$('[data-history-empty]');empty.hidden=visible.length>0;
      empty.querySelector('h2').textContent=records.length?'No matching transactions':'No transactions yet';
      empty.querySelector('p').textContent=records.length?'Try another order number or date.':'Completed cash payments will appear here.';
      set('[data-history-count]',query||day?'Showing '+visible.length+' of '+records.length+' orders':'Showing all '+records.length+' orders');
      set('.date-label',day?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Manila'}).format(new Date(day+'T00:00:00+08:00')):'All dates');
      $('[data-clear-filters]').hidden=!query&&!day;
    }
    search.addEventListener('input',filter);date.addEventListener('change',filter);
    date.parentElement.addEventListener('click',event=>{if(event.target===date)return;try{date.showPicker();}catch{date.focus();}});
    $('[data-clear-filters]').addEventListener('click',()=>{search.value='';date.value='';filter();});filter();
  }
  (async()=>{try{if(screen==='payment')await payment();else if(screen==='transactions')await history();else await receipt();}catch(error){unavailable(error.message);}})();
})();
