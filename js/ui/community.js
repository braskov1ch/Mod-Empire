/* ===== Сообщество ===== */
function renderCommunity(){
const all=S.rivals.map(r=>({n:r.name,rep:r.rep,f:r.followers,sub:r.spec,me:false})).concat([{n:'@'+S.profile.nick+' (ты)',rep:S.rep,f:S.followers,sub:S.profile.style,me:true}]).sort((a,b)=>b.rep-a.rep);
$('rivals').innerHTML=`<div class="tablewrap"><table><thead><tr><th>#</th><th>Автор</th><th>Подписчики</th><th>Реп.</th></tr></thead><tbody>${all.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td><b>${esc(r.n)}</b><div class="small muted">${esc(r.sub)}</div></td><td>${num(r.f)}</td><td>${Math.round(r.rep)}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Соперники выпускают моды и отбирают часть аудитории у твоих модов для тех же игр.</p>`;
const cs=S.comments.filter(c=>c.rating>0).slice(-12).reverse().map(c=>({c,m:S.mods.find(x=>x.id===c.modId)}));
$('comments').innerHTML=cs.length?cs.map(({c,m})=>`<div style="padding:9px 0;border-bottom:1px solid var(--line)"><div class="row"><b>${esc(c.author)} · ${'★'.repeat(c.rating)}</b><span class="small muted">${esc(m?m.name:'—')} · день ${c.day}</span></div><p>${esc(c.text)}</p>${c.reply?`<p class="small">Твой ответ: ${esc(c.reply)}</p>`:`<button class="mini" onclick="replyComment(${c.id})">Ответить</button>`}</div>`).join(''):'<div class="empty">Отзывы появятся после публикации модов.</div>';
$('events').innerHTML=S.logs.filter(x=>x.cat==='event').slice(0,8).map(e=>`<div class="logrow event"><span class="d">День ${e.day}</span><span>${esc(e.text)}</span></div>`).join('')||'<p class="muted">Событий пока нет.</p>';
const d=S.dispute,m=d&&S.mods.find(x=>x.id===d.modId);
$('disputebox').innerHTML=d&&m?`<div class="notice bad"><b>Спор об авторстве «${esc(m.name)}»</b><p>Игрок утверждает, что идея заимствована. Ответь до дня ${d.deadline}, иначе потеряешь репутацию. Доказательств собрано: ${m.evidence}/3.</p><div class="actions"><button class="primary" onclick="resolveDispute(1)">Показать историю разработки</button><button onclick="resolveDispute(2)">Ответить эмоционально</button><button onclick="resolveDispute(3)">Игнорировать</button></div></div>`:''}
function replyComment(cid){const c=S.comments.find(x=>x.id===cid);if(!c||c.reply)return;const m=S.mods.find(x=>x.id===c.modId);
modal('Ответить игроку',`<p><b>${esc(c.author)}</b> · ${'★'.repeat(c.rating)} · ${esc(m?m.name:'')}</p><p>${esc(c.text)}</p><div class="field"><label>Свой текст (необязательно)</label><textarea id="rtext" maxlength="200"></textarea></div><div class="actions"><button class="primary" onclick="doReply(${cid},'thanks')">Поблагодарить</button><button onclick="doReply(${cid},'apology')">Извиниться и пообещать исправить</button><button onclick="doReply(${cid},'explain')">Объяснить и дать совет</button></div>`,`<button onclick="closeModal()">Закрыть</button>`)}
function doReply(cid,tone){const c=S.comments.find(x=>x.id===cid);if(!c||c.reply)return;const m=S.mods.find(x=>x.id===c.modId),custom=($('rtext').value||'').trim().slice(0,200);
const def={thanks:'Спасибо за отзыв!',apology:'Прости за неудобства — уже работаю над исправлением.',explain:'Спасибо! Вот как это работает и что можно настроить.'}[tone];c.reply=custom||def;
if(tone==='thanks'){gainRep(c.rating>=4?.3:.1);if(c.rating>=4)S.followers++}
else if(tone==='apology'){if(c.rating<=3&&m){m.rsum+=1;c.rating=Math.min(5,c.rating+1)}gainRep(.5)}
else{gainRep(.25);addXp('marketing',.2)}
addXp('marketing',.15);closeModal();checkAchievements();commit('Ответ отправлен.')}
function evidence(){const c=live();if(!c.length){toast('Сначала опубликуй мод.');return}if(S.cash<15){toast('Нужно $15.');return}
form('Доказательства авторства',[{id:'m',label:'Мод',type:'select',options:c.map(m=>({v:m.id,t:m.name+' (собрано '+m.evidence+'/3)'}))}],'Собрать',v=>{const m=S.mods.find(x=>x.id===+v.m);if(m.evidence>=3){toast('Для этого мода уже собрано максимум.');return false}spend('other',15);m.evidence++;log('info','Собраны доказательства авторства «'+m.name+'» ('+m.evidence+'/3).');commit('Доказательства сохранены.')})}
function resolveDispute(opt){const d=S.dispute;if(!d)return;const m=S.mods.find(x=>x.id===d.modId);if(!m){S.dispute=null;commit();return}
const p=opt===1?clamp(.5+m.docs*.08+m.evidence*.12+m.updatesCount*.03,.2,.95):opt===2?.25:0;
if(rand()<p){gainRep(3);S.followers+=10;log('event','Спор об авторстве «'+m.name+'» решён в твою пользу. Репутация выросла.');toast('Спор выигран!')}
else{gainRep(-4);S.scandals++;lifeDelta({stress:8,mood:-6});log('event','Спор об авторстве «'+m.name+'» проигран. Репутация упала.');toast('Спор проигран.')}
S.dispute=null;commit()}
function collab(){const c=live();if(!c.length){toast('Сначала опубликуй мод.');return}
if(S.cd.collab>S.day){toast('Следующая коллаборация возможна с дня '+S.cd.collab+'.');return}
if(S.life.energy<15){toast('Слишком устал для переговоров.');return}
const r=pick(S.rivals),p=clamp(.45+(S.rep/(r.rep+S.rep+1)-.5)*.5+S.skills.marketing*.03,.2,.85);S.cd.collab=S.day+6;lifeDelta({energy:-15,stress:2});
if(rand()<p){S.collabs++;gainRep(4);const f=Math.round(r.followers*.06);S.followers+=f;r.followers+=Math.round(S.followers*.02);earn('other',25);log('event','Удачная коллаборация с '+r.name+': +'+f+' подписчиков и $25.');commit('Коллаборация удалась!')}
else{gainRep(-1);lifeDelta({mood:-4});log('event','Коллаборация с '+r.name+' не сложилась: спор о распределении задач.');commit('Коллаборация не сложилась.')}}

