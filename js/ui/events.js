/* ===== MOD EMPIRE v3.5 — окна событий, старт, песочница ===== */
function showPending(force){if(!S.pending.length)return;if(!force&&$('modal').classList.contains('open'))return;
const p=S.pending[0],def=EVENT_DEFS[p.id];if(!def){S.pending.shift();return}
const chs=def.choices(p.data),left=Math.max(0,3-(S.day-p.day));
modal(def.title,`<p>${esc(def.text(p.data))}</p><p class="small muted">Дней на решение: ${left}. Иначе будет выбрано: «${esc((chs[def.def]||chs[0]).label)}».${S.pending.length>1?' Ещё событий в очереди: '+(S.pending.length-1)+'.':''}</p>`,chs.map((c,i)=>`<button class="${i===0?'primary':''}" ${c.ok&&!c.ok(p.data)?'disabled':''} onclick="pickPending(${i})">${esc(c.label)}</button>`).join(''))}
function pickPending(i){const p=S.pending[0];if(!p)return;closeModal();resolvePending(p,i,false);checkAchievements();commit()}

function startScreen(){modal('MOD EMPIRE v3.5',`<p class="muted">Ты — начинающий автор модов. Выбери, как хочешь играть.</p><div class="field" style="margin-bottom:12px"><label>Никнейм автора</label><input id="snick" maxlength="30" value="${esc(S.profile.nick)}"></div><div class="grid two"><article class="card"><div class="body"><h3>🏆 Карьера</h3><p>Начальный капитал $500, усталость, налоги, зарплаты, долги. История одного моддера с настоящими рисками.</p><div class="actions"><button class="primary" onclick="startGame('career')">Начать карьеру</button></div></div></article><article class="card"><div class="body"><h3>🧪 Песочница</h3><p>Бесконечные деньги и силы, все площадки и сотрудники доступны сразу, без налогов и долгов. Можно ускорять время.</p><div class="actions"><button onclick="startGame('sandbox')">Начать песочницу</button></div></div></article></div>`,'')}
function startGame(mode){const nick=($('snick').value||'').trim().replace(/\s+/g,'_').slice(0,30)||'UnknownModder';
S=fresh();S.mode=mode;S.profile.nick=nick;if(mode==='sandbox'){S.cash=1000000000;S.logs[0].text='Режим песочницы: деньги и силы бесконечны. Экспериментируй.'}
refreshMarket();firstRun=false;closeModal();view('home');save();toast(mode==='sandbox'?'Песочница запущена.':'Карьера началась. Удачи!')}

/* ---- песочница ---- */
function sbSkip(n){if(!isSandbox())return;for(let i=0;i<n;i++)advanceDay({});closeModal();commit('Прошло дней: '+n)}
function sbRep(n){S.rep+=n;S.followers+=n;checkAchievements();settings();commit('Репутация +'+n)}
function sbFollowers(){S.followers+=5000;settings();commit('Подписчики +5000')}
function sbSkills(){for(const k of Object.keys(S.skills))S.skills[k]=10;settings();commit('Навыки на максимуме')}
function sbFixAll(){for(const m of S.mods){m.bugs=0;m.broken=false;m.reports=[]}settings();commit('Все моды исправлены')}
function sbFinish(){for(const m of S.mods)if(m.status==='development'){m.progress=100;m.status='ready'}settings();commit('Все проекты завершены')}
function sbToggleEvents(){S.sandbox.noEvents=!S.sandbox.noEvents;if(S.sandbox.noEvents)S.pending=[];commit(S.sandbox.noEvents?'События отключены.':'События включены.')}
