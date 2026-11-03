/* Browser-only simulation. This is not secure authentication or backend storage. */
(() => {
  'use strict';
  const source=document.querySelector('script[data-demo-app]');
  const root=new URL('../',source.src);
  if(!document.querySelector('link[rel~="icon"]')){
    const favicon=document.createElement('link');favicon.rel='icon';favicon.type='image/svg+xml';
    favicon.href=new URL('assets/icons/67ea5.svg',root).href;document.head.append(favicon);
  }
  const users={cashier:{username:'mia.santos',name:'Mia Santos'},admin:{username:'ana.reyes',name:'Ana Reyes'}};
  const keys={session:'bayleaf.demo.session.v1',order:'bayleaf.demo.order.v1'};
  const memory=new Map();
  let unavailable=false;
  function warnStorage(){
    unavailable=true;
    const show=()=>{
      if(document.querySelector('[data-storage-warning]'))return;
      const note=document.createElement('p');
      note.className='app-storage-warning';note.dataset.storageWarning='';note.setAttribute('role','status');
      note.textContent='Unable to save changes. Please try again or contact the administrator.';
      document.body.append(note);
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
  }
  function read(key){
    let raw;
    try { raw=localStorage.getItem(key); }
    catch { warnStorage();return memory.get(key)||null; }
    try { return raw?JSON.parse(raw):null; } catch { return null; }
  }
  function save(key,value){memory.set(key,value);try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{warnStorage();return false;}}
  function session(){const s=read(keys.session);return s&&users[s.role]?.username===s.username?{role:s.role,username:s.username,name:users[s.role].name}:null;}
  function go(relative,replace=false){const target=new URL(relative,root);replace?location.replace(target.href):location.assign(target.href);}
  function home(role,replace=false){go(role==='admin'?'admin/dashboard.html':'cashier/take-order.html',replace);}
  function login(role){const user=users[role];if(!user)return false;return save(keys.session,{role,username:user.username});}
  function logout(){memory.delete(keys.session);try{localStorage.removeItem(keys.session);}catch{warnStorage();}go('index.html',true);}
  window.BayleafDemo={session,login,logout,home,go,getOrder:()=>read(keys.order),saveOrder:value=>save(keys.order,value),storageAvailable:()=>!unavailable};
  const role=document.body.dataset.appRole;
  const current=session();
  if(role&&current?.role!==role){current?home(current.role,true):go('index.html',true);return;}
  if(document.body.hasAttribute('data-app-entry')&&current){home(current.role,true);return;}
  document.querySelectorAll('[data-demo-logout]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();logout();}));
  document.querySelectorAll('[data-pending]').forEach(control=>control.addEventListener('click',event=>{
    event.preventDefault();
    const message=document.querySelector('[data-pending-message]');
    if(message){message.hidden=false;message.textContent=control.dataset.pending+' is not implemented yet. No action or transaction has been performed.';message.focus({preventScroll:true});message.scrollIntoView({block:'nearest',behavior:'smooth'});}
  }));
})();
