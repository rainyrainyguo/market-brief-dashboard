import {readFile,mkdir,writeFile,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const assetVersion = async path => createHash('sha256').update(await readFile(path)).digest('hex').slice(0,12);
const cssVersion = await assetVersion('public/styles.css');
const jsVersion = await assetVersion('public/app.js');
const db=JSON.parse(await readFile('data/issues.json','utf8'));
const cats={all:'全部',macro:'宏观 / 市场环境',ai:'AI / 科技',semi:'半导体',robot:'Physical AI / 机器人'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const issues=[...db.issues].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
const ids=new Set();let total=0;
for(const i of issues){
 if(ids.has(i.id))throw Error('Duplicate issue '+i.id);ids.add(i.id);
 if(!i.date||!i.updatedAt||!['am','pm'].includes(i.period))throw Error('Invalid issue');
 for(const c of i.cards){
 for(const key of ['id','title','status','whyImportant','investmentImpact'])if(!c[key])throw Error('Missing '+key);
 if(!cats[c.category]||!c.body?.length)throw Error('Invalid card');
 for(const s of c.sources)if(!/^https:\/\//.test(s.url))throw Error('Invalid source');
 total++;
 }
}
const counts=Object.fromEntries(Object.keys(cats).map(cat=>[cat,cat==='all'?total:issues.flatMap(i=>i.cards).filter(c=>c.category===cat).length]));
const label=i=>i.period==='pm'?'晚':'早';
const nav=issues.map((i,n)=>`<a class="date-link${n===0?' active':''}" href="#${esc(i.id)}" data-nav="${esc(i.id)}" ${n===0?'aria-current="location"':''}><span>${esc(i.date.slice(5).replace('-',' / '))}<small>${label(i)}报</small></span><span class="nav-count">${i.cards.length}</span></a>`).join('');
const option=issues.map(i=>`<option value="${esc(i.id)}">${esc(i.date)} · ${label(i)}报</option>`).join('');
function card(c,i,n){
 const sources=c.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title.replace('Reuters｜','Reuters · '))}<span aria-hidden="true"> ↗</span></a>`).join('');
 const text=[cats[c.category],c.title,c.status,...c.body,c.whyImportant,c.investmentImpact,...c.tags,c.updateNote||'',c.verificationNote||'',...c.sources.map(s=>s.title)].join(' ');
 return `<article class="news-card ${esc(c.category)}" data-category="${esc(c.category)}" data-search="${esc(text.toLowerCase())}" id="${esc(c.id)}">
 <div class="card-meta"><span class="category">${esc(cats[c.category])}</span><span class="importance">${esc(c.importance)}影响</span><span class="card-number">${String(n+1).padStart(2,'0')}</span></div>
 <h3>${esc(c.title)}</h3><div class="status${c.status.includes('预期')||c.status.includes('确认')||c.status.includes('核实')?' pending':''}">${esc(c.status)}</div>
 ${c.updateNote?`<p class="update-note"><strong>本期新增</strong> ${esc(c.updateNote)}</p>`:''}
 <div class="story"><h4>发生了什么</h4>${c.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>
 <div class="story"><h4>为什么重要</h4><p>${esc(c.whyImportant)}</p></div>
 <div class="impact"><h4>传导链 / 投资影响 <span>分析</span></h4><p>${esc(c.investmentImpact)}</p></div>
 ${c.tags.length?`<div class="tags">${c.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}
 ${c.verificationNote?`<p class="verification-note">${esc(c.verificationNote)}</p>`:''}
 <div class="sources"><span class="sources-label">${c.status==='无实质更新'?'跟踪来源':'来源'}</span>${sources||'<p>原简报未列新增外部来源。</p>'}</div>
 </article>`;
}
const sections=issues.map((i,n)=>`<section class="issue" id="${esc(i.id)}" data-issue="${esc(i.id)}" aria-labelledby="heading-${esc(i.id)}"><header class="issue-header"><div><div class="eyebrow">${n===0?'最新一期':'历史简报'} <span>· ${i.cards.length} 条</span></div><h2 id="heading-${esc(i.id)}" tabindex="-1">${esc(i.date)} <span>· ${label(i)}报</span></h2></div><time datetime="${esc(i.updatedAt)}">约 ${esc(i.time)} PT</time></header><p class="issue-summary">${esc(i.summary)}</p>${i.cards.map((c,k)=>card(c,i,k)).join('')}</section>`).join('');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f6f8fa"><meta name="description" content="AI、半导体、宏观与机器人市场简报。按日期浏览早晚更新，搜索新闻、阅读投资影响与原始来源。"><title>Market Brief · 市场简报</title><link rel="icon" type="image/svg+xml" href="./favicon.svg"><link rel="stylesheet" href="./styles.css?v=${cssVersion}"><script src="./app.js?v=${jsVersion}" defer></script></head><body><a class="skip-link" href="#content">跳转到简报正文</a><div class="app-shell"><aside class="sidebar"><a href="./" class="brand"><img src="./favicon.svg" width="34" height="34" alt=""><span>Market Brief<small>市场简报</small></span></a><div class="archive-label">简报归档 <span>${issues.length} 期</span></div><div class="month-label">${esc(issues[0].date.slice(0,4))} 年 · ${Number(issues[0].date.slice(5,7))} 月</div><nav aria-label="历史日期">${nav}</nav><div class="sidebar-bottom"><span class="edition-label">早报 & 晚报</span><p>AI · 半导体 · 宏观 · 机器人</p><p>时间均为美国太平洋时间</p></div></aside><main><header class="page-header"><div><p class="eyebrow">THE MARKET, IN CONTEXT</p><h1>市场简报</h1></div><div class="archive-stats"><strong>${issues.length}<span>期简报</span></strong><strong>${total}<span>条记录</span></strong></div></header><div class="toolbar"><div class="search-row"><label class="searchbox"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="search" type="search" aria-label="搜索全部简报" placeholder="搜索公司、关键词或事件…" autocomplete="off" disabled><kbd aria-hidden="true">/</kbd></label><button id="reset" type="button" hidden>清除筛选</button></div><div class="filters" role="group" aria-label="新闻分类">${Object.entries(cats).map(([id,name])=>`<button class="filter ${id==='all'?'selected':''}" type="button" data-filter="${id}" aria-pressed="${id==='all'}" disabled>${name}<span>${counts[id]}</span></button>`).join('')}</div><div class="mobile-navigation"><label for="date-select">跳转日期</label><select id="date-select" disabled>${option}</select></div></div><div class="result-row"><p id="result-count" role="status" aria-live="polite">${issues.length} 期简报 · ${total} 条记录</p><span>最新在前</span></div><noscript><p class="noscript-notice">正文与来源可直接阅读。搜索与分类需要启用 JavaScript。<br>${issues.map(i=>`<a href="#${esc(i.id)}">${esc(i.date.slice(5))} ${label(i)}</a>`).join(' · ')}</p></noscript><div id="empty" class="empty" hidden><h2>没有找到相关简报</h2><p>试试其他关键词，或清除当前筛选。</p><button id="empty-reset" type="button">显示全部简报</button></div><div id="content">${sections}</div><footer><span class="footer-brand">Market Brief</span><p>历史正文迁移自原 Dashboard；日期与约定时间沿用原记录。来源事后补录处另有标注。投资影响为分析，不等同于已发生事实。</p><a href="#content">回到最新一期 ↑</a></footer></main></div></body></html>`;
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});await writeFile('dist/index.html',html);await writeFile('dist/issues.json',JSON.stringify(db));
console.log(`Built ${issues.length} issues, ${total} full cards, ${html.length} characters of static HTML.`);
