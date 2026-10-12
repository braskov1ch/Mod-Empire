/* ===== MOD EMPIRE v3.5 — форум и запросы игроков ===== */
function allReports(){const a=[];for(const m of live())for(const r of m.reports)a.push({m,r});return a.sort((x,y)=>y.r.votes-x.r.votes)}
function renderForum(){const all=allReports(),fm=$('fmod').value,fk=$('fkind').value;
const om=$('fmod').value;$('fmod').innerHTML='<option value="">Все моды</option>'+live().map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');if([...$('fmod').options].some(o=>o.value===om))$('fmod').value=om;
const a=all.filter(x=>(!fm||String(x.m.id)===fm)&&(!fk||x.r.kind===fk));
$('fstats').innerHTML=stat('Открытых тем',all.length,'У опубликованных модов')+stat('Голосов',all.reduce((s,x)=>s+x.r.votes,0),'Давят на спрос, пока не решены')+stat('Решено',S.stats.reportsDone,'За всю карьеру')+stat('Идей',all.filter(x=>x.r.kind==='feature').length,'Можно реализовать');
$('flist').innerHTML=a.length?a.map(({m,r})=>`<div class="panel" style="margin-bottom:8px"><div class="row"><div><span class="badge ${r.kind==='feature'?'green':r.kind==='bug'?'red':'yellow'}">${KIND_NAME[r.kind]}</span> <b>${esc(m.name)}</b> <span class="small muted">день ${r.day}</span></div><span class="tag">▲ ${r.votes}</span></div><p>${esc(r.text)}</p><div class="actions">${r.kind==='feature'?`<button class="primary mini" onclick="implementReport(${m.id},${r.id})">Реализовать · $30 · 1 день</button>`:`<button class="primary mini" onclick="fixReport(${m.id},${r.id})">Исправить · $10 · 1 день</button>`}<button class="mini" onclick="dismissReport(${m.id},${r.id})">Отклонить</button></div></div>`).join(''):'<div class="empty"><b>На форуме тихо</b>Игроки оставляют баг-репорты и идеи, когда у тебя есть опубликованные моды.</div>'}
function findReport(mid,rid){const m=S.mods.find(x=>x.id===mid);return[m,m&&m.reports.find(r=>r.id===rid)]}
function bumpVersion(m,minor){let[a,b,c]=m.version.split('.').map(Number);m.version=minor?`${a}.${b+1}.0`:`${a}.${b}.${(c||0)+1}`}
function fixReport(mid,rid){const[m,r]=findReport(mid,rid);if(!r)return;if(S.cash<10){toast('Нужно $10 на проверку.');return}if(S.life.energy<10){toast('Слишком устал.');return}
spend('dev',10);if(r.kind==='compat')m.broken=false;
m.bugs=clamp(m.bugs-(r.kind==='bug'?6:3)-S.skills.testing*.3,0,100);if(r.kind==='perf')m.quality=clamp(m.quality+1,0,100);
m.reports=m.reports.filter(x=>x!==r);S.stats.reportsDone++;gainRep(.2+r.votes*.04);S.followers+=Math.floor(r.votes/3);addXp('testing',.3);bumpVersion(m,false);
S.life.streak++;const res=advanceDay({energy:-4,stress:1});log('info','Исправлено по запросу игроков: «'+r.text+'» ('+m.name+').');checkAchievements();commit(dayToast(res,'Запрос решён, версия '+m.version))}
function implementReport(mid,rid){const[m,r]=findReport(mid,rid);if(!r)return;if(S.cash<30){toast('Нужно $30.');return}if(S.life.energy<10){toast('Слишком устал.');return}
const f=features.find(x=>x[0]===r.fid);spend('dev',30);if(f&&!m.features.includes(f[0]))m.features.push(f[0]);
m.quality=clamp(m.quality+2+S.skills.coding*.3,0,100);m.bugs=clamp(m.bugs+2,0,100);m.fresh=Math.min(1,m.fresh+.15);m.updatesCount++;m.lastUpdate=S.day;bumpVersion(m,true);
m.reports=m.reports.filter(x=>x!==r);S.stats.reportsDone++;gainRep(.5+r.votes*.06);S.followers+=r.votes;addXp('coding',.5);
S.life.streak++;const res=advanceDay({energy:-5,stress:2});log('info','В «'+m.name+'» добавлена функция «'+(f?f[1]:'по запросу игроков')+'». Версия '+m.version+'.');checkAchievements();commit(dayToast(res,'Функция добавлена, версия '+m.version))}
function dismissReport(mid,rid){const[m,r]=findReport(mid,rid);if(!r)return;m.reports=m.reports.filter(x=>x!==r);if(r.votes>=8){gainRep(-1);log('info','Ты отклонил популярную тему на форуме. Часть игроков недовольна.')}commit('Тема закрыта.')}
