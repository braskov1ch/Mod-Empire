/* ===== Симуляция дня ===== */
function priceConv(m){const ref=4+m.quality/12;return 1/(1+Math.pow(m.price/ref,1.5))}
function genComments(m,d){const p=Math.min(.55,.08+d/70);if(rand()>p)return;const broken=isBroken(m);
let rating=clamp(Math.round(2.6+m.quality/35-m.bugs/60-(broken?1.2:0)+(rand()-.5)*1.6),1,5);
const pos=POS,mid=MID,neg=broken?NEG_BROKEN:NEG_BUG;
S.comments.push({id:S.nextCid++,modId:m.id,author:pick(AUTHORS),rating,text:rating>=4?pick(pos):rating===3?pick(mid):pick(neg),reply:'',day:S.day});
m.rsum+=rating;m.rcount++;
if(rating<=2)m.bugs=clamp(m.bugs+1,0,100);else if(rating>=4){gainRep(.15);S.followers++}
if(S.comments.length>80)S.comments.splice(0,S.comments.length-80)}

function simulateDay(){const res={views:0,downloads:0,income:0};
const wk=((S.day-1)%7)>=5?1.15:1,fest=S.effects.festivalUntil>=S.day?1.25:1;
if(S.day%7===1||!S.market.heat||!Object.keys(S.market.heat).length)refreshMarket();
// расходы на жизнь
spend('living',6);expirePending();teamDaily();
// долги и сайт
if(S.cash<0)S.debtDays++;else S.debtDays=0;
let visits=0;
if(S.site.created){const up=S.site.monthly/30;spend('site',up);
const wasF=S.site.frozen;S.site.frozen=S.debtDays>=3;
if(S.site.frozen&&!wasF)log('event','Сайт временно недоступен: не оплачен хостинг. Выйди в плюс, чтобы вернуть трафик.');
if(!S.site.frozen)visits=Math.round((S.followers*.06+S.rep*.2+2)*(.6+rand()*.7)*(S.site.customDomain?1.15:1));
S.site.visits+=visits}
const onSite=live().filter(m=>m.platforms.includes('personal'));
// моды
for(const m of live()){const g=gameOf(m);
m.fresh=Math.max(.05,(m.fresh??1)*(1-1/(55+m.updates*22)));
if(m.type==='library'){const n=S.mods.filter(x=>x.published&&x.dependencies.includes(m.id)).length;m.fresh=Math.min(1,m.fresh+n*.004)}
{const ts=teamSkill('tester');if(ts>0)m.bugs=clamp(m.bugs-.03*ts*teamMult(),0,100)}
const freshM=.4+.6*m.fresh,r=avgRating(m),ratingM=r?clamp(1+(r-3.5)*.1,.8,1.15):1,brokenM=isBroken(m)?.55:1;
const b=S.effects.boosts[m.id],boost=b&&b.until>=S.day?b.m:1;
const langM=1+.05*Math.min(4,m.languages.length-1);
const ratM=m.rating==='mature'?.92:1,licM=m.license==='open'?1.2:1,hypeM=1+(m.hype/100)*Math.max(0,1-(S.day-m.pubDay)/14),repM=1-Math.min(.2,reportVotes(m)/300),sponsM=m.sponsorUntil>=S.day?.92:1;
const depM=1+.06*m.dependencies.filter(id=>{const d=S.mods.find(x=>x.id===id);return d&&d.published}).length;
const audM=m.audience==='niche'?.72:m.audience==='hardcore'?.78:m.audience==='casual'?.92:1;
const hype=(m.quality/65)*Math.max(.15,(100-m.bugs)/100)*(m.release==='early'?.8:1);
const common=(g.aud*.45+g.pop*.25)*hype*audM*(1+S.skills.marketing*.07)*(1+S.rep/500)*heatOf(g)*(1.25-g.comp/100*.6)/(1+.05*rivalCount(g.name))*freshM*ratingM*brokenM*boost*langM*depM*wk*fest*ratM*licM*hypeM*repM*sponsM;
let mv=0,md=0;
for(const pid of m.platforms){const p=platById(pid);if(!p)continue;let v;
if(pid==='personal'){v=rnd(visits*.7/Math.max(1,onSite.length)*(m.quality/65)*Math.max(.3,(100-m.bugs)/100)*freshM*brokenM*boost)}
else v=rnd(common*p.reach*(.5+rand()*1.3)/Math.sqrt(p.comp));
let d=rnd(v*clamp((.08+m.quality/1000)*(1-m.bugs/140),.015,.25)*(m.release==='early'?.7:1));
let inc=0,sales=0;
if(m.price>0&&p.paid&&m.release!=='free'&&m.license==='commercial'){let price=m.price,conv=clamp(.012+m.quality/3000+S.rep/10000,.005,.08)*priceConv(m)*(m.release==='early'?1.15:1);
if(pid==='personal'){if(S.site.priceMode==='free')conv=0;else if(S.site.priceMode==='paid')conv*=1.1;else if(S.site.priceMode==='early'&&m.release==='early')conv*=1.2;
if(S.promo&&S.promo.until>=S.day){price*=1-S.promo.discount/100;conv*=1+S.promo.discount/40}}
sales=rnd(v*conv);inc=sales*price*(1-p.fee)*(S.effects.royaltyUntil>=S.day?.8:1);if(sales>d)d=sales}
const likes=rnd(d*clamp(m.quality/100*(.95-m.bugs/160),.05,.95));
m.views+=v;m.downloads+=d;m.likes+=likes;m.sales+=sales;m.earnings+=inc;
if(inc>0){earn('sales',inc);res.income+=inc;if(pid==='personal'){S.site.sales+=sales;S.site.revenue+=inc}}
if(m.license==='donate'&&d>0&&S.day-m.pubDay<=90){const dn=d*.03;earn('tips',dn);res.income+=dn}
if(m.license==='open'&&d>0)gainRep(d*.003);
const ps=S.pstats[pid]||(S.pstats[pid]={views:0,downloads:0,income:0});ps.views+=v;ps.downloads+=d;ps.income+=inc;
mv+=v;md+=d;gainRep(likes*.012+d*.004);S.followers+=rnd(likes*.025+d*.008)}
S.views+=mv;S.downloads+=md;res.views+=mv;res.downloads+=md;
genComments(m,md);genReports(m,md);
// античит
if(g.risk&&rand()<.006*(1-m.compat*.25)){gainRep(-3);lifeDelta({stress:6,mood:-4});log('event','Предупреждение от модераторов: «'+m.name+'» нарушает правила онлайн-игры '+g.name+'. Репутация упала.')}
// ранний доступ не должен длиться вечно
if(m.release==='early'&&S.day-m.pubDay>60&&!m.warned){m.warned=true;gainRep(-1);log('event','Игроки жалуются, что «'+m.name+'» слишком долго в Early Access. Выпусти релиз 1.0.')}}
// сайт: подписчики, реклама, наборы
if(S.site.created&&visits>0){const sub=rnd(visits*.015*(S.site.ads?.8:1)*(S.site.priceMode==='free'?1.25:1));S.site.subs+=sub;
if(S.site.ads){const a=visits*.012;earn('ads',a);res.income+=a}
const sup=S.site.subs*.012*(.6+rand()*.8);if(sup>0){earn('supporters',sup);res.income+=sup}
for(const bd of S.bundles){const ms=bd.mods.map(id=>S.mods.find(x=>x.id===id));if(ms.some(m=>!m||!m.published||!m.platforms.includes('personal')||!(m.price>0))||S.site.priceMode==='free')continue;
const sum=ms.reduce((a,m)=>a+m.price,0)*(1-bd.discount/100),s=rnd(visits*.01*Math.min(...ms.map(m=>priceConv(m))));
if(s>0){const inc=s*sum*.96;earn('bundles',inc);bd.sales=(bd.sales||0)+s;bd.revenue=(bd.revenue||0)+inc;S.site.sales+=s;S.site.revenue+=inc;res.income+=inc}}}
// конкуренты
for(const r of S.rivals){r.rep+=.12+rand()*.3;r.followers+=rnd(r.rep*.05+rand()*3);
if(S.day>=r.next){const g=pick(games.filter(x=>x.pop>=75));S.rivalMods.push({game:g.name,author:r.name,until:S.day+45});r.mods++;r.rep+=1+rand()*2;r.next=S.day+14+rnd(rand()*14);
if(S.mods.some(m=>m.published&&m.gameName===g.name))log('event',r.name+' выпустил мод для '+g.name+': конкуренция растёт.')}}
S.rivalMods=S.rivalMods.filter(x=>x.until>=S.day);
// спор об авторстве
if(S.dispute&&S.day>S.dispute.deadline){const m=S.mods.find(x=>x.id===S.dispute.modId);gainRep(-3);S.scandals++;log('event','Спор об авторстве «'+(m?m.name:'мода')+'» остался без ответа. Часть игроков потеряла доверие.');S.dispute=null}
// случайные события
if(!S.sandbox.noEvents){if(rand()<.2){const ok=EVENTS.filter(e=>e.ok());let tot=ok.reduce((a,e)=>a+e.w,0),x=rand()*tot;for(const e of ok){x-=e.w;if(x<=0){e.run();break}}}scheduleStory()}
taxDaily();
S.history.push({day:S.day,cash:Math.round(S.cash),downloads:S.downloads,views:S.views});if(S.history.length>90)S.history.shift();
return res}

