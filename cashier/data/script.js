/* Replaceable browser-only data adapter. No HTTP contract or secure authentication is defined here. */
(() => {
  'use strict';
  const demo=window.BayleafDemo,model=window.BayleafOrder;
  const ledgerKey='bayleaf.demo.transactions.v1';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const cents=n=>Number.isSafeInteger(n)&&n>=0;
  function assertCashier(){if(demo.session()?.role!=='cashier')throw new Error('Sign in as Cashier to continue.');}
  function snapshot(order){
    window.BayleafCatalogData?.refresh();
    if(!order||!Array.isArray(order.cart)||!order.cart.length)throw new Error('Your order is empty. Return to Take Order to add items.');
    if(order.draft)throw new Error('Finish or cancel the meal selection before payment.');
    const cart=order.cart;
    for(const line of cart){
      if(!Number.isSafeInteger(line.quantity)||line.quantity<1)throw new Error('An order quantity is invalid. Review your order.');
      if(line.kind==='item'&&!model.item(line.menuId))throw new Error('An item is unavailable. Review your order.');
      if(line.kind==='meal'&&!model.validDraft({variant:line.variant,slots:line.components}))throw new Error('A meal selection is invalid. Review your order.');
      if(!['item','meal'].includes(line.kind))throw new Error('An order item is invalid. Review your order.');
    }
    const totals=model.totals(cart,order.discountOn===true);
    if(![totals.subtotal,totals.discount,totals.total,totals.count].every(cents))throw new Error('The order exceeds the supported amount. Review quantities.');
    return {...totals,orderType:order.orderType==='Takeout'?'Takeout':'Dine-in',cashier:demo.session().name,
      items:cart.map(line=>({name:line.kind==='meal'?line.variant+' — '+model.MEALS[line.variant].name:model.item(line.menuId).name,
        quantity:line.quantity,unitPrice:model.unitPrice(line),components:line.kind==='meal'?line.components.map(id=>model.item(id).name):[]}))};
  }
  function isReceipt(t){return t&&typeof t.id==='string'&&typeof t.checkoutId==='string'&&typeof t.cashier==='string'&&['Dine-in','Takeout'].includes(t.orderType)&&!isNaN(Date.parse(t.createdAt))&&[t.subtotal,t.discount,t.total,t.cash,t.change,t.count].every(cents)&&t.subtotal-t.discount===t.total&&t.cash-t.total===t.change&&Array.isArray(t.items)&&t.items.length>0&&t.items.every(i=>typeof i.name==='string'&&Number.isSafeInteger(i.quantity)&&i.quantity>0&&cents(i.unitPrice)&&Array.isArray(i.components)&&i.components.every(c=>typeof c==='string'))&&t.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0)===t.subtotal;}
  function readLedger(){
    let text;try{text=localStorage.getItem(ledgerKey);}catch{throw new Error('Transaction history is unavailable. No payment has been recorded.');}
    if(!text)return [];
    try{const data=JSON.parse(text);if(data.version===1&&Array.isArray(data.transactions)&&data.transactions.every(isReceipt))return data.transactions;}catch{}
    throw new Error('Transaction history could not be loaded. No payment has been recorded. Please contact the administrator.');
  }
  const dayKey=date=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date));
  async function getCheckout(){
    assertCashier();const order=demo.getOrder(),view=snapshot(order);
    if(!order.checkoutId){order.checkoutId=crypto.randomUUID();if(!demo.saveOrder(order))throw new Error('The order could not be saved. Please try again before taking payment.');}
    return {...copy(view),checkoutId:order.checkoutId};
  }
  async function completeCash(checkoutId,cash){
    assertCashier();
    const commit=()=>{
      const transactions=readLedger();
      const previous=transactions.find(t=>t.checkoutId===checkoutId);if(previous)return copy(previous);
      const order=demo.getOrder();if(!order||order.checkoutId!==checkoutId)throw new Error('This order changed in another page. Return to Take Order and review it.');
      const view=snapshot(order);
      if(!cents(cash)||cash<view.total)throw new Error('Collect the full amount before confirming payment.');
      const createdAt=new Date().toISOString(),date=dayKey(createdAt).replaceAll('-','');
      const sequence=Math.max(0,...transactions.filter(t=>t.id.startsWith('BL-'+date+'-')).map(t=>Number(t.id.split('-').at(-1))||0))+1;
      const transaction={...view,checkoutId,id:'BL-'+date+'-'+String(sequence).padStart(3,'0'),createdAt,cash,change:cash-view.total};
      try{localStorage.setItem(ledgerKey,JSON.stringify({version:1,transactions:[...transactions,transaction]}));}catch{throw new Error('The receipt could not be saved. No payment has been recorded; your order is unchanged.');}
      // The durable receipt is committed first. If clearing fails, its checkout ID still prevents duplicates.
      demo.saveOrder(null);
      return copy(transaction);
    };
    // Serializes checkout in cooperating tabs of this origin; this is not a backend transaction guarantee.
    return navigator.locks?navigator.locks.request('bayleaf-demo-cash-payment',commit):commit();
  }
  function assertReader(){if(!["cashier","admin"].includes(demo.session()?.role))throw new Error("Sign in to view transactions.");}
  async function listTransactions(){assertReader();return copy(readLedger()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));}
  async function getTransaction(id){assertReader();return copy(readLedger().find(t=>t.id===id)||null);}
  window.BayleafCashierData={getCheckout,completeCash,listTransactions,getTransaction,dayKey};
})();
