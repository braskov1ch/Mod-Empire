/* ===== Публикация ===== */
function renderPlatforms(){$('platformgrid').innerHTML=platforms.map(p=>{const locked=p.unlock>level()&&!isSandbox(),site=p.id==='personal'&&!S.site.created;return`<article class="card"><div class="body"><div class="row"><h3>${p.icon} ${p.name}</h3><span class="badge ${locked||site?'yellow':'green'}">${site?'Нужен сайт':locked?'Нужен уровень '+p.unlock:'Доступно'}</span></div><p>${p.desc}</p><div class="tags"><span class="tag">Охват ×${p.reach.toFixed(2)}</span><span class="tag">Комиссия ${Math.round(p.fee*100)}%</span><span class="tag">${p.paid?'Продажи разрешены':'Только бесплатно'}</span></div><div class="small muted">${p.games==='all'?'Любые игры':'Только поддерживаемые игры'}</div><div class="actions"><button ${locked||site?'disabled':''} onclick="$('pubplatform').value='${p.id}';pubHint()">Выбрать площадку</button></div></div></article>`}).join('');renderPubOptions();pubHint()}
function renderPubOptions(){const om=$('pubmod').value;$('pubmod').innerHTML=S.mods.filter(m=>m.status!=='development').map(m=>`<option value="${m.id}">${esc(m.name)} · ${m.published?'опубликован':'готов'}</option>`).join('')||'<option value="">Нет готовых модов</option>';if([...$('pubmod').options].some(o=>o.value===om))$('pubmod').value=om;
const op=$('pubplatform').value;$('pubplatform').innerHTML=platforms.map(p=>`<option value="${p.id}">${p.icon} ${p.name}${p.unlock>level()&&!isSandbox()?' · 🔒':''}</option>`).join('');if([...$('pubplatform').options].some(o=>o.value===op))$('pubplatform').value=op}
function pubHint(){const m=S.mods.find(x=>x.id===+$('pubmod').value),p=platById($('pubplatform').value);let t='';if(m&&p){const g=gameOf(m);if(m.published)t='Мод уже выпущен: условия релиза и цена берутся из первой публикации ('+(m.release==='early'?'Early Access':m.release==='free'?'бесплатно':'релиз')+(m.price>0?', '+money(m.price):'')+').';else if(!platOK(p,m))t='Эта площадка не поддерживает «'+m.gameName+'».';else if(g.risk)t='⚠ Онлайн-игра с античитом: возможны предупреждения модераторов.';else t=(m.license!=='commercial'?'Лицензия «'+LICENSES[m.license].n+'»: мод будет бесплатным. ':'')+(m.hype>=40?'Хайп '+Math.round(m.hype)+': игроки ждут качество не ниже '+Math.round(40+m.hype*.4-5)+'. ':'')+'Платные релизы доступны на: Ko-fi, itch.io, Patreon, личный сайт. Подготовка платного релиза — $15.'}$('pubhint').textContent=t;
const dis=m&&m.published;['pubstatus','pubprice'].forEach(id=>$(id).disabled=!!dis)}
function publishMod(){const m=S.mods.find(x=>x.id===+$('pubmod').value),p=platById($('pubplatform').value);
if(!m){toast('Сначала заверши разработку мода.');return}
if(m.status==='development'){toast('Мод ещё в разработке.');return}
if(m.platforms.includes(p.id)){toast('Мод уже опубликован на этой площадке.');return}
if(p.id==='personal'&&!S.site.created){toast('Сначала создай личный сайт.');return}
if(p.unlock>level()&&!isSandbox()){toast('Нужен уровень автора '+p.unlock+' (репутация '+(p.unlock-1)*100+'+).');return}
if(!platOK(p,m)){toast(m.rating==='mature'&&(p.id==='workshop'||p.id==='curse')?'Контент 18+ запрещён на этой площадке.':'Площадка не поддерживает эту игру.');return}
const first=!m.published;let rel=first?$('pubstatus').value:m.release,price=first?clamp(+$('pubprice').value||0,0,60):m.price;if(rel==='free'||m.license!=='commercial')price=0;
if(first&&price>0&&!p.paid){toast('Эта площадка не поддерживает прямые продажи.');return}
if(!first&&m.price>0&&m.release!=='free'&&!p.paid){toast('Платный мод нельзя выкладывать бесплатно. Сначала сделай его бесплатным в «Статистика → Изменить цену».');return}
if(first&&price>0&&m.quality<45){toast('Для платного релиза нужно качество не ниже 45.');return}
const fee=first&&price>0?15:0;if(S.cash<fee){toast('Нужно '+money(fee)+' на подготовку релиза.');return}
if(fee)spend('other',fee);m.platforms.push(p.id);
if(first){m.published=true;m.release=rel;m.price=price;m.status=rel==='early'?'early':'published';m.pubDay=S.day;m.fresh=1;m.quality=clamp(m.quality+m.docs*2+S.skills.marketing,0,100);
{const need=40+m.hype*.4;if(m.hype>=40&&m.quality<need-5){gainRep(-3);m.fresh=.85;log('event','Игроки ждали большего от «'+m.name+'»: хайп '+Math.round(m.hype)+', а качество '+Math.round(m.quality)+'. Репутация упала.')}else if(m.hype>=40){gainRep(3);S.followers+=Math.round(m.hype/4);log('event','Хайп вокруг «'+m.name+'» оправдался: игроки довольны.')}}
const nl=nativeLang();if(!m.languages.includes(nl))m.languages.push(nl);
const rp=Math.round(5+m.quality/10+gameOf(m).pop/20);gainRep(rp);S.followers+=Math.round(3+m.quality/7);log('info','«'+m.name+'» опубликован'+(rel==='early'?' в Early Access':'')+' на '+p.name+'. +'+rp+' репутации.')}
else{gainRep(2);log('info','«'+m.name+'» теперь доступен и на '+p.name+'.')}
checkAchievements();commit('Мод опубликован!')}

