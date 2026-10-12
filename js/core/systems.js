/* ===== MOD EMPIRE v3.5 — команда, налоги, отчёты форума, сюжетные события ===== */
const reportVotes=m=>(m.reports||[]).reduce((a,r)=>a+r.votes,0);
const bossStyle=()=>S.profile.style==='Руководитель студии';
const teamMult=()=>1+(S.skills.management-1)*.04;
const teamSkill=role=>S.team.filter(t=>t.role===role).reduce((a,t)=>a+t.skill*(.6+.4*t.loyalty/100),0);
const teamSlots=()=>isSandbox()?6:Math.min(6,level());
const salaryFor=skill=>Math.round(3+skill*2.2);
const staffPay=t=>Math.round(t.salary*(bossStyle()?.9:1)*100)/100;
const hireFee=c=>Math.round(c.salary*5*(1-S.skills.management*.02));
const teamPayroll=()=>S.team.reduce((a,t)=>a+staffPay(t),0);

function makeCandidate(){const role=pick(Object.keys(ROLES)),maxS=clamp(2+Math.floor(level()/1.5),2,7),skill=clamp(1+Math.floor(rand()*maxS),1,7);
return{id:S.nextStaff++,name:pick(STAFF_FIRST)+' '+pick(STAFF_LAST),role,skill,salary:salaryFor(skill)}}
function refreshCandidates(){S.candidates=[];for(let i=0;i<4;i++)S.candidates.push(makeCandidate())}
function hireStaff(cid){const c=S.candidates.find(x=>x.id===cid);if(!c)return'Кандидат уже ушёл.';
if(S.team.length>=teamSlots())return'Нет свободных мест в команде. Растёт с уровнем автора (уровень '+level()+' → '+teamSlots()+' мест).';
const fee=hireFee(c);if(S.cash<fee)return'Нужно '+money(fee)+' на оформление.';
spend('team',fee);S.candidates=S.candidates.filter(x=>x!==c);
S.team.push({id:c.id,name:c.name,role:c.role,skill:c.skill,salary:c.salary,loyalty:70,unpaid:0,xp:0,joined:S.day});S.stats.hired++;
log('info','В команду принят '+c.name+' ('+ROLES[c.role].n+', навык '+c.skill+'). Зарплата '+money(c.salary)+'/день.');addXp('management',.6);return''}
function fireStaff(id){const t=S.team.find(x=>x.id===id);if(!t)return;S.team=S.team.filter(x=>x!==t);
for(const o of S.team)o.loyalty=clamp(o.loyalty-5,0,100);log('info',t.name+' ('+ROLES[t.role].n+') больше не работает в команде.')}
function raiseStaff(id){const t=S.team.find(x=>x.id===id);if(!t)return;t.salary=Math.round(t.salary*1.15*100)/100;t.loyalty=clamp(t.loyalty+15,0,100);log('info',t.name+' получил повышение зарплаты до '+money(t.salary)+'/день.')}
function trainStaff(id){const t=S.team.find(x=>x.id===id);if(!t||t.skill>=8)return'Навык уже максимальный.';const cost=40+t.skill*20;if(S.cash<cost)return'Нужно '+money(cost)+'.';
spend('team',cost);t.xp+=1.5;t.loyalty=clamp(t.loyalty+4,0,100);const need=3+t.skill;
if(t.xp>=need){t.xp-=need;t.skill++;t.salary=salaryFor(t.skill);log('info',t.name+' повысил навык до '+t.skill+'.')}return''}

