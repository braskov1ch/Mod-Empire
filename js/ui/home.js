/* ===== Обзор ===== */
function renderHome(){
$('dashstats').innerHTML=stat('Баланс',cashStr(),'Доход за карьеру '+money(S.totalEarned))+stat('Репутация',num(S.rep),rankName())+stat('Загрузки',num(S.downloads),'Все проекты')+stat('Подписчики',num(S.followers),'Аудитория автора');
const steps=[['Создай первый мод',S.mods.length>0],['Заверши разработку мода',S.mods.some(m=>m.status!=='development')],['Опубликуй мод на площадке',live().length>0],['Ответь на отзыв игрока',S.comments.some(c=>c.reply)],['Выпусти бесплатное обновление',S.mods.some(m=>m.updatesCount>0)],['Набери 100 репутации и $1 500 для личного сайта',S.site.created],['Набери 1 000 загрузок',S.downloads>=1000],['Обгони всех соперников по репутации',S.rep>Math.max(...S.rivals.map(r=>r.rep))&&S.rep>=30]];
let nxt=steps.findIndex(s=>!s[1]);
$('goal').innerHTML=steps.map((s,i)=>`<div class="check ${s[1]?'done':i===nxt?'next':''}"><i>${s[1]?'✓':i===nxt?'➜':'○'}</i><span>${esc(s[0])}</span></div>`).join('');
$('goalbadge').textContent=steps.filter(s=>s[1]).length+'/'+steps.length;
const L=S.life;$('todaybadge').textContent='День '+S.day;
$('todaybox').innerHTML=(S.pending.length?'<div class="notice warn">Ждут решения событий: '+S.pending.length+'. <button class="mini" onclick="showPending(true)">Открыть</button></div>':'')+bar('Энергия',L.energy,L.energy<30)+bar('Настроение',L.mood,L.mood<30)+(L.energy<25?'<div class="notice warn">Ты на пределе — работа идёт медленно. Загляни во вкладку «Жизнь».</div>':'')+(S.cash<0?'<div class="notice bad">Баланс отрицательный: если уйти ниже −$500, начнутся серьёзные проблемы. Возьми заказ во вкладке «Заработок».</div>':'');
$('logs').innerHTML=S.logs.slice(0,8).map(x=>`<div class="logrow ${x.cat==='event'?'event':''}"><span class="d">День ${x.day}</span><span>${esc(x.text)}</span></div>`).join('');
const ms=S.mods.slice(-3).reverse();$('dashmods').innerHTML=ms.length?`<div class="grid">${ms.map(modCard).join('')}</div>`:'<div class="empty"><b>Пока нет модов</b>Начни карьеру с небольшой модификации.</div>'}

