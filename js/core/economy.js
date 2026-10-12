/* ===== Экономика / репутация / навыки ===== */
const isSandbox=()=>S.mode==='sandbox';
const cashStr=()=>isSandbox()?'∞':money(S.cash);
function earn(cat,x){if(!(x>0))return;if(!isSandbox())S.cash+=x;S.totalEarned+=x;S.inc[cat]=(S.inc[cat]||0)+x;S.tax.inc+=x}
function spend(cat,x){if(!(x>0))return;if(!isSandbox())S.cash-=x;S.totalSpent+=x;S.exp[cat]=(S.exp[cat]||0)+x;if(cat!=='living'&&cat!=='tax')S.tax.exp+=x}
function gainRep(x){S.repAcc+=x;const w=S.repAcc>=0?Math.floor(S.repAcc):Math.ceil(S.repAcc);S.repAcc-=w;S.rep=Math.max(0,S.rep+w);if(S.rep===0&&S.repAcc<0)S.repAcc=0}
const rankName=()=>S.rep<30?'Новичок':S.rep<100?'Начинающий моддер':S.rep<250?'Опытный автор':S.rep<500?'Известный создатель':S.rep<1000?'Звёздный моддер':S.rep<2000?'Легенда сообщества':'Икона моддинга';
const level=()=>1+Math.floor(S.rep/100);
const weekdayName=()=>['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'][(S.day-1)%7];
function addXp(k,x){if(S.skills[k]>=10)return;S.xp[k]=(S.xp[k]||0)+x;let need=2+S.skills[k];while(S.xp[k]>=need&&S.skills[k]<10){S.xp[k]-=need;S.skills[k]++;toast('Навык «'+SKILLS[k]+'» вырос до '+S.skills[k]+'/10!');log('info','Навык «'+SKILLS[k]+'» вырос до '+S.skills[k]+'.');need=2+S.skills[k]}}

/* ===== Жизнь ===== */
function lifeDelta(d){const L=S.life;for(const k in d)L[k]=clamp(L[k]+d[k],0,100)}
function workEff(){const L=S.life;return clamp((.55+.45*L.energy/100)*(.85+.15*L.mood/100)*(L.stress>70?.85:1),.3,1)}
function lifeAfterDay(){const L=S.life;
if(isSandbox()){L.energy=100;L.mood=100;L.stress=0;L.health=100;L.streak=0;return}
if(L.energy<20){L.health=clamp(L.health-2,0,100);L.stress=clamp(L.stress+3,0,100);L.mood=clamp(L.mood-2,0,100)}
if(L.stress>80)L.health=clamp(L.health-2,0,100);
if(L.streak>=6)L.health=clamp(L.health-3,0,100);
if(L.stress>70)L.mood=clamp(L.mood-2,0,100);
if(L.energy>55&&L.stress<55)L.health=clamp(L.health+1,0,100)}

/* ===== Качество / стоимость ===== */
function featFit(g,fs){const text=(g.genre+' '+g.desc).toLowerCase();let sc=0,good=0;const bad=[];
for(const id of fs){if(ALWAYS.has(id)){sc+=.8;good++;continue}if(featRel[id]&&featRel[id].test(text)){sc+=1.5;good++}else{sc-=1.2;bad.push(id)}}
return{score:clamp(sc,-10,14),good,bad,n:fs.length}}
function styleBonus(t){const s=S.profile.style;return s==='Универсал'?1:(s==='Визуальный мастер'&&t==='visual')||(s==='Геймплейный инженер'&&t==='gameplay')||(s==='Лор и квесты'&&t==='content')||(s==='Утилиты и интерфейс'&&(t==='utility'||t==='library'))||(s==='Звуковой дизайнер'&&t==='audio')||(s==='Лор и квесты'&&t==='story')?4:0}
function calcMod(p){const dm=(diffScore(p.g.dif)+2)/3,tl=TOOLS[p.tool||'basic']||TOOLS.basic;
const days=Math.max(3,Math.ceil((2+p.s*2+p.fs.length*.6+p.d*.5+p.u*.5+p.c*.5+p.te*.6)*p.t[2]*dm*tl.days));
const cost=Math.round((45+p.s*65+p.fs.length*15+p.d*20+p.u*25+p.c*20+p.te*25)*p.t[2]*dm*tl.cost);
const fit=featFit(p.g,p.fs);
let q=30+S.skills.coding*4+S.skills.design*2.5+S.skills.testing*2.5+p.d*3+p.te*4+p.c*2+fit.score+styleBonus(p.t[0])+S.skills[TYPE_SKILL[p.t[0]]||'coding']*1.2+tl.q;
const bugs=clamp(25+p.s*8+(p.t[0]==='total'?10:0)-p.te*7-p.c*3-S.skills.testing*3-(S.profile.style==='Мастер оптимизации'?5:0)+tl.bugs,3,85);
return{days,cost,quality:clamp(Math.round(q),10,95),bugs,fit}}

/* ===== Рынок ===== */
const heatOf=g=>{const gh=S.market.gameHeat[g.name];return(S.market.heat[g.g0]||1)*(gh&&gh.until>=S.day?gh.m:1)};
function genHeat(){const cnt={};games.forEach(g=>cnt[g.g0]=(cnt[g.g0]||0)+1);const gs=Object.keys(cnt).filter(k=>cnt[k]>=5).sort(()=>rand()-.5);const heat={};gs.slice(0,3).forEach(x=>heat[x]=+(1.3+rand()*.35).toFixed(2));gs.slice(3,5).forEach(x=>heat[x]=+(.72+rand()*.1).toFixed(2));return heat}
function refreshMarket(){const M=S.market;M.heat=(M.next&&Object.keys(M.next).length)?M.next:genHeat();M.next=genHeat();M.analysed=false;M.week=(M.week||0)+1;
const gh={};games.slice().sort(()=>rand()-.5).slice(0,6).forEach(g=>gh[g.name]={m:+(1.2+rand()*.3).toFixed(2),until:S.day+7});
for(const k in M.gameHeat){const v=M.gameHeat[k];if(v.until>=S.day&&!gh[k])gh[k]=v}
M.gameHeat=gh;
const hot=Object.keys(M.heat).filter(k=>M.heat[k]>1);if(S.mods.some(m=>m.published&&hot.includes(gameOf(m).g0)))log('event','Тренд недели: растёт интерес к жанрам '+hot.join(', ')+'. Твои моды получают больше просмотров.')}
const rivalCount=name=>S.rivalMods.filter(x=>x.game===name&&x.until>=S.day).length;

/* ===== Моды: состояние ===== */
const live=()=>S.mods.filter(m=>m.published);
const isBroken=m=>m.broken||(m.dependencies||[]).some(id=>{const d=S.mods.find(x=>x.id===id);return d&&d.published&&d.broken});
const avgRating=m=>m.rcount?m.rsum/m.rcount:0;
const stars=r=>r?'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r)):'—';
const modStatusLabel=m=>m.status==='development'?'В разработке':m.status==='ready'?'Готов к релизу':m.status==='early'?'Early Access':'Опубликован';
const unreadCount=()=>S.comments.filter(c=>!c.reply&&c.rating<=3).length;

