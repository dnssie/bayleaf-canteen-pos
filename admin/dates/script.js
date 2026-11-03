/* Shared Admin calendar UI. Date selections are frontend filters, not business policy or an API contract. */
(() => {
  'use strict';
  const {validDay:adapterValidDay,shortDate,range}=window.BayleafAdminData;
  const validDay=key=>adapterValidDay(key)&&Number(key.slice(0,4))>=1;
  const dayDate=key=>new Date(key+'T00:00:00Z');
  const keyOf=date=>date.toISOString().slice(0,10);
  const monthName=date=>new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',month:'long',year:'numeric'}).format(date);
  const fullDate=key=>new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(dayDate(key));
  const shiftDay=(key,amount)=>{const d=dayDate(key);d.setUTCDate(d.getUTCDate()+amount);const result=keyOf(d);return validDay(result)?result:key;};
  let sequence=0,active=null;
  function create(wrapper,options){
    const input=wrapper.querySelector('[data-admin-date]'),trigger=wrapper.querySelector('[data-date-trigger]');
    const today=options.today,id='admin-calendar-'+(++sequence);
    const popup=document.createElement('section');popup.className='admin-date-popover';popup.id=id;popup.hidden=true;
    popup.setAttribute('role','dialog');popup.setAttribute('aria-label',options.title||'Choose dates');
    popup.innerHTML=`<header class="date-popover-heading"><h2>${options.title||'Choose dates'}</h2><button type="button" class="icon-button" data-date-close aria-label="Close calendar"><img src="../assets/icons/b154b.svg" alt=""></button></header><div class="date-presets" aria-label="Date presets"></div><div class="date-modes" aria-label="Selection type" ${options.allowRange?'':'hidden'}><button type="button" data-date-mode="date">Single date</button><button type="button" data-date-mode="range">Date range</button></div><div class="date-entry"><label><span data-start-label>Date (YYYY-MM-DD)</span><input type="text" inputmode="numeric" data-date-start autocomplete="off" aria-describedby="${id}-error" spellcheck="false"></label><label data-end-field hidden><span>End date (YYYY-MM-DD)</span><input type="text" inputmode="numeric" data-date-end autocomplete="off" aria-describedby="${id}-error" spellcheck="false"></label></div><div class="calendar-heading"><button type="button" data-calendar-prev aria-label="Previous month">‹</button><span data-calendar-month aria-live="polite"></span><button type="button" data-calendar-next aria-label="Next month">›</button></div><div data-calendar></div><p class="date-picker-help">${options.help||(options.mode==='month'?'Arrow keys move between months. Enter selects. Escape closes.':'Arrow keys move between days. Enter selects. Escape closes.')}</p><p class="field-error" id="${id}-error" data-date-error role="status" hidden></p><footer class="date-popover-actions"><button type="button" class="date-reset" data-date-reset>${options.resetLabel||'Reset to today'}</button><button type="button" class="btn btn--secondary" data-date-close>Cancel</button><button type="button" class="btn" data-date-apply>Apply</button></footer>`;
    document.body.append(popup);trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
    const $=selector=>popup.querySelector(selector);
    let committed={kind:'date',start:today,end:today},mode=options.mode||'date',start=today,end=today,view=dayDate(today),focusDay=today,activeField='start';
    const presets=options.presets||[];
    $('.date-presets').hidden=!presets.length;
    for(const preset of presets){const button=document.createElement('button');button.type='button';button.dataset.datePreset=preset.value;button.textContent=preset.label;$('.date-presets').append(button);}
    function error(text=''){const note=$('[data-date-error]');note.textContent=text;note.hidden=!text;$('[data-date-start]').setAttribute('aria-invalid',String(!!text));if(mode==='range')$('[data-date-end]').setAttribute('aria-invalid',String(!!text));}
    function position(){
      if(popup.hidden)return;const r=trigger.getBoundingClientRect(),gap=8,p=popup.getBoundingClientRect();
      const left=Math.max(gap,Math.min(r.right-p.width,innerWidth-p.width-gap));
      let top=r.bottom+gap;if(top+p.height>innerHeight-gap)top=r.top-p.height-gap;
      top=Math.max(gap,Math.min(top,innerHeight-p.height-gap));popup.style.left=left+'px';popup.style.top=top+'px';
    }
    function close(restore=true){if(popup.hidden)return;popup.hidden=true;trigger.setAttribute('aria-expanded','false');if(active===api)active=null;if(restore)trigger.focus({preventScroll:true});}
    function emit(selection){committed={...selection};close();wrapper.dispatchEvent(new CustomEvent('datefilterchange',{detail:{...selection},bubbles:true}));}
    function fields(){
      $('[data-end-field]').hidden=mode!=='range';$('.date-entry').classList.toggle('date-entry--range',mode==='range');
      $('[data-start-label]').textContent=mode==='range'?'Start date (YYYY-MM-DD)':mode==='month'?'Month (YYYY-MM)':options.mode==='week'?'Week containing (YYYY-MM-DD)':'Date (YYYY-MM-DD)';
      $('[data-date-start]').value=mode==='month'?start.slice(0,7):start;$('[data-date-end]').value=end;
      popup.querySelectorAll('[data-date-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dateMode===mode)));
    }
    function highlighted(key){
      if(mode==='week'&&validDay(start)){const span=range('weekly',start);return key>=span.start&&key<=span.end;}
      return validDay(start)&&validDay(end)&&key>=start&&key<=end;
    }
    function calendar(moveFocus=false){
      $('[data-calendar-month]').textContent=mode==='month'?String(view.getUTCFullYear()):monthName(view);
      $('[data-calendar-prev]').setAttribute('aria-label',mode==='month'?'Previous year':'Previous month');
      $('[data-calendar-next]').setAttribute('aria-label',mode==='month'?'Next year':'Next month');
      const host=$('[data-calendar]');host.replaceChildren();
      if(mode==='month'){
        const grid=document.createElement('div');grid.className='calendar-months';grid.setAttribute('role','group');grid.setAttribute('aria-label','Choose month');
        for(let month=0;month<12;month++){
          const key=String(view.getUTCFullYear()).padStart(4,'0')+'-'+String(month+1).padStart(2,'0')+'-01',button=document.createElement('button');button.type='button';button.dataset.calendarMonth=key;button.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',month:'short'}).format(dayDate(key));button.setAttribute('aria-label',monthName(dayDate(key)));button.setAttribute('aria-pressed',String(start.slice(0,7)===key.slice(0,7)));grid.append(button);
        }host.append(grid);
      }else{
        const table=document.createElement('table');table.className='calendar-grid';table.setAttribute('role','grid');table.setAttribute('aria-label',monthName(view));
        table.innerHTML='<thead><tr>'+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day=>'<th scope="col"><abbr title="'+day+'">'+day.slice(0,2)+'</abbr></th>').join('')+'</tr></thead><tbody></tbody>';
        const first=keyOf(new Date(view));let day=shiftDay(first,-view.getUTCDay());
        for(let row=0;row<6;row++){
          const tr=document.createElement('tr');
          for(let col=0;col<7;col++){
            const key=day,d=dayDate(key),td=document.createElement('td'),button=document.createElement('button');td.setAttribute('role','gridcell');td.setAttribute('aria-selected',String(highlighted(key)));
            button.type='button';button.dataset.calendarDay=key;button.textContent=String(d.getUTCDate());button.setAttribute('aria-label',fullDate(key));button.tabIndex=key===focusDay?0:-1;
            button.classList.toggle('calendar-outside',d.getUTCMonth()!==view.getUTCMonth());button.classList.toggle('calendar-selected',key===start||key===end);button.classList.toggle('calendar-in-range',highlighted(key));if(key===today)button.setAttribute('aria-current','date');td.append(button);tr.append(td);day=shiftDay(day,1);
          }table.tBodies[0].append(tr);
        }host.append(table);
      }
      position();if(moveFocus)$('[data-calendar-day="'+focusDay+'"]')?.focus({preventScroll:true});
    }
    function open(){
      if(active&&active!==api)active.close(false);active=api;mode=options.mode||((committed.kind==='range')?'range':'date');
      start=committed.start||today;end=committed.end||start;focusDay=start;view=dayDate(start.slice(0,7)+'-01');activeField='start';error();fields();popup.hidden=false;trigger.setAttribute('aria-expanded','true');calendar();
      if(mode==='month')popup.querySelector('[data-calendar-month][aria-pressed="true"]')?.focus({preventScroll:true});else $('[data-calendar-day="'+focusDay+'"]')?.focus({preventScroll:true});
    }
    trigger.addEventListener('click',()=>popup.hidden?open():close());
    trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();open();}});
    popup.addEventListener('click',event=>{
      const target=event.target.closest('button');if(!target)return;
      if(target.hasAttribute('data-date-close')){close();return;}
      if(target.hasAttribute('data-date-reset')){emit({kind:'preset',period:options.reset||'daily',anchor:today});return;}
      if(target.dataset.datePreset){emit({kind:'preset',period:target.dataset.datePreset,anchor:today});return;}
      if(target.dataset.dateMode){mode=target.dataset.dateMode;end=mode==='date'?start:'';activeField='start';error();fields();calendar();return;}
      if(target.hasAttribute('data-calendar-prev')||target.hasAttribute('data-calendar-next')){
        const direction=target.hasAttribute('data-calendar-next')?1:-1,d=new Date(view);
        if(mode==='month')d.setUTCFullYear(d.getUTCFullYear()+direction);else d.setUTCMonth(d.getUTCMonth()+direction);
        if(d.getUTCFullYear()<1||d.getUTCFullYear()>9999)return;view=d;calendar();return;
      }
      if(target.dataset.calendarMonth){start=target.dataset.calendarMonth;end=start;fields();calendar();popup.querySelector('button[data-calendar-month="'+start+'"]')?.focus({preventScroll:true});return;}
      if(target.dataset.calendarDay){
        const day=target.dataset.calendarDay;focusDay=day;
        if(mode==='range'){
          if(activeField==='start'){start=day;end='';activeField='end';}
          else{end=day;if(start&&end<start)[start,end]=[end,start];activeField='start';}
        }else start=end=day;
        if(day.slice(0,7)!==keyOf(view).slice(0,7))view=dayDate(day.slice(0,7)+'-01');error();fields();calendar(true);return;
      }
      if(target.hasAttribute('data-date-apply')){
        const raw=$('[data-date-start]').value.trim();start=mode==='month'?raw+'-01':raw;end=mode==='range'?$('[data-date-end]').value.trim():start;
        if(!validDay(start)||!validDay(end)){error(mode==='month'?'Enter a valid month as YYYY-MM.':'Enter valid dates as YYYY-MM-DD.');position();return;}
        if(end<start){error('End date must be on or after start date.');position();return;}
        emit({kind:mode==='range'?'range':mode==='month'?'month':'date',start,end});
      }
    });
    $('[data-date-start]').addEventListener('focus',()=>activeField='start');$('[data-date-end]').addEventListener('focus',()=>activeField='end');
    for(const selector of ['[data-date-start]','[data-date-end]'])$(selector).addEventListener('input',()=>{
      const raw=$('[data-date-start]').value.trim(),first=mode==='month'?raw+'-01':raw,last=mode==='range'?$('[data-date-end]').value.trim():first;
      if(validDay(first)){start=first;focusDay=first;view=dayDate(first.slice(0,7)+'-01');end=last;calendar();}error();
    });
    popup.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();return;}
      const monthButton=event.target.closest('button[data-calendar-month]');
      if(monthButton){
        let amount=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:event.key==='ArrowUp'?-3:event.key==='ArrowDown'?3:event.key==='PageUp'?-12:event.key==='PageDown'?12:0;
        const d=dayDate(monthButton.dataset.calendarMonth);
        if(event.key==='Home')amount=-d.getUTCMonth();else if(event.key==='End')amount=11-d.getUTCMonth();
        if(!amount)return;event.preventDefault();d.setUTCMonth(d.getUTCMonth()+amount);if(d.getUTCFullYear()<1||d.getUTCFullYear()>9999)return;view=dayDate(keyOf(d).slice(0,7)+'-01');calendar();popup.querySelector('button[data-calendar-month="'+keyOf(d)+'"]')?.focus({preventScroll:true});return;
      }
      const current=event.target.closest('[data-calendar-day]');if(!current)return;
      let next=current.dataset.calendarDay,d=dayDate(next);
      if(event.key==='ArrowLeft')next=shiftDay(next,-1);else if(event.key==='ArrowRight')next=shiftDay(next,1);else if(event.key==='ArrowUp')next=shiftDay(next,-7);else if(event.key==='ArrowDown')next=shiftDay(next,7);
      else if(event.key==='Home')next=shiftDay(next,-d.getUTCDay());else if(event.key==='End')next=shiftDay(next,6-d.getUTCDay());
      else if(event.key==='PageUp'||event.key==='PageDown'){const step=event.key==='PageDown'?1:-1;const original=d.getUTCDate();d.setUTCDate(1);if(event.shiftKey)d.setUTCFullYear(d.getUTCFullYear()+step);else d.setUTCMonth(d.getUTCMonth()+step);const last=new Date(d);last.setUTCMonth(last.getUTCMonth()+1,0);d.setUTCDate(Math.min(original,last.getUTCDate()));next=keyOf(d);}else return;
      if(!validDay(next))return;event.preventDefault();focusDay=next;view=dayDate(next.slice(0,7)+'-01');calendar(true);
    });
    document.addEventListener('pointerdown',event=>{if(!popup.hidden&&!popup.contains(event.target)&&!wrapper.contains(event.target))close(false);});
    document.addEventListener('focusin',event=>{if(!popup.hidden&&!popup.contains(event.target)&&!wrapper.contains(event.target))close(false);});
    window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
    const api={open,close,set(selection){committed={...selection};trigger.title=trigger.textContent.trim();trigger.setAttribute('aria-label',(options.title||'Choose dates')+'. Selected: '+trigger.title);},get:()=>({...committed})};return api;
  }
  window.BayleafDates={create};
})();

