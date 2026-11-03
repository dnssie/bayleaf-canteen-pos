/* Browser-only catalog adapter. These operations are frontend seams, not an HTTP or database contract. */
(() => {
  'use strict';
  const key='bayleaf.demo.menu.v1',categories=['Ulam','Gulay','Rice','Add-ons'];
  const copy=value=>JSON.parse(JSON.stringify(value));
  const catalog=[];let seed=[],error=null;
  const valid=m=>m&&typeof m.id==='string'&&typeof m.name==='string'&&m.name.trim()&&categories.includes(m.category)&&Number.isSafeInteger(m.price)&&m.price>=0&&typeof m.active==='boolean'&&(!m.image||/^[a-f0-9]+\.png$/.test(m.image));
  function read(){
    const raw=localStorage.getItem(key);if(!raw)return copy(seed);
    const record=JSON.parse(raw);
    if(record.version!==1||!Array.isArray(record.items)||!record.items.every(valid)||new Set(record.items.map(m=>m.id)).size!==record.items.length)throw new Error('The menu could not be loaded. Please contact the administrator.');
    return record.items;
  }
  function refresh(){
    try{const next=read();catalog.splice(0,catalog.length,...next);error=null;return catalog;}
    catch{error=new Error('The menu is unavailable. Please try again or contact the administrator.');throw error;}
  }
  function load(initial){
    seed=copy(initial);const i=seed.findIndex(m=>m.id==='bicol');if(i>=0)seed.splice(7,0,...seed.splice(i,1));
    try{refresh();}catch{catalog.splice(0,catalog.length,...copy(seed));}return catalog;
  }
  function assertAdmin(){if(window.BayleafDemo.session()?.role!=='admin')throw new Error('Sign in as Admin to manage the menu.');}
  const signature=m=>JSON.stringify(m);
  async function mutate(operation){
    assertAdmin();const commit=()=>{
      refresh();const next=copy(catalog),result=operation(next);
      try{localStorage.setItem(key,JSON.stringify({version:1,items:next}));}catch{throw new Error('The menu could not be saved. Your changes have not been applied.');}
      catalog.splice(0,catalog.length,...next);window.dispatchEvent(new CustomEvent('bayleaf:catalog-changed'));return copy(result);
    };
    return navigator.locks?navigator.locks.request('bayleaf-demo-menu',commit):commit();
  }
  async function listMenu(){refresh();return copy(catalog);}
  async function saveItem(id,values,expected){
    return mutate(next=>{
      const existing=id?next.find(m=>m.id===id):null;
      if(id&&!existing)throw new Error('This menu item no longer exists. Refresh the list.');
      if(existing&&expected&&signature(existing)!==expected)throw new Error('This item changed in another page. Close and reopen the form to review it.');
      const item={...(existing||{id:'menu-'+crypto.randomUUID(),active:true}),name:String(values.name||'').trim(),category:values.category,price:values.price};
      if(!valid(item))throw new Error('Enter an item name, a listed category, and a valid non-negative price.');
      if(existing)next[next.indexOf(existing)]=item;else next.push(item);return item;
    });
  }
  async function setAvailability(id,active,expected){
    return mutate(next=>{
      const item=next.find(m=>m.id===id);if(!item)throw new Error('This menu item no longer exists.');
      if(expected&&signature(item)!==expected)throw new Error('This item changed in another page. Close and reopen the confirmation.');
      item.active=!!active;return item;
    });
  }
  window.BayleafCatalogData={load,refresh,listMenu,saveItem,setAvailability,signature,categories,getError:()=>error,key};
})();
