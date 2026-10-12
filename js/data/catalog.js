'use strict';
/* ===== MOD EMPIRE v3.5 — данные и каталог ===== */
const VERSION='3.5',SAVE_KEY='mod_empire_v3',OLD_KEY='mod_empire_v1';
const $=id=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rand=()=>Math.random();
const pick=a=>a[Math.floor(rand()*a.length)];
const rnd=x=>{if(!(x>0))return 0;const f=Math.floor(x);return f+(rand()<x-f?1:0)};
const money=n=>{n=Math.round(n||0);return(n<0?'−':'')+'$'+Math.abs(n).toLocaleString('en-US')};
const num=n=>Math.floor(n||0).toLocaleString('ru-RU');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DIFS=['Лёгкая','Средняя','Сложная','Экспертная'];
const diffScore=d=>Math.max(0,DIFS.indexOf(d));

/* Онлайн-игры с античитом: моды могут привести к предупреждениям */
const RISKY=new Set(['Counter-Strike 2','Apex Legends','VALORANT','League of Legends','PUBG: Battlegrounds','Tom Clancy’s Rainbow Six Siege','Destiny 2','Fall Guys','Rocket League','Genshin Impact','Final Fantasy XIV','Battlefield 6','Squad','Hell Let Loose','Foxhole','Rust','DayZ','Payday 3','Counter-Strike 1.6','Diablo IV','Hearthstone','Overwatch 2','Marvel Rivals','Dota 2','Delta Force','Hunt: Showdown 1896','Gray Zone Warfare','FragPunk','The First Descendant','Throne and Liberty','New World: Aeternum','Warframe','War Thunder','World of Tanks','iRacing','Star Citizen','Call of Duty: Black Ops III','Battlefield 4','Titanfall 2','For Honor','Tekken 8','Street Fighter 6','Mortal Kombat 11','Guilty Gear Strive','Brawlhalla','MultiVersus','Helldivers 2','Dead by Daylight','Among Us','Once Human','Pax Dei','Palia','World of Warcraft','Elite Dangerous'].map(n=>n.replace(/'/g,'’')));
const games=GAMEDATA.map((g,i)=>({id:i+1,name:g[0],genre:g[1],emoji:g[2],dif:g[3],pop:g[4],aud:g[5],comp:g[6],desc:g[7],studio:g[8],g0:g[1].split(' / ')[0],risk:RISKY.has(g[0])}));
const gameByName=new Map(games.map(g=>[g.name,g]));
const gameOf=m=>gameByName.get(m.gameName)||gameByName.get(String(m.gameName||'').replace(/'/g,'’'))||games[0];

const features=[['items','Новые предметы',1.1],['characters','Персонажи / NPC',1.25],['quests','Квесты и события',1.4],['textures','HD-текстуры',1.2],['models','Новые модели',1.25],['animations','Анимации',1.35],['balance','Балансировка',1],['interface','Интерфейс',.9],['sound','Звуки и музыка',1.05],['world','Локации / карты',1.5],['automation','Автоматизация',1.35],['settings','Настройки',.85],['multiplayer','Мультиплеер',1.65],['compat','Совместимость',1.15],['localization','Переводы',.9],['performance','Оптимизация',1.25],['lore','Лор и истории',1.2],['survival','Системы выживания',1.25],['crafting','Крафт',1.15],['photo','Фото-режим / визуал',.9]];
const ALWAYS=new Set(['settings','compat','localization','performance','hard','access','devtools','modmenu']);
const featRel={items:/rpg|survival|sandbox|action|roguelike|shooter|adventure|crafting|simulation|fantasy/,characters:/rpg|adventure|narrative|life|fighting|hero|moba|party|social/,quests:/rpg|adventure|narrative|mystery|open world|detective/,textures:/open world|rpg|fps|shooter|racing|survival|simulation|horror|vr|action|adventure|sports|city|flight|space|driving|sandbox/,models:/open world|rpg|fps|shooter|racing|survival|simulation|horror|vr|action|adventure|sports|city|flight|space|driving|sandbox|fighting/,animations:/action|fighting|rpg|shooter|adventure|platformer|sports|horror|vr|beat/,balance:/strategy|roguelike|rpg|deckbuilder|tactics|4x|moba|fighting|shooter|management|colony|rts|tower|puzzle|card/,interface:/strategy|simulation|management|city|rpg|automation|colony|mmo|transport|tycoon|sandbox|builder|deckbuilder|grand/,sound:/rhythm|horror|adventure|rpg|narrative|music|arcade/,world:/open world|rpg|survival|sandbox|adventure|exploration|space|racing|city|shooter|action/,automation:/automation|simulation|colony|city|management|sandbox|strategy|survival|transport|factory|programming/,multiplayer:/multiplayer|co-op|mmo|shooter|survival|battle|party|moba|social|fighting|sandbox|platform/,lore:/rpg|narrative|adventure|fantasy|mystery|horror|sci-fi|strategy|grand|historical/,survival:/survival|rpg|horror|sandbox|roguelike|colony|crafting/,crafting:/survival|sandbox|rpg|crafting|automation|simulation|colony|adventure|farming|life/,photo:/open world|adventure|racing|simulation|life|sandbox|sports|exploration|rpg|action|cozy|vr|platform/};
const types=[['content','Новый контент',1.15],['visual','Графика и текстуры',1],['gameplay','Новые механики',1.35],['utility','Инструменты / UI',.9],['total','Полная переработка',2.5]];
const STYLES=['Vanilla+','Реализм','Фэнтези','Хардкор','Уютный','Киберпанк','Комедийный','Immersion','Quality of Life','Тотальная конверсия'];
const STYLE_INFO={'Универсал':'+1 к качеству любого мода.','Визуальный мастер':'+4 к качеству модов «Графика и текстуры».','Геймплейный инженер':'+4 к качеству модов «Новые механики».','Мастер оптимизации':'−5 к начальному числу багов во всех модах.','Лор и квесты':'+4 к качеству модов «Новый контент».','Утилиты и интерфейс':'+4 к качеству модов «Инструменты / UI».'};
const WORKSHOP=new Set(['Mount & Blade: Warband','Starbound','Hearts of Iron IV','Europa Universalis IV','Victoria 3','Crusader Kings II','Civilization V','Civilization IV','Tropico 6','Total War: Medieval II','Total War: Shogun 2','Total War: Three Kingdoms','Rome: Total War','Payday 2','Left 4 Dead','Black Mesa','Supreme Commander: Forged Alliance','Half-Life','Portal','Counter-Strike 1.6','Fallout 3','The Elder Scrolls III: Morrowind','The Sims 2','Worms Armageddon','RimWorld','Terraria','Cities: Skylines','Cities: Skylines II','Factorio','Left 4 Dead 2','Team Fortress 2','Portal 2','Half-Life 2','Civilization VI','Prison Architect','The Elder Scrolls V: Skyrim','Fallout 4','Garry’s Mod','Project Zomboid','Mount & Blade II: Bannerlord','Kerbal Space Program','Euro Truck Simulator 2','American Truck Simulator','Stellaris','Crusader Kings III','Age of Empires II: Definitive Edition','Don’t Starve Together','Oxygen Not Included','Euro Truck Simulator 2','Space Engineers','Barotrauma','Stormworks: Build and Rescue','Tabletop Simulator','Starsector','Dwarf Fortress']);
const platforms=[
{id:'nexus',name:'Nexus Mods',icon:'🟣',desc:'Крупное сообщество модификаций для множества игр.',reach:1.1,comp:1.12,fee:.08,games:'all',paid:false,unlock:0},
{id:'modrinth',name:'Modrinth',icon:'🟩',desc:'Особенно силён в модах Minecraft.',reach:1.03,comp:.95,fee:.04,games:['Minecraft'],paid:false,unlock:0},
{id:'curse',name:'CurseForge',icon:'🟠',desc:'Каталог модов и дополнений для поддерживаемых игр.',reach:1.05,comp:1.08,fee:.1,games:'all',paid:false,unlock:0},
{id:'workshop',name:'Steam Workshop',icon:'🔵',desc:'Встроенная публикация контента для поддерживаемых игр.',reach:1.16,comp:1.15,fee:0,games:WORKSHOP,paid:false,unlock:0},
{id:'banana',name:'GameBanana',icon:'🍌',desc:'Скины, модели, карты и пользовательские модификации.',reach:.86,comp:.83,fee:.02,games:'all',paid:false,unlock:0},
{id:'patreon',name:'Patreon',icon:'🟠',desc:'Поддержка автора и бонусные публикации.',reach:.48,comp:.55,fee:.12,games:'all',paid:true,unlock:3},
{id:'kofi',name:'Ko-fi',icon:'☕',desc:'Поддержка независимого автора.',reach:.38,comp:.4,fee:.05,games:'all',paid:true,unlock:2},
{id:'itch',name:'itch.io',icon:'🔴',desc:'Независимые цифровые проекты и авторские страницы.',reach:.58,comp:.62,fee:.1,games:'all',paid:true,unlock:2},
{id:'personal',name:'Личный сайт',icon:'🌐',desc:'Твоя собственная страница и прямые отношения с аудиторией.',reach:.35,comp:.15,fee:.04,games:'all',paid:true,unlock:1}];
const platById=id=>platforms.find(p=>p.id===id);
const platOK=(p,m)=>(m.rating==='mature'&&(p.id==='workshop'||p.id==='curse'))?false:p.games==='all'?true:p.games instanceof Set?p.games.has(m.gameName):p.games.includes(m.gameName);
const countries=[['Нидерланды','Nederlands'],['Россия','Русский'],['Украина','Українська'],['Германия','Deutsch'],['США','English'],['Великобритания','English'],['Польша','Polski'],['Франция','Français'],['Испания','Español'],['Италия','Italiano'],['Канада','English'],['Австралия','English'],['Япония','日本語'],['Южная Корея','한국어'],['Бразилия','Português'],['Швеция','Svenska'],['Финляндия','Suomi'],['Норвегия','Norsk'],['Чехия','Čeština'],['Другая страна','English']];
const LANGS=['English','Русский','Українська','Deutsch','Español','Français','Italiano','Polski','Português','日本語','한국어','中文','Nederlands','Svenska','Suomi','Norsk','Čeština'];
const nativeLang=()=>(countries.find(c=>c[0]===S.profile.country)||countries[0])[1];
const SKILLS={design:'Дизайн',coding:'Разработка',marketing:'Продвижение',testing:'Тестирование'};
const SKILL_FX={design:'Качество графических модов и модов с дизайном.',coding:'Скорость разработки и качество механик.',marketing:'Рост просмотров и эффективность продвижения.',testing:'Меньше багов и эффективнее тесты.'};

/* --- v3.5: расширение каталога функций, типов, стилей --- */
features.push(['weather','Погода и время суток',1.1],['economy','Экономика и торговля',1.3],['hard','Режимы сложности',.9],['companions','Спутники и напарники',1.3],['vehicles','Транспорт',1.4],['weapons','Оружие',1.2],['armor','Броня и одежда',1.1],['magic','Магия и способности',1.35],['building','Строительство',1.3],['farming','Фермерство',1.1],['cooking','Кулинария',1],['fishing','Рыбалка и охота',.9],['hud','HUD и миникарта',.85],['controller','Поддержка геймпада',.95],['access','Доступность',.9],['cutscenes','Кат-сцены',1.3],['voice','Озвучка',1.4],['devtools','Инструменты разработчика',1],['modmenu','Меню настроек в игре',.9],['saveedit','Редактор сохранений',.95],['events','Случайные события',1.15],['factions','Фракции и репутация',1.3],['ai','ИИ и поведение NPC',1.45],['proc','Процедурная генерация',1.5],['shaders','Шейдеры и освещение',1.25],['camera','Камера и ракурсы',.95],['creator','Редактор персонажа',1.15],['romance','Романы и отношения',1.2],['pets','Питомцы',1],['housing','Жильё и декор',1.1],['cosmetics','Косметика',.9],['cards','Карты и колоды',1.2],['research','Дерево исследований',1.2],['minigames','Мини-игры',1]);
Object.assign(featRel,{
weather:/open world|survival|racing|simulation|rpg|city|farming|flight|sandbox|adventure|sports|driving|colony|life/,
economy:/strategy|city|management|business|simulation|trading|tycoon|rpg|survival|colony|grand|space|transport|economy|sandbox|life/,
companions:/rpg|adventure|co-op|action|jrpg|survival|horror|story|narrative|life|fantasy|looter/,
vehicles:/open world|racing|survival|sandbox|military|space|simulation|driving|flight|shooter|action|transport|battle royale|vehicular|sports/,
weapons:/shooter|fps|rpg|action|survival|military|tactical|fighting|roguelike|battle|looter|horror|stealth|co-op/,
armor:/rpg|action|survival|fantasy|fighting|souls|roguelike|looter|sandbox|mmorpg|life|open world|metroidvania/,
magic:/rpg|fantasy|roguelike|jrpg|card|metroidvania|souls|mmorpg|moba|adventure|deckbuilder/,
building:/survival|sandbox|city|colony|simulation|strategy|automation|builder|farming|life|management|tycoon|open world|god game/,
farming:/farming|life|survival|sandbox|colony|simulation|city|cozy|management|rpg/,
cooking:/farming|life|survival|sandbox|simulation|colony|cozy|rpg|party|co-op|management/,
fishing:/farming|life|survival|sandbox|open world|adventure|rpg|simulation|cozy|sports/,
hud:/shooter|fps|rpg|racing|strategy|simulation|survival|action|open world|sports|flight|city|tactical|moba|platformer|mmorpg|colony/,
controller:/action|platformer|racing|adventure|rpg|fighting|shooter|sports|open world|rhythm|metroidvania|roguelike|party|beat/,
cutscenes:/rpg|adventure|narrative|story|action|jrpg|horror|open world|visual|mystery|cyberpunk|immersive|stealth/,
voice:/rpg|adventure|narrative|story|jrpg|horror|mystery|open world|point and click|life|immersive/,
saveedit:/rpg|survival|sandbox|simulation|strategy|city|colony|farming|life|roguelike|management|automation|open world|racing/,
events:/rpg|survival|sandbox|simulation|strategy|city|colony|management|life|roguelike|open world|grand|farming|adventure|business|tycoon/,
factions:/rpg|strategy|grand|4x|survival|open world|mmorpg|colony|military|sandbox|tactical|space|historical/,
ai:/rpg|strategy|simulation|survival|stealth|shooter|tactical|colony|open world|action|horror|sandbox|city|immersive|military|4x/,
proc:/roguelike|survival|sandbox|space|colony|exploration|city|metroidvania|dungeon|automation|4x|adventure|strategy/,
shaders:/open world|rpg|fps|shooter|racing|survival|horror|simulation|vr|action|adventure|sports|space|driving|flight|sandbox|stealth|looter|battle/,
camera:/action|rpg|racing|adventure|shooter|sports|simulation|open world|horror|stealth|platformer|fighting|driving|flight|survival/,
creator:/rpg|life|mmorpg|sandbox|simulation|sports|fighting|open world|action|survival|social|adventure|cozy/,
romance:/rpg|life|jrpg|narrative|story|adventure|farming|visual|social|cozy|fantasy/,
pets:/life|farming|rpg|survival|sandbox|simulation|monster|adventure|cozy|colony|park|zoo/,
housing:/life|farming|sandbox|survival|simulation|rpg|city|cozy|colony|mmorpg|building|management|tycoon/,
cosmetics:/rpg|action|shooter|racing|sports|fighting|moba|battle|mmorpg|life|survival|sandbox|looter|party|platform/,
cards:/card|deckbuilder|roguelike|strategy|board|rpg|tactical|party|puzzle/,
research:/strategy|4x|city|colony|automation|grand|simulation|management|survival|rpg|sandbox|tycoon|space/,
minigames:/rpg|adventure|life|party|farming|sandbox|simulation|puzzle|rhythm|cozy|arcade|social/});
types.push(['story','Сюжетное дополнение',1.6],['audio','Аудио и музыка',.95],['library','Библиотека / API для модов',1.1],['tweak','Мини-твик',.6]);
STYLES.push('Постапокалипсис','Стимпанк','Хоррор','Аниме','Ретро / пиксель','Минимализм','Нуар','Научная фантастика','Средневековье','Реализм+');
STYLE_INFO['Звуковой дизайнер']='+4 к качеству модов «Аудио и музыка».';
STYLE_INFO['Руководитель студии']='Команда получает на 10% меньше зарплат и лояльность растёт быстрее.';
Object.assign(SKILLS,{management:'Управление'});
Object.assign(SKILL_FX,{management:'Лояльность и эффективность команды, цена найма.'});

