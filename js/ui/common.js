/* ===== MOD EMPIRE v3.5 — интерфейс и действия ===== */
let activeView='home',gamesLimit=48;
const gameColor=id=>['#37305f','#174b54','#543146','#31533f','#5b462d','#2f4663'][id%6];
const stat=(l,v,s)=>`<div class="stat"><div class="label">${l}</div><div class="value">${v}</div><div class="sub">${s||''}</div></div>`;
const bar=(name,val,bad)=>`<div style="margin:10px 0"><div class="row"><span>${name}</span><b>${Math.round(val)}%</b></div><div class="progress ${bad?'neg':''}"><span style="width:${clamp(val,0,100)}%"></span></div></div>`;
const gameEmoji=m=>gameOf(m).emoji;
function modal(title,content,foot){$('mtitle').textContent=title;$('mcontent').innerHTML=content;$('mfoot').innerHTML=foot||'';$('modal').classList.add('open')}
function closeModal(){$('modal').classList.remove('open')}
function form(title,fields,okLabel,onOk,pre){
const h=fields.map(f=>`<div class="field" style="margin-bottom:10px"><label>${esc(f.label)}</label>${f.type==='select'?`<select id="ff_${f.id}">${f.options.map(o=>`<option value="${esc(o.v)}" ${String(o.v)===String(f.value)?'selected':''}>${esc(o.t)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea id="ff_${f.id}" maxlength="300">${esc(f.value||'')}</textarea>`:`<input id="ff_${f.id}" type="${f.type||'text'}" value="${esc(f.value??'')}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} maxlength="40">`}</div>`).join('');
modal(title,(pre||'')+h,`<button onclick="closeModal()">Отмена</button><button class="primary" id="ffok">${esc(okLabel)}</button>`);
$('ffok').onclick=()=>{const v={};fields.forEach(f=>v[f.id]=$('ff_'+f.id).value);if(onOk(v)!==false)closeModal()}}
function confirmModal(title,text,okLabel,onOk,danger){modal(title,`<p>${text}</p>`,`<button onclick="closeModal()">Отмена</button><button class="${danger?'danger':'primary'}" id="cfok">${esc(okLabel)}</button>`);$('cfok').onclick=()=>{closeModal();onOk()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* ===== навигация ===== */
const R={home:()=>renderHome(),games:()=>renderGames(),studio:()=>renderStudio(),mods:()=>renderMods(),publish:()=>renderPlatforms(),site:()=>renderSite(),analytics:()=>renderAnalytics(),profile:f=>renderProfile(f),achievements:()=>renderAchievements(),community:()=>renderCommunity(),economy:()=>renderEconomy(),life:()=>renderLife(),research:()=>renderResearch(),team:()=>renderTeam(),forum:()=>renderForum()};
function view(v){activeView=v;document.querySelectorAll('.view').forEach(e=>e.classList.remove('active'));$('v-'+v).classList.add('active');document.querySelectorAll('#nav button').forEach(e=>e.classList.toggle('active',e.dataset.v===v));render(true);window.scrollTo({top:0})}
$('nav').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)view(b.dataset.v)});
function render(fill){updateHeader();const f=R[activeView];if(!f)return;if(activeView==='site'){const a=document.activeElement;if(a&&$('sitecontent').contains(a)&&/INPUT|SELECT|TEXTAREA/.test(a.tagName))return}f(fill)}
function commit(msg){render();save();if(msg)toast(msg);showPending()}
function updateHeader(){$('daypill').textContent='День '+S.day+' · '+weekdayName();$('cashpill').textContent='💵 '+cashStr();$('cashpill').style.color=!isSandbox()&&S.cash<0?'#ff9aa8':'';$('modepill').classList.toggle('hidden',!isSandbox());
$('sidenick').textContent='@'+S.profile.nick;$('siderank').textContent=rankName()+' · '+num(S.rep)+' репутации';$('sidexp').style.width=(S.rep%100)+'%';
$('welcome').textContent=`${S.profile.first} ${S.profile.last} · @${S.profile.nick}. Каждый великий автор когда-то начинал с первого мода.`;
$('dot-community').classList.toggle('on',unreadCount()>0||!!S.dispute);
$('dot-life').classList.toggle('on',S.life.energy<30||S.life.health<40||S.life.stress>75);
$('dot-research').classList.toggle('on',live().some(isBroken));
$('dot-forum').classList.toggle('on',live().some(m=>m.reports.some(r=>r.votes>=8)));
$('dot-team').classList.toggle('on',S.team.some(t=>t.loyalty<35||t.unpaid>0))}

