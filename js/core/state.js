/* ===== Состояние ===== */
function makeRivals(){return[{id:1,name:'PixelForge',spec:'Визуальные моды',rep:22,followers:1100,mods:3,next:6},{id:2,name:'ByteBandit',spec:'Геймплей',rep:18,followers:800,mods:2,next:9},{id:3,name:'QuestWeaver',spec:'Квесты и сюжет',rep:26,followers:1450,mods:4,next:12},{id:4,name:'QoLWizard',spec:'Инструменты',rep:15,followers:650,mods:2,next:8},{id:5,name:'SoundSmith',spec:'Аудио и музыка',rep:20,followers:900,mods:3,next:10},{id:6,name:'CodeKitsune',spec:'Библиотеки и API',rep:24,followers:1200,mods:3,next:14}]}
function fresh(){return{version:3,ver:'3.5',mode:'career',sandbox:{noEvents:false},team:[],nextStaff:1,candidates:[],story:{cd:{}},pending:[],nextRep:1,tax:{inc:0,exp:0,last:1},stats:{hired:0,reportsDone:0,taxPaid:0,storyDone:0,awards:0,announce:0},day:1,cash:500,rep:0,repAcc:0,followers:0,downloads:0,views:0,totalEarned:0,totalSpent:0,
profile:{first:'Alex',last:'Morgan',nick:'UnknownModder',country:'Нидерланды',pronouns:'Не указывать',style:'Универсал'},
skills:{design:1,coding:1,marketing:1,testing:1,management:1},xp:{design:0,coding:0,marketing:0,testing:0,management:0},
life:{energy:80,mood:80,stress:10,health:90,streak:0},
mods:[],nextMod:1,
site:{created:false,name:'',domain:'',tagline:'Моды, созданные с увлечением.',theme:'Violet',priceMode:'mixed',monthly:35,visits:0,sales:0,revenue:0,subs:0,customDomain:false,ads:false,frozen:false},
comments:[],nextCid:1,rivals:makeRivals(),rivalMods:[],
market:{heat:{},gameHeat:{},next:{},analysed:false,week:0},
effects:{festivalUntil:0,boosts:{}},dispute:null,promo:null,bundles:[],today:{},cd:{collab:0,market:0},
debtDays:0,bailedOut:false,over:false,scandals:0,collabs:0,burnouts:0,pstats:{},
inc:{sales:0,bundles:0,ads:0,tips:0,gigs:0,supporters:0,other:0},exp:{living:0,site:0,dev:0,other:0,team:0,tax:0},
logs:[{day:1,cat:'info',text:'Ты начал карьеру моддера. Создай свой первый проект.'}],
history:[{day:1,cash:500,downloads:0,views:0}],achievements:[]}}
let S,firstRun=false;
function merge(def,src){if(def===null||typeof def!=='object'||Array.isArray(def))return src===undefined?def:src;
if(src===null||typeof src!=='object'||Array.isArray(src))return def;const out={...src};for(const k in def)out[k]=(k in src)?merge(def[k],src[k]):def[k];return out}
function normMod(m){const g=gameOf(m);return Object.assign({license:'commercial',tool:'basic',rating:'all',cover:'',color:'',tags:[],hype:0,lastAnnounce:-99,sponsorUntil:0,sales:0,languages:['English'],dependencies:[],fresh:1,pubDay:m.created||1,lastUpdate:-99,rsum:0,rcount:0,broken:false,evidence:0,tests:0,updatesCount:0,likes:0,views:0,downloads:0,earnings:0,platforms:[],price:0,release:'',version:'0.1.0',docs:1,updates:1,compat:1,test:1,features:[],audience:'broad',style:'Vanilla+',desc:'',visual:'',warned:false},m,{license:LICENSES[m.license]?m.license:'commercial',tool:TOOLS[m.tool]?m.tool:'basic',rating:RATINGS[m.rating]?m.rating:'all',hype:clamp(+m.hype||0,0,100),ms:Object.assign({alpha:false,beta:false},m.ms||{}),reports:Array.isArray(m.reports)?m.reports:[],tags:Array.isArray(m.tags)?m.tags:[],gameName:g.name,compat:clamp(+m.compat||0,0,2),updates:clamp(+m.updates||0,0,3),quality:clamp(+m.quality||10,0,100),bugs:clamp(+m.bugs||0,0,100),progress:clamp(+m.progress||0,0,100),languages:Array.isArray(m.languages)&&m.languages.length?m.languages:['English'],dependencies:Array.isArray(m.dependencies)?m.dependencies:[]})}
function migrate(s){const f=fresh();if(!s||typeof s!=='object'||!s.profile||!Array.isArray(s.mods))return f;
if(s.version===3){const o=merge(f,s);o.mods=o.mods.map(normMod);o.rep=Math.max(0,Math.floor(o.rep||0));return o}
const v2=s.v2||{},o=f;
Object.assign(o,{day:s.day||1,cash:+s.cash||0,rep:Math.max(0,Math.floor(s.rep||0)),followers:Math.floor(s.followers||0),downloads:s.downloads||0,views:s.views||0,totalEarned:s.totalEarned||0,totalSpent:s.totalSpent||0,nextMod:s.nextMod||1});
o.profile=merge(f.profile,s.profile);
for(const k in o.skills){o.skills[k]=clamp(Math.round(+(s.skills||{})[k]||1),1,10)}
o.life={energy:clamp(v2.energy??80,0,100),mood:clamp(v2.mood??80,0,100),stress:clamp(v2.stress??10,0,100),health:clamp(v2.health??90,0,100),streak:v2.daysWithoutBreak||0};
o.site=merge(f.site,s.site||{});o.site.ads=!!v2.siteAds;
o.mods=(s.mods||[]).map(normMod);
if(Array.isArray(v2.rivals)&&v2.rivals.length)o.rivals=v2.rivals.map((r,i)=>({id:i+1,name:r.name,spec:r.spec,rep:+r.rep||15,followers:+r.followers||500,mods:2,next:o.day+3+i*3}));
const cm=v2.comments||{};
for(const k of Object.keys(cm)){const m=o.mods.find(x=>x.id===+k);if(!m)continue;for(const c of cm[k]){if(!c||c.author==='Системное сообщение')continue;o.comments.push({id:o.nextCid++,modId:m.id,author:c.author,rating:c.rating,text:c.text,reply:c.reply||'',day:o.day});m.rsum+=c.rating;m.rcount++}}
o.scandals=v2.scandals||0;o.collabs=v2.collabs||0;
o.logs=(s.logs||[]).map(x=>({day:x.day,cat:'info',text:x.text})).slice(0,40);
o.history=(s.history||[]).slice(-90);if(!o.history.length)o.history=f.history;
o.achievements=Array.isArray(s.achievements)?s.achievements:[];
if(Array.isArray(v2.bundles))o.bundles=v2.bundles.filter(b=>b&&Array.isArray(b.mods)).map(b=>({name:b.name,mods:b.mods,discount:b.discount||15,day:b.day||o.day,sales:0,revenue:0}));
o.logs.unshift({day:o.day,cat:'info',text:'Сохранение перенесено в v3.0: исправлены отзывы, экономика и баги.'});
return o}
function load(){let s=null;try{const r=localStorage.getItem(SAVE_KEY);if(r)s=JSON.parse(r)}catch(e){s=null}
if(!s){try{const r=localStorage.getItem(OLD_KEY);if(r)s=JSON.parse(r)}catch(e){s=null}}
firstRun=!s;S=s?migrate(s):fresh()}
let saveWarned=false;
function save(manual){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));if(manual===true)toast('Прогресс сохранён в этом браузере.')}catch(e){if(!saveWarned||manual===true){saveWarned=true;toast('Не удалось сохранить: браузер блокирует хранилище. Сделай экспорт в настройках.')}}}
let toastTimer=null;
function toast(t){const e=$('toast');if(!e)return;e.textContent=t;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3200)}
function log(cat,text){S.logs.unshift({day:S.day,cat,text});if(S.logs.length>60)S.logs.length=60}