/* ===== Заработок ===== */
function renderEconomy(){const i=S.inc,e=S.exp,rows=(o,n)=>Object.keys(o).filter(k=>o[k]>0).map(k=>`<div class="row small" style="padding:3px 0"><span class="muted">${n[k]||k}</span><b>${money(o[k])}</b></div>`).join('')||'<p class="muted small">Пока пусто.</p>';
const sumI=Object.values(i).reduce((a,b)=>a+b,0),old=Math.max(0,S.totalEarned-sumI);
$('finances').innerHTML=`<div class="stats">${stat('Баланс',cashStr(),'Личные деньги')}${stat('Доход',money(S.totalEarned),'За карьеру')}${stat('Расходы',money(S.totalSpent),'За карьеру')}</div><div class="section">Доходы</div>${rows(i,{sales:'Продажи модов',bundles:'Наборы',ads:'Реклама сайта',tips:'Чаевые и донаты',gigs:'Заказы',supporters:'Поддержка подписчиков',other:'Награды и прочее'})}${old>0?`<div class="row small" style="padding:3px 0"><span class="muted">До версии 3.0</span><b>${money(old)}</b></div>`:''}<div class="section">Расходы</div>${rows(e,{living:'Жизнь ($6/день)',site:'Сайт и домен',dev:'Разработка и тесты',other:'Прочее',team:'Команда',tax:'Налоги'})}<div class="section">Налоги</div><div class="row small"><span class="muted">База за текущий период (до дня ${S.tax.last+30})</span><b>${money(taxBase())}</b></div><div class="row small"><span class="muted">Ожидаемый налог 15%</span><b>${isSandbox()?'не взимается':money(taxDue())}</b></div><p class="small muted">Раз в 30 дней платится 15% с дохода за вычетом расходов (кроме жизни) и необлагаемых $300.</p><p class="small muted">Как повысить доход: цена влияет на спрос — слишком высокая цена убивает продажи.</p>`}
function gig(){if(S.today.gig){toast('Заказ на сегодня уже взят.');return}if(S.life.energy<25){toast('Слишком устал для заказа (нужно 25+ энергии).');return}
const r=Math.round(55+rand()*55+S.skills.coding*3);S.today.gig=1;lifeDelta({energy:-25,stress:3});earn('gigs',r);addXp('coding',.5);log('info','Выполнен заказ клиента: +'+money(r)+'.');commit('Заказ выполнен: +'+money(r))}
function tips(){if(S.today.tips){toast('Сегодня чаевые уже просили.');return}const c=live();if(!c.length){toast('Сначала опубликуй мод.');return}
const q=c.reduce((a,m)=>a+m.quality,0)/c.length,n=Math.round((3+rand()*10+S.followers/60)*(q/70));S.today.tips=1;lifeDelta({energy:-3});earn('tips',n);S.followers+=1;log('info','Игроки оставили '+money(n)+' чаевых.');commit('Чаевые: '+money(n))}
function marketing(){const c=live().filter(m=>!(S.effects.boosts[m.id]&&S.effects.boosts[m.id].until>=S.day));
if(S.today.mkt){toast('Сегодня уже запускал продвижение.');return}if(!live().length){toast('Сначала опубликуй мод.');return}if(!c.length){toast('У всех модов уже идёт продвижение.');return}if(S.cash<35){toast('Нужно $35.');return}
form('Продвижение',[{id:'m',label:'Мод',type:'select',options:c.map(m=>({v:m.id,t:m.name}))}],'Запустить · $35',v=>{const m=S.mods.find(x=>x.id===+v.m);spend('other',35);S.today.mkt=1;S.effects.boosts[m.id]={m:1.5,until:S.day+4};S.followers+=3;addXp('marketing',.8);lifeDelta({energy:-3});log('info','Кампания продвигает «'+m.name+'» 4 дня (×1.5 просмотров).');commit('Продвижение запущено на 4 дня.')})}