function teamDaily(){
if(S.day%7===1||!S.candidates.length)refreshCandidates();
for(const t of S.team.slice()){const pay=staffPay(t);
if(isSandbox()||S.cash>=pay){spend('team',pay);t.unpaid=0;t.loyalty=clamp(t.loyalty+(55+S.skills.management*3+(bossStyle()?6:0)-t.loyalty)*.03+(S.life.mood>70?.1:0),0,100)}
else{t.unpaid++;t.loyalty=clamp(t.loyalty-4,0,100)}
t.xp+=.04+S.skills.management*.004;const need=3+t.skill;
if(t.xp>=need&&t.skill<8){t.xp-=need;t.skill++;t.salary=salaryFor(t.skill);log('info',t.name+' набрался опыта: навык '+t.skill+'.')}
if(t.unpaid>=5||t.loyalty<15){S.team=S.team.filter(x=>x!==t);gainRep(-.5);log('event',t.name+' ('+ROLES[t.role].n+') уволился'+(t.unpaid>=5?': ему не платили жалование.':': потерял мотивацию.'))}}
if(S.day%12===0&&teamSkill('translator')>=3){const c=live().filter(m=>m.languages.length<5);if(c.length){const m=pick(c),o=LANGS.filter(l=>!m.languages.includes(l));if(o.length){const l=pick(o);m.languages.push(l);m.quality=clamp(m.quality+.5,0,100);log('info','Переводчик добавил локализацию «'+l+'» в мод «'+m.name+'».')}}}
const ms=teamSkill('manager');
if(ms>0){for(const c of S.comments){if(c.rating>0&&c.rating<=3&&!c.reply&&rand()<Math.min(.5,.06*ms)){c.reply='Спасибо за отзыв! Команда уже работает над исправлением.';gainRep(.2)}}}}

/* ---- отчёты форума ---- */
function addReport(m,kind){let text,fid=null;
if(kind==='feature'){const g=gameOf(m),tx=(g.genre+' '+g.desc).toLowerCase();
const o=features.filter(f=>!m.features.includes(f[0])&&!ALWAYS.has(f[0])&&featRel[f[0]]&&featRel[f[0]].test(tx)&&!m.reports.some(r=>r.fid===f[0]));
if(!o.length)return;const f=pick(o);fid=f[0];text=pick(REPORT_TEXT.feature)+f[1].toLowerCase()+'.'}
else text=pick(REPORT_TEXT[kind]);
m.reports.push({id:S.nextRep++,kind,text,fid,votes:1+Math.floor(rand()*4),day:S.day})}
function genReports(m,d){for(const r of m.reports)if(rand()<.3)r.votes+=1+(d>30?1:0);
if(m.reports.length>=6)return;
if(m.broken&&!m.reports.some(r=>r.kind==='compat')){addReport(m,'compat');return}
const p=.02+Math.min(.1,d/500)+(m.bugs>35?.03:0);if(rand()>p)return;
addReport(m,rand()<.45?'feature':(m.bugs>30||rand()<.5)?'bug':'perf')}

/* ---- налоги ---- */
const TAX_RATE=.15,TAX_FREE=300;
const taxBase=()=>Math.max(0,S.tax.inc-S.tax.exp-TAX_FREE);
const taxDue=()=>Math.round(taxBase()*TAX_RATE);
function taxDaily(){if(S.day-S.tax.last<30)return;const inc=S.tax.inc,exp=S.tax.exp,amount=taxDue();S.tax.last=S.day;S.tax.inc=0;S.tax.exp=0;
if(amount>0&&!isSandbox()){spend('tax',amount);S.stats.taxPaid+=amount;log('event','Налоги за 30 дней: доход '+money(inc)+', вычеты '+money(exp)+', налог 15% = '+money(amount)+'.')}
else if(amount>0)log('info','Налог '+money(amount)+' в песочнице не взимается.');
else log('info','Налоговый период закрыт: налога нет (доход за вычетами меньше $300).')}