const EVENTS=[
{w:3,ok:()=>live().length>0,run(){const m=pick(live());S.effects.boosts[m.id]={m:2.2,until:S.day+5};S.followers+=8;gainRep(1);log('event','Стример показал «'+m.name+'»: просмотры выросли на несколько дней.')}},
{w:2,ok:()=>true,run(){S.effects.festivalUntil=S.day+7;log('event','Начался фестиваль моддинга: неделя повышенного интереса (×1.25 к просмотрам).')}},
{w:3,ok:()=>live().length>0,run(){const g=gameOf(pick(live()));const hit=live().filter(m=>m.gameName===g.name&&rand()<clamp(.75-m.compat*.2,.2,.8));
for(const m of hit)m.broken=true;
if(hit.length)log('event','Патч игры '+g.name+' сломал совместимость: '+hit.map(m=>'«'+m.name+'»').join(', ')+'. Выпусти исправление во вкладке «Рынок и патчи».');else log('event','Вышел патч '+g.name+', но твои моды его пережили.')}},
{w:2,ok:()=>true,run(){const g=pick(games);S.market.gameHeat[g.name]={m:1.35,until:S.day+10};log('event','Скидки и новое дополнение: интерес к '+g.name+' вырос на 10 дней.')}},
{w:2,ok:()=>S.followers>=10,run(){const n=Math.max(5,rnd(10+S.followers*.15*rand()));earn('tips',n);log('event','Подписчик поддержал твою работу: '+money(n)+'.')}},
{w:2,ok:()=>live().length>0,run(){S.followers+=rnd(6+rand()*10);gainRep(1.5);log('event','Твою работу заметили на форуме. Пришли новые подписчики.')}},
{w:1,ok:()=>live().length>0&&!S.dispute,run(){const m=pick(live());S.dispute={modId:m.id,deadline:S.day+7,since:S.day};log('event','Игрок утверждает, что идея «'+m.name+'» заимствована. Ответь на обвинение во вкладке «Сообщество» (срок — 7 дней).')}},
{w:2,ok:()=>true,run(){const k=pick(Object.keys(SKILLS));addXp(k,1.5);lifeDelta({mood:6});log('event','Вдохновение: ты нашёл свежую идею и подтянул навык «'+SKILLS[k]+'».')}}];