/* ===== Жизнь ===== */
function renderLife(){const L=S.life;$('wellbeing').innerHTML=bar('Энергия',L.energy,L.energy<30)+bar('Настроение',L.mood,L.mood<30)+bar('Здоровье',L.health,L.health<40)+bar('Стресс',L.stress,L.stress>70)+`<p class="small muted">Дней подряд без отдыха: ${L.streak}. После 6 дней падает здоровье. При здоровье 15% наступает выгорание.</p>`;
$('studybox').innerHTML=Object.keys(SKILLS).map(k=>{const cost=20+level()*10,need=2+S.skills[k];return`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><div><b>${SKILLS[k]} ${S.skills[k]}/10</b><div class="small muted">${SKILL_FX[k]} Опыт: ${(S.xp[k]||0).toFixed(1)}/${need}</div></div><button onclick="study('${k}')" ${S.skills[k]>=10?'disabled':''}>Курс · ${money(cost)}</button></div>`}).join('')}
function care(kind){const L=S.life;let d,msg,cost=0;
if(kind==='rest'){d={energy:35,mood:8,stress:-12};msg='Ты отдохнул дома.'}
else if(kind==='walk'){d={energy:15,mood:14,stress:-15};msg='Прогулка прочистила голову.'}
else if(kind==='social'){cost=15;d={energy:10,mood:22,stress:-12};msg='Вечер с друзьями удался.'}
else{d={energy:50,mood:10,stress:-25,health:8};msg='Полноценный выходной помог восстановиться.'}
if(cost&&S.cash<cost){toast('Нужно '+money(cost)+'.');return}if(cost)spend('other',cost);
L.streak=0;const res=advanceDay(d);log('info',msg);commit(dayToast(res,msg))}
function study(k){if(S.today.study){toast('Курс на сегодня уже пройден.');return}const cost=20+level()*10;if(S.cash<cost){toast('Нужно '+money(cost)+'.');return}if(S.life.energy<12){toast('Слишком устал для учёбы.');return}
spend('other',cost);S.today.study=1;lifeDelta({energy:-10});addXp(k,2);commit('Курс «'+SKILLS[k]+'» пройден.')}