/* ---- отложенные события с выбором ---- */
const EVENT_DEFS={};
function defEvent(id,o){EVENT_DEFS[id]=Object.assign({id,w:1,cd:40,ok:()=>true,data:()=>({}),def:0},o)}
function queuePending(id,data){S.pending.push({id,data:data||{},day:S.day});if(S.pending.length>5)S.pending.shift()}
function resolvePending(p,idx,auto){const def=EVENT_DEFS[p.id];S.pending=S.pending.filter(x=>x!==p);if(!def)return;
const chs=def.choices(p.data),ch=chs[idx]||chs[def.def]||chs[0];
if(ch.ok&&!ch.ok(p.data)){const fb=chs[def.def]||chs[0];fb.run(p.data);return}
ch.run(p.data);S.stats.storyDone++;if(auto)log('info','Событие «'+def.title+'» решилось само: '+ch.label+'.')}
function expirePending(){for(const p of S.pending.slice())if(S.day-p.day>=3){const d=EVENT_DEFS[p.id];resolvePending(p,d?d.def:0,true)}}
function scheduleStory(){if(S.pending.length>=3||rand()>.07)return;
const ok=Object.values(EVENT_DEFS).filter(d=>d.w>0&&!(S.story.cd[d.id]>S.day)&&!S.pending.some(p=>p.id===d.id)&&d.ok());if(!ok.length)return;
let x=rand()*ok.reduce((a,d)=>a+d.w,0),d=ok[0];for(const e of ok){x-=e.w;if(x<=0){d=e;break}}
const data=d.data();if(data===null)return;queuePending(d.id,data);S.story.cd[d.id]=S.day+d.cd;
log('event','Новое событие: «'+d.title+'». Если не ответишь, через 3 дня решение примут без тебя.')}
function takedown(m){if(!m)return;m.published=false;m.status='ready';m.platforms=[];m.release='';log('event','Мод «'+m.name+'» снят с публикации. Его можно доработать и опубликовать заново.')}
const modById=id=>S.mods.find(x=>x.id===id);

