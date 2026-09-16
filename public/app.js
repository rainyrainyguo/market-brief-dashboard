(()=>{
'use strict';
const search=document.querySelector('#search');
const filters=[...document.querySelectorAll('[data-filter]')];
const sections=[...document.querySelectorAll('.issue')];
const cards=[...document.querySelectorAll('.news-card')];
const links=[...document.querySelectorAll('[data-nav]')];
const select=document.querySelector('#date-select');
const toolbar=document.querySelector('.toolbar');
const count=document.querySelector('#result-count');
const empty=document.querySelector('#empty');
const reset=document.querySelector('#reset');
let category='all',visible=sections,active='',scheduled=false;
const normalize=s=>s.normalize('NFKC').toLocaleLowerCase().trim();
const index=new Map(cards.map(card=>[card,normalize(card.dataset.search)]));
function setActive(id){
 if(!id||active===id)return;active=id;
 links.forEach(a=>{const on=a.dataset.nav===id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 select.value=id;
}
function sync(){
 scheduled=false;if(!visible.length){active='';links.forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current')});return;}
 const line=toolbar.getBoundingClientRect().bottom+30;
 let current=visible[0];
 for(const section of visible){if(section.getBoundingClientRect().top<=line)current=section;else break;}
 if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-5)current=visible.at(-1);
 setActive(current.id);
}
function queueSync(){if(!scheduled){scheduled=true;requestAnimationFrame(sync);}}
function resize(){document.documentElement.style.setProperty('--toolbar-height',`${toolbar.offsetHeight}px`);queueSync();}
function jump(id,push=true){
 const section=visible.find(s=>s.id===id);if(!section)return;
 section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 setActive(id);if(push)history.replaceState(null,'',`${location.pathname}${location.search}#${id}`);
}
function apply(){
 const words=normalize(search.value).split(/\s+/).filter(Boolean);let matches=0;
 for(const card of cards){const show=(category==='all'||card.dataset.category===category)&&words.every(word=>/^[a-z]{1,5}$/.test(word)?new RegExp('(^|[^a-z0-9])'+word+'([^a-z0-9]|$)').test(index.get(card)):index.get(card).includes(word));card.hidden=!show;if(show)matches++;}
 visible=sections.filter(section=>{const has=[...section.querySelectorAll('.news-card')].some(c=>!c.hidden);section.hidden=!has;return has;});
 const ids=new Set(visible.map(s=>s.id));links.forEach(a=>a.hidden=!ids.has(a.dataset.nav));
 [...select.options].forEach(o=>{o.hidden=!ids.has(o.value);o.disabled=o.hidden;});
 select.disabled=!visible.length;
 empty.hidden=matches!==0;reset.hidden=category==='all'&&!words.length;
 count.textContent=`${visible.length} 期简报 · ${matches} 条记录${words.length?' · 搜索「'+search.value.trim()+'」':''}`;
 filters.forEach(b=>{const on=b.dataset.filter===category;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 sections.forEach(s=>{s.querySelector('.issue-summary').hidden=category!=='all'||words.length>0;});
 resize();sync();
}
function resetAll(){search.value='';category='all';apply();search.focus();}
search.disabled=false;filters.forEach(b=>b.disabled=false);select.disabled=false;
search.addEventListener('input',apply);
filters.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;apply();}));
reset.addEventListener('click',resetAll);document.querySelector('#empty-reset').addEventListener('click',resetAll);
links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();jump(a.dataset.nav);}));
select.addEventListener('change',()=>jump(select.value));
window.addEventListener('scroll',queueSync,{passive:true});window.addEventListener('resize',resize,{passive:true});
window.addEventListener('hashchange',()=>jump(decodeURIComponent(location.hash.slice(1)),false));
if('ResizeObserver'in window)new ResizeObserver(resize).observe(toolbar);
if('IntersectionObserver'in window){const observer=new IntersectionObserver(queueSync,{threshold:[0,.05,.25,.5,.75,1]});sections.forEach(s=>observer.observe(s));}
document.addEventListener('keydown',event=>{
 if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();search.focus();}
 if(event.key==='Escape'&&document.activeElement===search){search.value='';apply();}
});
resize();apply();if(location.hash)requestAnimationFrame(()=>jump(decodeURIComponent(location.hash.slice(1)),false));
})();