/* ===== Рынок и патчи ===== */
function renderResearch(){const M=S.market,hot=Object.keys(M.heat).filter(k=>M.heat[k]>1).sort((a,b)=>M.heat[b]-M.heat[a]),cold=Object.keys(M.heat).filter(k=>M.heat[k]<1);
const gh=Object.keys(M.gameHeat).filter(k=>M.gameHeat[k].until>=S.day).sort((a,b)=>M.gameHeat[b].m-M.gameHeat[a].m);
$('trends').innerHTML=`<div class="section">Растут жанры</div>${hot.map(k=>`<div class="row" style="padding:4px 0"><span>${esc(k)}</span><span class="tag green">×${M.heat[k]}</span></div>`).join('')||'<p class="muted">Нет данных.</p>'}<div class="section">Теряют интерес</div>${cold.map(k=>`<div class="row" style="padding:4px 0"><span>${esc(k)}</span><span class="tag red">×${M.heat[k]}</span></div>`).join('')||'<p class="muted">Нет.</p>'}<div class="section">Игры в центре внимания</div>${gh.slice(0,8).map(k=>`<div class="row" style="padding:4px 0"><span>${esc(k)}</span><span class="tag">×${M.gameHeat[k].m} до дня ${M.gameHeat[k].until}</span></div>`).join('')||'<p class="muted">Нет.</p>'}`;
const nh=Object.keys(M.next||{}).filter(k=>M.next[k]>1);$('forecast').innerHTML=M.analysed?`<div class="notice success" style="margin-top:12px"><b>Прогноз на следующую неделю:</b> вырастет интерес к жанрам ${nh.map(esc).join(', ')||'—'}.</div>`:'<p class="small muted">Анализ рынка раскрывает тренды следующей недели.</p>';
const fx=[];if(S.effects.festivalUntil>=S.day)fx.push('Фестиваль моддинга до дня '+S.effects.festivalUntil+' (×1.25)');
for(const id in S.effects.boosts){const b=S.effects.boosts[id],m=S.mods.find(x=>x.id===+id);if(m&&b.until>=S.day)fx.push('Продвижение «'+esc(m.name)+'» ×'+b.m+' до дня '+b.until)}
const br=live().filter(isBroken);br.forEach(m=>fx.push('<span style="color:var(--red)">⚠ «'+esc(m.name)+'» сломан патчем или зависимостью</span>'));
const rv=S.rivalMods.filter(x=>x.until>=S.day&&S.mods.some(m=>m.published&&m.gameName===x.game));rv.slice(0,4).forEach(x=>fx.push('Конкурент '+esc(x.author)+' выпустил мод для '+esc(x.game)));
$('effects').innerHTML=fx.map(t=>`<div style="padding:6px 0;border-bottom:1px solid var(--line)">${t}</div>`).join('')||'<p class="muted">Сейчас активных эффектов нет.</p>';
const old=$('modselect').value;$('modselect').innerHTML=live().map(m=>`<option value="${m.id}">${esc(m.name)}${isBroken(m)?' ⚠':''}</option>`).join('')||'<option value="">Нет опубликованных модов</option>';if([...$('modselect').options].some(o=>o.value===old))$('modselect').value=old}
function analyseMarket(){if(S.market.analysed){toast('Прогноз на эту неделю уже получен.');return}if(S.cash<25){toast('Нужно $25.');return}spend('other',25);S.market.analysed=true;addXp('marketing',.5);commit('Прогноз получен.')}
function selMod(){const m=S.mods.find(x=>x.id===+$('modselect').value);if(!m)toast('Нет опубликованного мода.');return m}
function fix(kind){const m=selMod();if(!m)return;if(S.cash<10){toast('Нужно $10 на тесты.');return}if(S.life.energy<10){toast('Слишком устал для работы.');return}
spend('dev',10);let msg;
if(kind==='compat'){if(!m.broken&&!isBroken(m)){toast('Конфликтов совместимости нет — проверка ничего не нашла.');m.bugs=clamp(m.bugs-1,0,100)}else{m.broken=false;m.quality=clamp(m.quality+1,0,100);msg='Совместимость «'+m.name+'» восстановлена.'}}
else if(kind==='bugs'){m.bugs=clamp(m.bugs-8-S.skills.testing*.5,0,100);msg='Исправлены баги «'+m.name+'».'}
else{m.quality=clamp(m.quality+3*(1-m.quality/110),0,100);m.bugs=clamp(m.bugs-2,0,100);msg='Оптимизирована производительность «'+m.name+'».'}
if(!msg){commit();return}
addXp('testing',.4);S.life.streak++;const res=advanceDay({energy:-4,stress:2});log('info',msg);commit(dayToast(res,msg+' Бесплатно для игроков'))}
function addLanguage(){const m=selMod();if(!m)return;const opts=LANGS.filter(l=>!m.languages.includes(l));if(!opts.length){toast('Все языки уже добавлены.');return}if(m.languages.length>=5){toast('Максимум 5 языков (дальше эффекта нет).');return}if(S.cash<30){toast('Нужно $30 на перевод.');return}
form('Локализация «'+m.name+'»',[{id:'l',label:'Язык',type:'select',options:opts.map(l=>({v:l,t:l}))}],'Добавить · $30',v=>{if(S.life.energy<10){toast('Слишком устал.');return false}spend('dev',30);m.languages.push(v.l);m.quality=clamp(m.quality+1,0,100);S.life.streak++;const res=advanceDay({energy:-4,stress:1});log('info','Для «'+m.name+'» добавлена локализация: '+v.l+' (+5% аудитории).');commit(dayToast(res,'Локализация добавлена бесплатно'))})}
function addDependency(){const m=selMod();if(!m)return;const c=live().filter(x=>x.id!==m.id&&!m.dependencies.includes(x.id)&&!x.dependencies.includes(m.id));if(!c.length){toast('Нет подходящих модов для зависимости.');return}
form('Зависимость «'+m.name+'»',[{id:'d',label:'Требуемый мод',type:'select',options:c.map(x=>({v:x.id,t:x.name}))}],'Добавить',v=>{const d=S.mods.find(x=>x.id===+v.d);m.dependencies.push(d.id);log('info','«'+m.name+'» теперь использует «'+d.name+'»: +6% аудитории, но если зависимость сломается — сломается и мод.');commit('Зависимость добавлена.')},'<p class="small muted">Плюс: аудитория зависимости переходит к моду (+6% просмотров). Минус: поломка зависимости ломает и этот мод.</p>')}