defEvent('studio',{w:1,cd:500,title:'Предложение от студии',ok:()=>S.rep>=120&&live().length>=2&&!(S.effects.royaltyUntil>=S.day),
text:()=>'Небольшая студия предлагает контракт: аванс $3 000 и поддержка, но 90 дней она будет получать 20% с твоих продаж.',def:1,
choices:()=>[{label:'Подписать контракт',run(){earn('other',3000);gainRep(8);S.effects.royaltyUntil=S.day+90;log('event','Контракт подписан: +$3 000. 90 дней студия получает 20% продаж.')}},
{label:'Остаться независимым',run(){gainRep(2);S.followers+=15;log('event','Ты отказался от контракта. Сообщество оценило независимость.')}}]});
defEvent('conference',{w:2,cd:60,title:'Приглашение на конференцию',ok:()=>S.rep>=60,def:1,
text:()=>'Организаторы моддинг-конференции зовут тебя выступить. Личное участие стоит $120 и сил, но даёт много внимания.',
choices:()=>[{label:'Приехать лично · $120',ok:()=>isSandbox()||S.cash>=120,run(){spend('other',120);lifeDelta({energy:-20,stress:4});S.followers+=20+Math.round(S.rep*.1);gainRep(4);addXp('marketing',1.5);log('event','Конференция удалась: новые подписчики и знакомства.')}},
{label:'Выступить онлайн',run(){S.followers+=5;gainRep(1);log('event','Ты выступил онлайн.')}},
{label:'Отказаться',run(){log('info','Ты отклонил приглашение на конференцию.')}}]});
defEvent('legal',{w:1,cd:80,title:'Претензия правообладателя',ok:()=>live().length>0&&rand()<.5,
data:()=>{const c=live();return c.length?{modId:pick(c).id}:null},def:0,
text:d=>{const m=modById(d.modId);return'Правообладатель игры «'+(m?m.gameName:'?')+'» считает, что мод «'+(m?m.name:'?')+'» нарушает его права. Нужно решить, что делать.'},
choices:d=>[{label:'Снять мод с публикации',run(){const m=modById(d.modId);takedown(m);gainRep(-1)}},
{label:'Нанять юриста · $200',ok:()=>isSandbox()||S.cash>=200,run(){const m=modById(d.modId);spend('other',200);if(rand()<.7){gainRep(2);log('event','Юрист всё уладил: «'+(m?m.name:'мод')+'» остаётся доступным.')}else{takedown(m);gainRep(-2)}}},
{label:'Игнорировать',run(){const m=modById(d.modId);if(rand()<.5){takedown(m);gainRep(-5);lifeDelta({stress:8})}else log('info','Претензия осталась без последствий.')}}]});
defEvent('sponsor',{w:2,cd:45,title:'Спонсорское предложение',ok:()=>live().length>0&&S.rep>=40,
data:()=>{const c=live().filter(m=>m.sponsorUntil<S.day);if(!c.length)return null;const m=pick(c);return{modId:m.id,offer:Math.round(Math.min(900,150+m.downloads*.05))}},def:1,
text:d=>{const m=modById(d.modId);return'Бренд предлагает '+money(d.offer)+' за интеграцию в мод «'+(m?m.name:'?')+'». Игроки могут быть недовольны рекламой (−8% просмотров 30 дней).'},
choices:d=>[{label:'Принять · '+money(d.offer),run(){const m=modById(d.modId);earn('other',d.offer);if(m)m.sponsorUntil=S.day+30;gainRep(-1);log('event','Спонсор заплатил '+money(d.offer)+'.')}},
{label:'Отказаться',run(){gainRep(1);log('info','Ты отказался от рекламы в моде.')}}]});
defEvent('interview',{w:2,cd:45,title:'Интервью',ok:()=>S.rep>=50,def:2,
text:()=>'Игровой журналист просит интервью о твоём пути. Как держаться?',
choices:()=>[{label:'Говорить честно',run(){gainRep(2);S.followers+=8;log('event','Честное интервью понравилось читателям.')}},
{label:'Дерзко и громко',run(){if(rand()<.6){gainRep(4);S.followers+=18;log('event','Громкое интервью разошлось по сети.')}else{gainRep(-2);log('event','Резкие слова в интервью вызвали критику.')}}},
{label:'Отказаться',run(){log('info','Ты отказал журналисту.')}}]});
defEvent('award',{w:1,cd:120,title:'Номинация на премию',ok:()=>live().some(m=>m.quality>=75&&m.rcount>=5),
data:()=>{const c=live().filter(m=>m.quality>=75&&m.rcount>=5);return c.length?{modId:pick(c).id}:null},def:1,
text:d=>{const m=modById(d.modId);return'Мод «'+(m?m.name:'?')+'» номинирован на премию сообщества. Церемония платная ($60).'},
choices:d=>[{label:'Пойти на церемонию · $60',ok:()=>isSandbox()||S.cash>=60,run(){spend('other',60);const m=modById(d.modId),p=clamp(.25+(m?m.quality:50)/200,.2,.7);if(rand()<p){S.stats.awards++;gainRep(8);earn('other',500);log('event','Победа! «'+(m?m.name:'Мод')+'» получил премию: +$500.')}else{gainRep(1);log('event','Победа досталась другому, но тебя заметили.')}}},
{label:'Пропустить',run(){gainRep(.5);log('info','Ты пропустил церемонию.')}}]});
defEvent('poach',{w:2,cd:40,title:'Сотрудника переманивают',ok:()=>S.team.length>0,
data:()=>S.team.length?{staffId:pick(S.team).id}:null,def:0,
text:d=>{const t=S.team.find(x=>x.id===d.staffId);return t?t.name+' ('+ROLES[t.role].n+') получил предложение от другой студии.':'Сотрудник получил предложение работы.'},
choices:d=>[{label:'Повысить зарплату на 20%',run(){const t=S.team.find(x=>x.id===d.staffId);if(t){t.salary=Math.round(t.salary*1.2*100)/100;t.loyalty=clamp(t.loyalty+15,0,100);log('info',t.name+' остался. Зарплата выросла.')}}},
{label:'Премия $150',ok:()=>isSandbox()||S.cash>=150,run(){const t=S.team.find(x=>x.id===d.staffId);spend('team',150);if(t){if(rand()<.6){t.loyalty=clamp(t.loyalty+25,0,100);log('info',t.name+' принял премию и остался.')}else{S.team=S.team.filter(x=>x!==t);log('event',t.name+' всё равно ушёл.')}}}},
{label:'Отпустить',run(){const t=S.team.find(x=>x.id===d.staffId);if(t)fireStaff(t.id)}}]});
defEvent('milestone',{w:0,cd:0,title:'Этап проекта',def:2,
text:d=>{const m=modById(d.modId);return'«'+(m?m.name:'Проект')+'» дошёл до стадии '+(d.stage==='alpha'?'альфы':'беты')+'. Что делать дальше?'},
choices:d=>{const m=modById(d.modId),cost=30+(m?m.scale:2)*15;return[
{label:'Публичный тест · '+money(cost),ok:()=>isSandbox()||S.cash>=cost,run(){spend('dev',cost);if(!m)return;m.hype=clamp(m.hype+(d.stage==='alpha'?12:18),0,100);S.followers+=6;m.bugs=clamp(m.bugs-5,0,100);S.stats.announce++;
if(m.quality<45){gainRep(-1);log('event','Публичный тест «'+m.name+'» показал сырой продукт: репутация чуть упала.')}else log('info','Публичный тест «'+m.name+'»: хайп '+m.hype+'/100, найдены баги.')}},
{label:'Закрытый тест · $30',ok:()=>isSandbox()||S.cash>=30,run(){spend('dev',30);if(m){m.bugs=clamp(m.bugs-8,0,100);m.quality=clamp(m.quality+1,0,100);log('info','Закрытый тест «'+m.name+'»: баги снижены.')}}},
{label:'Пропустить',run(){}}]}});

