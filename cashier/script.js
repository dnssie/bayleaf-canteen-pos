/* Interactive frontend ordering. Optional browser-local draft; no backend authentication or persistence. */
(() => {
  'use strict';
  let MENU = [
    ['adobo','Chicken Adobo','Ulam',5500,'0319a.png'],
    ['menudo','Pork Menudo','Ulam',5000,'f9381.png'],
    ['giniling','Pork Giniling','Ulam',4500,'821cd.png'],
    ['afritada','Chicken Afritada','Ulam',5500,'dda82.png'],
    ['sinigang','Pork Sinigang','Ulam',5500,'b63e3.png'],
    ['bistek','Bistek Tagalog','Ulam',6000,'95ec0.png'],
    ['chicken','Fried Chicken','Ulam',5500,'e3369.png'],
    ['bbq','Pork BBQ','Ulam',3500,'69b2f.png'],
    ['fish','Fried Fish','Ulam',4500,'2fb7c.png'],
    ['pinakbet','Pinakbet','Gulay',3500,'b848c.png'],
    ['sayote','Ginisang Sayote','Gulay',3000,'495b9.png'],
    ['monggo','Ginisang Monggo','Gulay',3000,'aafa3.png'],
    ['chopsuey','Chopsuey','Gulay',3500,'63476.png'],
    ['ampalaya','Ginisang Ampalaya','Gulay',3000,'79555.png'],
    ['laing','Laing','Gulay',3500,'ea7b2.png'],
    ['steamed','Steamed Rice','Rice',1500,'fee3e.png'],
    ['fried','Fried Rice','Rice',2000,'038fc.png'],
    ['chips','Assorted Chips','Add-ons',1000,'28115.png']
  ].map(([id,name,category,price,image]) => ({id,name,category,price,image,active:true}));
  // This inactive record is deliberately excluded from all menus and builders.
  MENU.push({id:'bicol',name:'Pork Bicol Express',category:'Ulam',price:5500,active:false});
  if(typeof window!=='undefined'&&window.BayleafCatalogData)MENU=window.BayleafCatalogData.load(MENU);
  const MEALS = {
    U1R1:{name:'1 Ulam + 1 Rice',price:7000,categories:['Ulam','Rice'],labels:['Choose 1 ulam','Choose 1 rice']},
    U2R1:{name:'2 Ulam + 1 Rice',price:11000,categories:['Ulam','Ulam','Rice'],labels:['First ulam · required','Second ulam · required','Rice · required']},
    V1R1:{name:'1 Gulay + 1 Rice',price:4500,categories:['Gulay','Rice'],labels:['Choose 1 gulay','Choose 1 rice']}
  };
  const ICONS={minus:'1ba63.svg',plus:'1420d.svg',add:'d197e.svg',x:'b8f97.svg',compactX:'153bd.svg',chevron:'aa8c0.svg',mealChevron:'9b50c.svg',check:'e6ec2.svg',basket:'50493.svg',searchEmpty:'6d701.svg',arrow:'ff26f.svg',arrowDisabled:'b21a7.svg'};
  const money = cents => '₱'+(cents/100).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const item = id => MENU.find(m=>m.id===id&&m.active);
  const icon = (name,p) => `<img src="${p}assets/icons/${ICONS[name]}" alt="">`;
  const lineKey = line => line.kind==='meal'?'meal-'+line.variant+'-'+line.components.join('-'):'item-'+line.menuId;
  function unitPrice(line) { return line.kind==='meal'?MEALS[line.variant].price:item(line.menuId).price; }
  function totals(cart,discountOn=false) {
    const subtotal=cart.reduce((sum,line)=>sum+unitPrice(line)*line.quantity,0);
    const discount=discountOn&&subtotal>0?Math.min(1000,subtotal):0;
    const count=cart.reduce((sum,line)=>sum+line.quantity*(line.kind==='meal'?line.components.length:1),0);
    return {subtotal,discount,total:subtotal-discount,count,lines:cart.length};
  }
  function stepper(line,p) {
    return `<div class="stepper${line.quantity>9?' stepper--wide':''}"><button type="button" data-cart-action="decrease" aria-label="Decrease quantity">${icon('minus',p)}</button><output aria-live="polite">${line.quantity}</output><button type="button" data-cart-action="increase" aria-label="Increase quantity">${icon('plus',p)}</button></div>`;
  }
  function lineHTML(line,compact,p) {
    const meal=line.kind==='meal';
    const name=meal?`MEAL · ${line.variant}`:item(line.menuId).name;
    const price=unitPrice(line),amount=money(price*line.quantity);
    const remove=`<button class="icon-button" type="button" data-cart-action="remove" aria-label="Remove ${esc(name)}">${icon(compact?'compactX':'x',p)}</button>`;
    const attrs=`data-line-key="${lineKey(line)}" data-kind="${line.kind}" data-menu-id="${line.menuId||''}" data-variant="${line.variant||''}" data-components="${(line.components||[]).join(',')}"`;
    if(compact) return `<article class="cart-line cart-line--compact${meal?' cart-line--meal':''}" ${attrs}><div class="cart-compact-header"><div class="cart-line-title">${meal&&typeof document!=='undefined'&&document.querySelector('.ordering-app')?.dataset.persistOrder==='true'?`<button type="button" class="bundle-label cart-meal-edit" data-edit-meal aria-label="Edit ${esc(name)}">${esc(name)}</button>`:`<p class="${meal?'bundle-label':'semibold'}">${esc(name)}</p>`}${meal?'':'<p class="small muted">SINGLE ITEM</p>'}</div><div class="cart-line-controls">${meal?`<span class="sr-only">${money(price)} each</span>`:`<span class="cart-unit-price small muted">${money(price)}</span>`}${stepper(line,p)}</div><strong class="line-subtotal">${amount}</strong>${remove}</div>${meal?`<div class="bundle-components">${line.components.map(id=>`<span>${esc(item(id).name)}</span>`).join('')}</div>`:''}</article>`;
    return `<article class="order-item cart-line" ${attrs}><div class="row-between"><p class="semibold">${esc(name)}</p>${remove}</div><div class="row-between"><div class="order-item__quantity"><span class="small muted">${money(price)}</span>${stepper(line,p)}</div><strong class="line-subtotal">${amount}</strong></div></article>`;
  }
  function emptyHTML(p) {
    return `<div class="empty-state order-empty"><span class="empty-state__icon">${icon('basket',p)}</span><h3>Start an Order</h3><p>Choose a dish from the menu to get started.</p></div>`;
  }
  function validDraft(draft) {
    if(!draft||typeof draft.variant!=='string'||!Object.hasOwn(MEALS,draft.variant)||!Array.isArray(draft.slots))return false;
    const meal=MEALS[draft.variant];
    return meal&&meal.categories.length===draft.slots.length&&draft.slots.every((id,i)=>item(id)?.category===meal.categories[i]);
  }
  function builderHTML(draft,p) {
    const meal=MEALS[draft.variant],u2=draft.variant==='U2R1';
    const count=draft.slots.filter((id,i)=>item(id)?.category===meal.categories[i]).length;
    const ready=validDraft(draft),missing=meal.categories.length-count;
    const missingLabel=missing===1?(meal.categories[draft.slots.findIndex(id=>!id)]?.toLowerCase()||'item'):'items';
    const notice=ready?(u2?`All three items are included in ${money(meal.price)}.`:`Both items are included in ${money(meal.price)}.`):`Choose ${missing} more ${missingLabel} to finish your meal.`;
    return `<section class="meal-builder${u2?' meal-builder--u2':''}" data-variant="${draft.variant}" aria-label="${draft.variant} meal builder"><header class="meal-builder-heading"><h3>${u2?'U2R1 · ₱110.00':draft.variant+' · '+meal.name}</h3>${u2?'':`<p class="small muted">${money(meal.price)} for the whole meal</p>`}</header>${meal.categories.map((category,i)=>{
      const selected=item(draft.slots[i]);
      return `<div class="field-group"><label class="field-label" for="meal-slot-${i}">${meal.labels[i]}</label><div class="field meal-choice${!selected?' meal-choice--required':''}"><img class="choice-thumbnail"${selected?.image?` src="${p}assets/images/${selected.image}"`:' hidden'} alt=""><select id="meal-slot-${i}" data-meal-slot="${i}" aria-required="true"><option value="">${u2&&i===1?'Choose another ulam':'Choose '+category.toLowerCase()}</option>${MENU.filter(m=>m.active&&m.category===category).map(m=>`<option value="${m.id}"${m.id===draft.slots[i]?' selected':''}>${esc(m.name)}</option>`).join('')}</select>${icon('chevron',p)}</div></div>`;
    }).join('')}<div class="meal-notice${ready?' meal-notice--ready':''}" role="status">${ready?icon('check',p):''}<p>${notice}</p></div><div class="row-between meal-selection-summary"><span>${count} of ${meal.categories.length} chosen</span><span class="badge${ready?'':' badge--inactive'}">${ready?'Ready':'Choose '+missing+' more'}</span></div></section>`;
  }
  if(typeof document==='undefined') {
    module.exports={MENU,MEALS,ICONS,money,esc,item,icon,lineKey,unitPrice,totals,lineHTML,emptyHTML,builderHTML,validDraft};
    return;
  }
  window.BayleafOrder={MENU,MEALS,money,esc,item,unitPrice,totals,validDraft};
  const app=document.querySelector('.ordering-app');
  if(!app)return;
  const persistent=app.dataset.persistOrder==='true';
  const demo=window.BayleafDemo;
  if(persistent&&demo?.session()?.role!=='cashier')return;
  const p=app.dataset.root;
  const cartRegion=document.querySelector('.order-items');
  const summary=document.querySelector('[data-order-count]');
  const title=document.querySelector('.catalog-heading h1');
  const variantMenu=document.querySelector('.meal-dropdown');
  const variantLabel=variantMenu.querySelector('[data-meal-label]');
  const variantIcon=variantMenu.querySelector('summary img');
  const inlineActions=document.querySelector('.meal-inline-actions');
  const addMealButton=inlineActions.querySelector('[data-add-meal]');
  const discountToggle=document.querySelector('[data-discount]');
  const sampleDiscount=document.querySelector('[data-discount-note]');
  const paymentButton=document.querySelector('[data-payment-info]');
  const status=document.querySelector('[data-order-status]');
  const menuScroll=document.querySelector('.menu-scroll');
  const search=document.querySelector('[data-menu-search]');
  let seenActiveMenuIds=new Set([...app.querySelectorAll('.menu-card')].map(card=>card.dataset.menuId));
  let pendingCatalogReveal=null;
  let category=app.dataset.initialCategory||'All';
  let cart=[...cartRegion.querySelectorAll('.cart-line')].map(n=>({kind:n.dataset.kind,menuId:n.dataset.menuId||undefined,variant:n.dataset.variant||undefined,components:n.dataset.components?n.dataset.components.split(','):undefined,quantity:Number(n.querySelector('output').value)}));
  let draft=null;
  const initialBuilder=cartRegion.querySelector('.meal-builder');
  if(initialBuilder)draft={variant:initialBuilder.dataset.variant,slots:[...initialBuilder.querySelectorAll('[data-meal-slot]')].map(s=>s.value)};
  let orderType='Dine-in';
  function validStoredLine(line) {
    if(!line||!Number.isSafeInteger(line.quantity)||line.quantity<1)return false;
    if(line.kind==='item')return !!item(line.menuId);
    return line.kind==='meal'&&Array.isArray(line.components)&&validDraft({variant:line.variant,slots:line.components});
  }
  function persist() {
    if(persistent&&demo)demo.saveOrder({version:1,cart,draft,discountOn:discountToggle.checked,category,search:search.value,orderType,activeMenuIds:[...seenActiveMenuIds]});
  }
  let restored=false;
  if(persistent&&demo){
    const saved=demo.getOrder();
    cart=[];draft=null;
    if(saved?.version===1){
      if(Array.isArray(saved.activeMenuIds)&&saved.activeMenuIds.every(id=>typeof id==='string'))seenActiveMenuIds=new Set(saved.activeMenuIds);
      cart=Array.isArray(saved.cart)?saved.cart.filter(validStoredLine).map(l=>l.kind==='item'?{kind:'item',menuId:l.menuId,quantity:l.quantity}:{kind:'meal',variant:l.variant,components:[...l.components],quantity:l.quantity}):[];
      const d=saved.draft;
      if(d&&typeof d.variant==='string'&&Object.hasOwn(MEALS,d.variant)&&Array.isArray(d.slots)&&d.slots.length===MEALS[d.variant].categories.length){
        draft={variant:d.variant,slots:d.slots.map((id,i)=>item(id)?.category===MEALS[d.variant].categories[i]?id:'')};
        if(d.editKey&&cart.some(l=>l.kind==='meal'&&lineKey(l)===d.editKey))draft.editKey=d.editKey;
      }
      category=['All','Ulam','Gulay','Rice','Add-ons'].includes(saved.category)?saved.category:'All';
      search.value=typeof saved.search==='string'?saved.search:'';
      orderType=saved.orderType==='Takeout'?'Takeout':'Dine-in';
      discountToggle.checked=!!saved.discountOn;
      restored=true;
    }
  }
  function orderTypeValue(value){orderType=value;persist();}
  const announce=text=>{status.textContent=text;};
  function renderOrder() {
    const oldScroll=cartRegion.scrollTop;
    const active=document.activeElement;
    const focusLine=active.closest?.('[data-line-key]')?.dataset.lineKey;
    const focusAction=active.dataset?.cartAction;
    const focusSlot=active.dataset?.mealSlot;
    const compact=cart.some(l=>l.kind==='meal');
    cartRegion.classList.toggle('order-items--compact',compact&&!draft);
    cartRegion.innerHTML=draft?builderHTML(draft,p):cart.length?cart.map(l=>lineHTML(l,compact,p)).join(''):emptyHTML(p);
    cartRegion.scrollTop=oldScroll;
    title.textContent=draft?'Choose Your Meal':'Take Order';
    variantLabel.textContent=draft?`${draft.variant} — ${MEALS[draft.variant].name} — ${money(MEALS[draft.variant].price)}`:'Choose a meal';
    variantIcon.src=p+'assets/icons/'+ICONS[draft?'mealChevron':'chevron'];
    inlineActions.hidden=!draft;
    addMealButton.disabled=!draft||!validDraft(draft);
    addMealButton.textContent=draft?.editKey?'Save Meal':'Add Meal';
    const t=totals(cart,discountToggle.checked);
    summary.textContent=t.count===0?'0 items':`${t.count} ${t.count===1?'item':'items'} · ${t.lines} ${t.lines===1?'line':'lines'}`;
    document.querySelector('[data-subtotal]').textContent=money(t.subtotal);
    document.querySelector('[data-discount-amount]').textContent=t.discount?'−'+money(t.discount):money(0);
    document.querySelector('[data-total]').textContent=money(t.total);
    sampleDiscount.hidden=!discountToggle.checked;
    paymentButton.disabled=!cart.length;
    paymentButton.querySelector('img').src=p+'assets/icons/'+ICONS[cart.length?'arrow':'arrowDisabled'];
    if(focusLine&&focusAction)cartRegion.querySelector(`[data-line-key="${CSS.escape(focusLine)}"] [data-cart-action="${focusAction}"]`)?.focus({preventScroll:true});
    persist();
    if(focusSlot!==undefined)cartRegion.querySelector(`[data-meal-slot="${focusSlot}"]`)?.focus({preventScroll:true});
  }
  function beginMeal(variant,editingLine=null) {
    if(typeof variant!=='string'||!Object.hasOwn(MEALS,variant))return;
    const editing=editingLine||(draft?.editKey?cart.find(l=>lineKey(l)===draft.editKey):null);
    draft={variant,slots:editing?.variant===variant?[...editing.components]:variant==='U2R1'?['adobo','','steamed']:variant==='V1R1'?['pinakbet','steamed']:['adobo','steamed']};
    draft.slots=draft.slots.map((id,i)=>item(id)?.category===MEALS[variant].categories[i]?id:'');
    if(editing)draft.editKey=lineKey(editing);
    variantMenu.open=false;
    renderOrder();
    cartRegion.scrollTop=0;
    cartRegion.querySelector('select')?.focus({preventScroll:true});
    announce(`${variant} selected. Included items are charged at one bundle price.`);
  }
  function updateScrollThumb() {
    const thumb=document.querySelector('.catalog-scroll-thumb');
    const track=document.querySelector('.catalog-scroll-track');
    const overflow=menuScroll.scrollHeight>menuScroll.clientHeight+1;
    track.hidden=!overflow;
    const travel=Math.max(0,menuScroll.clientHeight-180);
    thumb.style.transform=`translateY(${overflow?menuScroll.scrollTop/(menuScroll.scrollHeight-menuScroll.clientHeight)*travel:0}px)`;
  }
  function filterMenu(resetScroll=true) {
    const query=search.value.trim().toLowerCase();
    let visible=0;
    for(const card of document.querySelectorAll('.menu-card')) {
      const m=item(card.dataset.menuId);
      const show=!!m&&(category==='All'||category===m.category)&&m.name.toLowerCase().includes(query);
      card.hidden=!show;
      const img=card.querySelector('.menu-card__photo');
      const source=category==='Rice'&&m?.category==='Rice'&&['steamed','fried'].includes(m.id)?m.id==='steamed'?'3f85c.png':'e8cdf.png':m?.image;
      if(source&&img&&img.getAttribute('src')!==p+'assets/images/'+source)img.src=p+'assets/images/'+source;
      if(show)visible++;
    }
    document.querySelector('[data-no-results]').hidden=visible!==0;
    document.querySelector('[data-catalog-count]').textContent=category==='Rice'&&!query?visible+' rice items':category==='All'&&!query?visible+' available items':`${visible} ${visible===1?'item':'items'} shown`;
    document.querySelector('[data-catalog-hint]').textContent=category==='Rice'&&!query?'All rice items shown':visible>9?'More dishes below ↓':'All matching items shown';
    if(resetScroll)menuScroll.scrollTop=0;
    updateScrollThumb();
    persist();
  }
  app.addEventListener('click',event=>{
    const categoryLink=event.target.closest('[data-category]');
    if(categoryLink){
      event.preventDefault();category=categoryLink.dataset.category;
      app.querySelectorAll('[data-category]').forEach(a=>{const selected=a===categoryLink;a.classList.toggle('tab--selected',selected);selected?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current');});
      filterMenu();return;
    }
    const orderType=event.target.closest('[data-order-type]');
    if(orderType){
      app.querySelectorAll('[data-order-type]').forEach(b=>{const selected=b===orderType;b.classList.toggle('tab--selected',selected);b.setAttribute('aria-pressed',String(selected));});
      orderTypeValue(orderType.dataset.orderType);
      announce(orderType.dataset.orderType+' selected.');return;
    }
    const mealOption=event.target.closest('[data-meal-variant]');
    if(mealOption){event.preventDefault();beginMeal(mealOption.dataset.mealVariant);return;}
    const edit=event.target.closest('[data-edit-meal]');
    if(edit){const line=cart.find(l=>lineKey(l)===edit.closest('[data-line-key]').dataset.lineKey);if(line?.kind==='meal')beginMeal(line.variant,line);return;}
    const add=event.target.closest('[data-add-item]');
    if(add){
      const m=item(add.dataset.addItem);if(!m)return;
      let line=cart.find(l=>l.kind==='item'&&l.menuId===m.id);
      if(line)line.quantity++;else cart.push({kind:'item',menuId:m.id,quantity:1});
      renderOrder();announce(m.name+' added. Total '+money(totals(cart,discountToggle.checked).total)+'.');return;
    }
    const action=event.target.closest('[data-cart-action]');
    if(action){
      const key=action.closest('[data-line-key]')?.dataset.lineKey;
      const line=cart.find(l=>lineKey(l)===key);if(!line)return;
      if(action.dataset.cartAction==='remove')cart=cart.filter(l=>l!==line);
      else line.quantity=Math.max(1,line.quantity+(action.dataset.cartAction==='increase'?1:-1));
      renderOrder();
      if(action.dataset.cartAction==='remove') (cartRegion.querySelector('[data-cart-action]')||variantMenu.querySelector('summary')).focus({preventScroll:true});
      announce('Order updated. Total '+money(totals(cart,discountToggle.checked).total)+'.');return;
    }
    if(event.target.closest('[data-cancel-meal]')){draft=null;renderOrder();variantMenu.querySelector('summary').focus();announce('Meal selection cancelled. Your cart is unchanged.');return;}
    if(event.target.closest('[data-add-meal]')){
      if(!draft||!validDraft(draft))return;
      const original=draft.editKey?cart.find(l=>lineKey(l)===draft.editKey):null;
      const line={kind:'meal',variant:draft.variant,components:[...draft.slots],quantity:original?.quantity||1};
      if(original)cart=cart.filter(l=>l!==original);
      const existing=cart.find(l=>lineKey(l)===lineKey(line));
      if(existing)existing.quantity+=line.quantity;else cart.push(line);
      draft=null;renderOrder();variantMenu.querySelector('summary').focus();announce('Meal added at its bundle price. Included components were not charged separately.');return;
    }
    if(event.target.closest('[data-payment-info]')){
      if(!persistent){announce('This is a development preview. Use the live Cashier interface to pay.');return;}
      if(draft){announce('Finish or cancel the meal selection before payment.');const message=document.querySelector('[data-phase-message]');message.hidden=false;message.textContent='Finish or cancel the meal selection before payment.';return;}
      persist();
      if(window.BayleafDemo.storageAvailable())window.BayleafDemo.go('cashier/payment.html');
    }
  });
  app.addEventListener('change',event=>{
    if(event.target.matches('[data-meal-slot]')&&draft){
      const index=Number(event.target.dataset.mealSlot),m=item(event.target.value);
      draft.slots[index]=m&&m.category===MEALS[draft.variant].categories[index]?m.id:'';
      renderOrder();
    }
    if(event.target===discountToggle){renderOrder();announce(discountToggle.checked?'Employee discount applied: ₱10.00.':'Employee discount removed.');}
  });
  search.addEventListener('input',()=>filterMenu());
  menuScroll.addEventListener('scroll',updateScrollThumb,{passive:true});
  window.addEventListener('resize',updateScrollThumb);
  document.querySelector('[data-clear-cart]')?.addEventListener('click',()=>{
    cart=[];draft=null;discountToggle.checked=false;variantMenu.open=false;renderOrder();announce('Order cleared.');
  });
  document.addEventListener('click',event=>{if(!variantMenu.contains(event.target))variantMenu.open=false;});
  variantMenu.addEventListener('keydown',event=>{if(event.key==='Escape'){variantMenu.open=false;variantMenu.querySelector('summary').focus();}});
  function renderCatalog(){
    document.querySelector('.menu-grid').innerHTML=MENU.filter(m=>m.active).map(m=>`<article class="menu-card" data-menu-id="${esc(m.id)}">${m.image?`<img class="menu-card__photo" src="${p}assets/images/${m.image}" alt="${esc(m.name)}">`:'<div class="menu-card__photo-placeholder" role="img" aria-label="No item image">No image</div>'}<div class="menu-card__info"><h3 class="menu-card__name">${esc(m.name)}</h3><div class="row-between"><span class="menu-card__price">${money(m.price)}</span><button type="button" class="icon-button menu-card__add" data-add-item="${esc(m.id)}" aria-label="Add ${esc(m.name)}">${icon('add',p)}</button></div></div></article>`).join('');
  }
  function reconcileCatalogFilters(){
    const active=MENU.filter(m=>m.active),query=search.value.trim().toLowerCase();
    const hiddenAdditions=active.filter(m=>!seenActiveMenuIds.has(m.id)&&((category!=='All'&&m.category!==category)||(query&&!m.name.toLowerCase().includes(query))));
    if(hiddenAdditions.length){
      category='All';search.value='';
      app.querySelectorAll('[data-category]').forEach(a=>{const selected=a.dataset.category==='All';a.classList.toggle('tab--selected',selected);selected?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current');});
    }
    seenActiveMenuIds=new Set(active.map(m=>m.id));
    return hiddenAdditions.at(-1)?.id||null;
  }
  function revealCatalogItem(id){
    if(!id)return;const card=app.querySelector('[data-menu-id="'+CSS.escape(id)+'"]');
    if(card&&!card.hidden)menuScroll.scrollTop+=card.getBoundingClientRect().top-menuScroll.getBoundingClientRect().top;
    updateScrollThumb();
  }
  function refreshCatalog(){
    try{
      window.BayleafCatalogData.refresh();
      cart=cart.filter(validStoredLine);
      if(draft)draft.slots=draft.slots.map((id,i)=>item(id)?.category===MEALS[draft.variant].categories[i]?id:'');
      const reveal=reconcileCatalogFilters();
      renderCatalog();renderOrder();filterMenu(false);revealCatalogItem(reveal);
      const error=app.querySelector('[data-menu-storage-error]');if(error)error.remove();
      announce(reveal?'Menu updated. Filters cleared to show newly active items. Your remaining order is preserved.':'Menu updated. Unavailable selections were removed from this unpaid order. Review quantities and totals before payment.');
    }catch(error){
      let note=app.querySelector('[data-menu-storage-error]');if(!note){note=document.createElement('p');note.dataset.menuStorageError='';note.className='app-pending';note.setAttribute('role','status');app.querySelector('.catalog').prepend(note);}note.textContent=error.message;
      paymentButton.disabled=true;app.querySelectorAll('[data-add-item],[data-add-meal]').forEach(b=>b.disabled=true);
    }
  }
  if(persistent&&window.BayleafCatalogData){
    pendingCatalogReveal=reconcileCatalogFilters();
    renderCatalog();
    window.addEventListener('storage',event=>{if(event.key===window.BayleafCatalogData.key||event.key===null)refreshCatalog();});
    window.addEventListener('focus',refreshCatalog);
    window.addEventListener('bayleaf:catalog-changed',refreshCatalog);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshCatalog();});
    if(window.BayleafCatalogData.getError())queueMicrotask(refreshCatalog);
  }
  if(persistent){
    app.querySelectorAll('[data-order-type]').forEach(b=>{const selected=b.dataset.orderType===orderType;b.classList.toggle('tab--selected',selected);b.setAttribute('aria-pressed',String(selected));});
    app.querySelectorAll('[data-category]').forEach(a=>{const selected=a.dataset.category===category;a.classList.toggle('tab--selected',selected);selected?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current');});
    renderOrder();filterMenu();revealCatalogItem(pendingCatalogReveal);
    if(restored)announce(pendingCatalogReveal?'Menu updated. Newly active items are shown and your saved order was restored.':'Saved local order restored.');
  }
  if(persistent){
    const headerDate=app.querySelector('[data-header-date]'),headerTime=app.querySelector('[data-header-time]');
    function updateHeaderClock(){
      const now=new Date(),zone={timeZone:'Asia/Manila'};
      if(headerDate){headerDate.textContent=new Intl.DateTimeFormat('en-US',{...zone,month:'long',day:'numeric',year:'numeric'}).format(now);headerDate.dateTime=new Intl.DateTimeFormat('en-CA',{...zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
      if(headerTime){headerTime.textContent=new Intl.DateTimeFormat('en-US',{...zone,hour:'numeric',minute:'2-digit'}).format(now);headerTime.dateTime=new Intl.DateTimeFormat('en-GB',{...zone,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);}
    }
    updateHeaderClock();setInterval(updateHeaderClock,60000);window.addEventListener('focus',updateHeaderClock);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateHeaderClock();});
  }
  updateScrollThumb();
})();
