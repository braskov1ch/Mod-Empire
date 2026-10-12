/* ===== Аналитика ===== */
function spark(arr,color){if(arr.length<2)return'<p class="muted">Пока мало данных.</p>';const mn=Math.min(...arr),mx=Math.max(...arr),sp=mx-mn||1;const pts=arr.map((v,i)=>(i/(arr.length-1)*300).toFixed(1)+','+(42-(v-mn)/sp*38).toFixed(1)).join(' ');return`<svg class="spark" viewBox="0 0 300 46" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"/></svg><div class="row small muted"><span>${num(mn)}</span><span>${num(mx)}</span></div>`}
function renderAnalytics(){$('astats').innerHTML=stat('Просмотры',num(S.views),'Все площадки')+stat('Загрузки',num(S.downloads),'Все площадки')+stat('Общий доход',money(S.totalEarned),'За карьеру')+stat('Расходы',money(S.totalSpent),'За карьеру');
const ms=live(),mx=Math.max(1,...ms.map(m=>m.downloads));
$('popchart').innerHTML=ms.length?ms.slice().sort((a,b)=>b.downloads-a.downloads).slice(0,7).map(m=>`<div class="barline"><div class="name" title="${esc(m.name)}">${esc(m.name.slice(0,16))}</div><div class="bar progress"><span style="width:${m.downloads/mx*100}%"></span></div><div class="num">${num(m.downloads)}</div></div>`).join(''):'<p class="muted">Опубликуй первый мод, чтобы увидеть статистику.</p>';
const ps=Object.keys(S.pstats).map(k=>[k,S.pstats[k]]).filter(x=>platById(x[0])),pmx=Math.max(1,...ps.map(x=>x[1].views));
$('trafficchart').innerHTML=ps.length?ps.sort((a,b)=>b[1].views-a[1].views).map(([k,v])=>`<div class="barline"><div class="name">${platById(k).icon} ${platById(k).name}</div><div class="bar progress"><span style="width:${v.views/pmx*100}%"></span></div><div class="num">${num(v.views)}</div></div>`).join('')+(S.site.created?`<p class="small muted">Всего посещений сайта (включая главную): ${num(S.site.visits)}</p>`:''):'<p class="muted">Пока нет данных.</p>';
$('sparkcash').innerHTML=spark(S.history.map(h=>h.cash),'#69dda4');$('sparkdl').innerHTML=spark(S.history.map(h=>h.downloads),'#9c80ff');
$('history').innerHTML=`<div class="tablewrap"><table><thead><tr><th>День</th><th>Баланс</th><th>Загрузки</th><th>Просмотры</th></tr></thead><tbody>${S.history.slice(-14).reverse().map(h=>`<tr><td>${h.day}</td><td>${money(h.cash)}</td><td>${num(h.downloads)}</td><td>${num(h.views)}</td></tr>`).join('')}</tbody></table></div>`}

/* ===== Профиль ===== */
function renderProfile(fill){const p=S.profile;
if(fill){$('pfirst').value=p.first;$('plast').value=p.last;$('pnick').value=p.nick;$('ppronouns').value=p.pronouns;$('pstyle').value=p.style;$('pcountry').innerHTML=countries.map(c=>`<option ${p.country===c[0]?'selected':''}>${c[0]}</option>`).join('');$('pstyle').onchange=()=>{$('styledesc').textContent=STYLE_INFO[$('pstyle').value]||''}}
$('styledesc').textContent=STYLE_INFO[fill?p.style:$('pstyle').value]||'';
$('career').innerHTML=[['Ранг',rankName()],['Уровень автора',level()],['Репутация',num(S.rep)],['Создано проектов',S.mods.length],['Публичных релизов',live().length],['Дней в карьере',S.day],['Родной язык',nativeLang()]].map(r=>`<div class="row" style="margin-top:8px"><span class="muted">${r[0]}</span><b>${esc(r[1])}</b></div>`).join('');
$('skills').innerHTML=Object.keys(SKILLS).map(k=>`<div class="barline"><div class="name">${SKILLS[k]}</div><div class="bar progress"><span style="width:${S.skills[k]*10}%"></span></div><div class="num">${S.skills[k]}/10</div></div><div class="small muted" style="margin:-4px 0 6px 128px">${SKILL_FX[k]}</div>`).join('')}
function saveProfile(){const nick=$('pnick').value.trim().replace(/\s+/g,'_').slice(0,30);if(!nick){toast('Никнейм не может быть пустым.');return}
S.profile={first:$('pfirst').value.trim()||'Alex',last:$('plast').value.trim()||'Morgan',nick,country:$('pcountry').value,pronouns:$('ppronouns').value,style:$('pstyle').value};log('info','Ты обновил профиль автора.');commit('Профиль сохранён.')}

/* ===== Достижения ===== */
function renderAchievements(){$('achsub').textContent='Получено '+S.achievements.length+' из '+ach.length+'. Награда за каждое — $100 и 5 репутации.';$('achievements').innerHTML=ach.map(a=>{const d=S.achievements.includes(a[0]);return`<article class="card"><div class="body"><div class="row"><h3>${d?'🏆':'🔒'} ${a[1]}</h3><span class="badge ${d?'green':''}">${d?'Получено':'Не получено'}</span></div><p>${a[2]}</p></div></article>`}).join('')}