function checkAchievements(){for(const a of ach)if(!S.achievements.includes(a[0])&&a[3]()){S.achievements.push(a[0]);earn('other',100);gainRep(5);log('info','Достижение «'+a[1]+'»! Награда: $100 и 5 репутации.');toast('🏆 '+a[1])}}
const ach=[['first','Первый шаг','Создай свой первый мод.',()=>S.mods.length>=1],['release','Первый релиз','Опубликуй мод.',()=>live().length>=1],['downloads100','Первые поклонники','Набери 100 загрузок.',()=>S.downloads>=100],['downloads1k','Тысяча загрузок','Набери 1 000 загрузок.',()=>S.downloads>=1000],['downloads10k','Десять тысяч','Набери 10 000 загрузок.',()=>S.downloads>=10000],['rep100','Узнаваемое имя','Набери 100 репутации.',()=>S.rep>=100],['website','Свой уголок интернета','Создай личный сайт.',()=>S.site.created],['paid','Первая продажа','Заработай на продаже мода.',()=>S.inc.sales>0||S.mods.some(m=>m.earnings>0)],['five','Коллекция работ','Создай пять модов.',()=>S.mods.length>=5],['quality','Перфекционист','Выпусти мод с качеством 90+.',()=>live().some(m=>m.quality>=90)],['followers','Маленькое сообщество','Набери 100 подписчиков.',()=>S.followers>=100],['updates','Живой проект','Выпусти 5 обновлений.',()=>S.mods.reduce((a,m)=>a+(m.updatesCount||0),0)>=5],['legend','Легенда моддинга','Набери 1 000 репутации.',()=>S.rep>=1000],['multi','Кроссплатформенный автор','Опубликуй мод на двух площадках.',()=>S.mods.some(m=>m.platforms.length>=2)],['year','Год в моддинге','Проживи 365 дней.',()=>S.day>=365],['sitevisits','Свой трафик','Набери 1 000 посещений сайта.',()=>S.site.visits>=1000],['reply','На связи','Ответь на отзыв игрока.',()=>S.comments.some(c=>c.reply)],['rating','Любимец игроков','Получи средний рейтинг 4.5 при 10+ оценках.',()=>S.mods.some(m=>m.rcount>=10&&avgRating(m)>=4.5)],['release1','Из раннего доступа','Выпусти версию 1.0 мода из Early Access.',()=>S.mods.some(m=>m.v1)],['top','Первый среди авторов','Обгони всех соперников по репутации.',()=>S.rep>Math.max(...S.rivals.map(r=>r.rep))&&S.rep>=30],['balance','Работа и жизнь','Проживи 30 дней без выгорания при здоровье выше 60.',()=>S.day>=30&&S.burnouts===0&&S.life.health>60]];

/* ===== Переход дня ===== */
function advanceDay(delta,extra){lifeDelta(delta||{});S.day++;S.today={};const res=simulateDay();lifeAfterDay();
if(S.life.health<=15){S.burnouts++;spend('other',80);log('event','Выгорание: организм потребовал паузу. Три дня отдыха и $80 на врача.');
S.life.energy=60;S.life.stress=40;S.life.mood=45;S.life.health=45;S.life.streak=0;toast('Выгорание! Три дня вынужденного отдыха.');
for(let i=0;i<3;i++){S.day++;S.today={};simulateDay()}}
if(S.cash<-500){if(!S.bailedOut){S.bailedOut=true;S.cash+=400;S.totalEarned+=0;gainRep(-8);log('event','Семья помогла закрыть долги (+$400), но репутация пострадала.')}else if(!S.over){S.over=true;setTimeout(()=>{if(typeof bankruptModal==='function')bankruptModal()},50)}}
checkAchievements();return res}