/* ---- достижения v3.5 ---- */
ach.push(['hire1','Первый сотрудник','Прими человека в команду.',()=>S.stats.hired>=1],
['team4','Команда мечты','Собери команду из 4 человек.',()=>S.team.length>=4],
['bigproj','Большой проект','Опубликуй мод с масштабом «Амбициозный» или выше.',()=>live().some(m=>m.scale>=4)],
['alpha','Публичный тест','Проведи публичное тестирование на этапе проекта.',()=>S.stats.announce>=1],
['forum10','Слушаю сообщество','Реши 10 запросов на форуме.',()=>S.stats.reportsDone>=10],
['tax','Налогоплательщик','Заплати налоги.',()=>S.stats.taxPaid>0],
['opensrc','Открытый код','Опубликуй мод с открытой лицензией.',()=>live().some(m=>m.license==='open')],
['poly','Полиглот','Переведи мод на 5 языков.',()=>S.mods.some(m=>m.languages.length>=5)],
['story5','Сюжетный поворот','Прими решения в пяти событиях.',()=>S.stats.storyDone>=5],
['lib','Основа для других','Сделай библиотеку, от которой зависит другой мод.',()=>S.mods.some(l=>l.type==='library'&&l.published&&S.mods.some(x=>x.dependencies.includes(l.id)))],
['rich1k','Первая тысяча','Заработай $1 000 за карьеру.',()=>S.totalEarned>=1000],
['rich10k','Десять тысяч','Заработай $10 000 за карьеру.',()=>S.totalEarned>=10000],
['plat5','Везде и сразу','Опубликуй свои моды на пяти разных площадках.',()=>new Set(S.mods.flatMap(m=>m.platforms)).size>=5],
['award','Лауреат','Выиграй премию сообщества.',()=>S.stats.awards>=1],
['hype','Громкий анонс','Доведи хайп мода до 60.',()=>S.mods.some(m=>m.hype>=60)]);
