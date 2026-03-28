// ============================================================
// Alien Cannon Defense — Complete Game
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ============================================================
// PLAY AREA — constrained width, centered
// ============================================================
const MAX_PLAY_W = 600;
let playX = 0, playW = 600, playH = 600;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  playW = Math.min(canvas.width, MAX_PLAY_W);
  playH = canvas.height;
  playX = (canvas.width - playW) / 2;
  cannon.x = playX + playW / 2;
  cannon.y = canvas.height - 30;
}
window.addEventListener('resize', resize);

// ============================================================
// LOCALIZATION
// ============================================================
const FONT_FAMILY = "'Courier New', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', monospace";

const LANG = {
  en: {
    title1: 'ALIEN CANNON', title2: 'DEFENSE', byline: 'by Richard',
    fullTitle: 'Alien Cannon Defense by Richard',
    start: 'Press to Start', levelComplete: 'Level {n} Complete!',
    nextLevel: 'Next: Level {n}', openChest: 'Press Anywhere to Open',
    chooseUpgrade: 'Choose an Upgrade', selectUpgrade: '[ Press to Select ]',
    gameOver: 'GAME OVER', score: 'Score', level: 'Level',
    restart: 'Press to Restart', boss: 'BOSS',
    fireRate: 'Fire Rate', firePower: 'Fire Power', freeze: 'Freeze', fire: 'Fire',
    plusHp: '+1 HP',
    fireAmount: 'Multi Shot', projectiles: 'Boomerang', bounceShot: 'Bounce Shot',
    fireRateDesc: '-0.08s delay', firePowerDesc: '+1 damage',
    freezeDesc: 'Slow aliens 50% for 2s', fireDesc: 'Burn 1 dmg over 3s', hpDesc: 'Restore 1 HP',
    fireAmountDesc: '+1 bullet per shot', projectilesDesc: 'Bullets fly out and boomerang back',
    bounceShotDesc: 'Bullets bounce off walls',
    frLabel: 'FR', fpLabel: 'FP', freezeLabel: 'FREEZE', fireLabel: 'FIRE',
    faLabel: 'MULTI', prLabel: 'BOOM', bsLabel: 'BOUNCE',
    langButton: '中文',
    chooseAbility: 'Choose an Ability',
    abilityOverkill: 'Overkill', abilityBombing: 'Bombing',
    abilityBull: 'Bull Rush', abilityFrozen: 'Deep Freeze',
    abilityOverkillDesc: 'Kills ALL aliens on screen (15s charge)',
    abilityBombingDesc: 'Bomb an area of aliens (15s charge)',
    abilityBullDesc: 'Charge in a line, kill all in path (20s charge)',
    abilityFrozenDesc: 'Freeze ALL enemies for 5s (10s charge)',
    abilityReady: 'READY! Press [Space] or tap here',
    abilityCharging: 'Charging',
    paused: 'PAUSED', resume: 'Resume', quit: 'Quit', restartBtn: 'Restart',
    chooseMap: 'Choose a Map',
    mapPlains: 'Plains', mapPlainsDesc: 'Open green field',
    mapSwirl: 'Swirl', mapSwirlDesc: 'Aliens spiral inward',
    mapCastle: 'Castle', mapCastleDesc: 'Defend the narrow corridor',
    howToPlay: 'How to Play', back: 'Press to Go Back',
    helpControls: 'CONTROLS',
    helpShoot: 'Click/Tap to aim and shoot',
    helpAutoFire: 'Hold for 0.3s to auto-fire',
    helpMove: 'Arrow Keys or A/D to move cannon',
    helpPause: 'Press Escape or tap II to pause',
    helpCombat: 'COMBAT',
    helpAliens: 'Shoot aliens before they reach the bottom',
    helpAlienDmg: 'Each alien that passes costs 1 HP',
    helpBoss: 'BOSS FIGHTS (every 5 levels)',
    helpBossShoot: 'Shoot boss projectiles to destroy them (3 hits)',
    helpBossTelegraph: 'Watch for the red line - a shot is coming!',
    helpBossDodge: 'Move your cannon to dodge boss attacks',
    helpSurvival: 'HEALTH & SURVIVAL',
    helpHP: 'You start with 3 HP (max 5)',
    helpHPBoss: 'You recover +1 HP before each boss fight',
    helpHPChest: 'Chests can give +1 HP when upgrades are maxed',
    helpUpgrades: 'UPGRADES (from treasure chests)',
    helpFireRate: 'Fire Rate - shoot faster (stacks 5x)',
    helpFirePower: 'Fire Power - more damage per bullet (stacks 5x)',
    helpMultiShot: 'Multi Shot - extra bullets per shot (stacks 3x)',
    helpBigBullets: 'Boomerang - bullets return, pierce on return (3x)',
    helpBounce: 'Bounce Shot - bullets bounce off walls',
    helpFreeze: 'Freeze - slow aliens by 50% for 2s',
    helpFire: 'Fire - burn aliens for extra damage over 3s',
    helpExclusive: 'Freeze and Fire are exclusive - pick one!',
    helpAbilities: 'ABILITIES (unlocked at Level 10 boss)',
    helpAbility1: 'Overkill - kills all aliens instantly (15s)',
    helpAbility2: 'Bombing - bombs an area of aliens (15s)',
    helpAbility3: 'Bull Rush - line kills all in path (20s)',
    helpAbility4: 'Deep Freeze - freeze all enemies 5s (10s)',
    helpAbilityUse: 'Press Space or tap ability icon to activate',
    helpMaps: 'MAPS',
    helpMap1: 'Plains - classic open battlefield',
    helpMap2: 'Swirl - aliens spiral toward the center',
    helpMap3: 'Castle - narrow corridor defense',
    helpTips: 'TIPS',
    helpTip1: 'Shoot boss projectiles before the boss itself',
    helpTip2: 'Fire Rate + Multi Shot = bullet storm',
    helpTip3: 'Move your cannon to avoid boss shots',
    helpTip4: 'Save your ability for tough waves or bosses',
    helpTip5: 'Boomerang pierces on return - aim through groups',
    scrollHint: 'Scroll for more',
  },
  zh: {
    title1: '外星人大炮', title2: '防御战', byline: '作者：Richard',
    fullTitle: '外星人大炮防御战 by Richard',
    start: '按下开始', levelComplete: '第 {n} 关完成！',
    nextLevel: '下一关：第 {n} 关', openChest: '按下任意位置打开',
    chooseUpgrade: '选择升级', selectUpgrade: '[ 按下选择 ]',
    gameOver: '游戏结束', score: '分数', level: '关卡',
    restart: '按下重新开始', boss: 'BOSS',
    fireRate: '射速', firePower: '火力', freeze: '冰冻', fire: '燃烧',
    plusHp: '+1 生命',
    fireAmount: '多重射击', projectiles: '回旋弹', bounceShot: '反弹射击',
    fireRateDesc: '射击间隔 -0.08秒', firePowerDesc: '伤害 +1',
    freezeDesc: '减速外星人50% 持续2秒', fireDesc: '灼烧 1点伤害 持续3秒', hpDesc: '恢复 1 生命值',
    fireAmountDesc: '每次射击+1子弹', projectilesDesc: '子弹飞出后回旋返回',
    bounceShotDesc: '子弹可反弹墙壁',
    frLabel: '射速', fpLabel: '火力', freezeLabel: '冰冻', fireLabel: '燃烧',
    faLabel: '多重', prLabel: '回旋', bsLabel: '反弹',
    langButton: 'EN',
    chooseAbility: '选择技能',
    abilityOverkill: '全灭', abilityBombing: '轰炸',
    abilityBull: '冲锋', abilityFrozen: '极寒',
    abilityOverkillDesc: '消灭屏幕上所有外星人（15秒充能）',
    abilityBombingDesc: '轰炸一片区域的外星人（15秒充能）',
    abilityBullDesc: '直线冲锋消灭路径上所有敌人（20秒充能）',
    abilityFrozenDesc: '冻结所有敌人5秒（10秒充能）',
    abilityReady: '就绪！按空格键或点击此处',
    abilityCharging: '充能中',
    paused: '已暂停', resume: '继续', quit: '退出', restartBtn: '重新开始',
    chooseMap: '选择地图',
    mapPlains: '平原', mapPlainsDesc: '开阔的绿色战场',
    mapSwirl: '漩涡', mapSwirlDesc: '外星人螺旋进入',
    mapCastle: '城堡', mapCastleDesc: '守卫狭窄走廊',
    howToPlay: '游戏帮助', back: '按下返回',
    helpControls: '操作说明',
    helpShoot: '点击/触摸瞄准并射击', helpAutoFire: '长按0.3秒自动射击',
    helpMove: '方向键或A/D移动大炮', helpPause: '按Esc或点击II暂停',
    helpCombat: '战斗',
    helpAliens: '在外星人到达底部之前消灭它们', helpAlienDmg: '每个通过的外星人扣1点生命',
    helpBoss: 'BOSS战（每5关一次）',
    helpBossShoot: '射击Boss弹幕来摧毁它们（3次命中）',
    helpBossTelegraph: '注意红线警告——攻击即将到来！',
    helpBossDodge: '移动大炮来躲避Boss攻击',
    helpSurvival: '生命与生存',
    helpHP: '初始3点生命（最多5点）', helpHPBoss: '每次Boss战前恢复+1生命',
    helpHPChest: '升级满后宝箱给+1生命',
    helpUpgrades: '升级（来自宝箱）',
    helpFireRate: '射速——射击更快（可叠加5次）',
    helpFirePower: '火力——伤害更高（可叠加5次）',
    helpMultiShot: '多重射击——多发子弹（可叠加3次）',
    helpBigBullets: '回旋弹——返回时穿透敌人（可叠加3次）',
    helpBounce: '反弹射击——子弹可反弹墙壁',
    helpFreeze: '冰冻——减速50%持续2秒',
    helpFire: '燃烧——灼烧伤害持续3秒',
    helpExclusive: '冰冻和燃烧只能选一个！',
    helpAbilities: '技能（第10关Boss后解锁）',
    helpAbility1: '全灭——消灭所有外星人（15秒）',
    helpAbility2: '轰炸——轰炸一片区域（15秒）',
    helpAbility3: '冲锋——直线消灭敌人（20秒）',
    helpAbility4: '极寒——冻结所有敌人5秒（10秒）',
    helpAbilityUse: '按空格键或点击技能图标激活',
    helpMaps: '地图',
    helpMap1: '平原——经典开阔战场',
    helpMap2: '漩涡——外星人螺旋进入',
    helpMap3: '城堡——狭窄走廊防御',
    helpTips: '小贴士',
    helpTip1: '优先射击Boss弹幕',
    helpTip2: '射速+多重=子弹风暴',
    helpTip3: '移动大炮躲避Boss攻击',
    helpTip4: '困难时使用技能',
    helpTip5: '回旋弹返回时穿透——瞄准敌群',
    scrollHint: '滚动查看更多',
  },
};

let currentLang = 'en';
function t(key) { const s = LANG[currentLang][key]; return s !== undefined ? s : LANG.en[key] || key; }
function tFormat(key, vals) { let s = t(key); for (const [k,v] of Object.entries(vals)) s = s.replace(`{${k}}`, v); return s; }
function makeFont(sz, w) { return (w ? w+' ' : '') + sz + 'px ' + FONT_FAMILY; }
function fitText(txt, maxW, baseSz, fw) {
  let sz = baseSz; ctx.font = makeFont(sz, fw);
  while (ctx.measureText(txt).width > maxW && sz > 8) { sz--; ctx.font = makeFont(sz, fw); }
  return sz;
}

const LANG_BTN_W = 70, LANG_BTN_H = 35, LANG_BTN_Y = 15;
function getLangBtnX() { return canvas.width - 85; }

// --- Constants ---
const ALIEN_TYPES = {
  SCOUT:   { color: '#33cc33', baseHp: 1, baseSpeed: 2.5, points: 10,  radius: 22, minLevel: 1 },
  SOLDIER: { color: '#cccc00', baseHp: 2, baseSpeed: 1.8, points: 25,  radius: 26, minLevel: 2 },
  TANK:    { color: '#cc3333', baseHp: 4, baseSpeed: 1.0, points: 50,  radius: 30, minLevel: 4 },
  ELITE:   { color: '#9933cc', baseHp: 6, baseSpeed: 1.8, points: 75,  radius: 28, minLevel: 7 },
  SWARM:   { color: '#00cccc', baseHp: 1, baseSpeed: 3.5, points: 15,  radius: 18, minLevel: 5 },
};

const STATES = { TITLE:0, PLAYING:1, BETWEEN_LEVELS:2, CHEST:3, UPGRADE:4, GAME_OVER:5, HELP:6, ABILITY_SELECT:7, PAUSED:8, MAP_SELECT:9 };
const BULLET_SPEED = 8, BULLET_RADIUS = 7;
const BOSS_PROJ_RADIUS = 8, BOSS_PROJ_SPEED = 2.5, BOSS_PROJ_HP = 3;
const BOSS_ATTACK_INTERVAL = 2.5, BOSS_TELEGRAPH_DURATION = 0.6;
const CANNON_HITBOX_W = 60, CANNON_HITBOX_H = 40;

const ABILITY_DEFS = {
  overkill: { chargeTime: 15, color: '#ff0000' },
  bombing:  { chargeTime: 15, color: '#ff8800' },
  bull:     { chargeTime: 20, color: '#00ff88' },
  frozen:   { chargeTime: 10, color: '#00ccff' },
};

// --- Game State ---
let state = STATES.TITLE;
let level = 1, nonBossClearCount = 0, lastTime = 0;
let currentMap = 'plains'; // 'plains', 'swirl', 'castle'
const cannon = { x: 0, y: 0, angle: 0 };
const player = {
  hp: 3, maxHp: 5, score: 0, fireRate: 0.5, damage: 1, fireTimer: 0, element: null,
  upgrades: { fireRate:0, firePower:0, freeze:0, fire:0, fireAmount:0, projectiles:0, bounceShot:0 },
  ability: null, abilityCharge: 0, abilityReady: false,
};

let bullets=[], aliens=[], particles=[], spawnQueue=[], spawnTimer=0, aliensRemaining=0;
let boss=null, bossProjectiles=[];
let betweenTimer=0;
let pointerX=0, pointerY=0, pointerDown=false, pointerDownTime=0, firedInitialShot=false;
const keys = {};
let damageFlashTimer=0, chestPending=false, upgradeOptions=[];
let abilityPending=false, bombTargetMode=false;
let bullRushActive=false, bullRushX=0, bullRushY=0, bullRushAngle=0, bullRushTimer=0;
let helpScrollY = 0; // for scrollable help
let prevStateBeforeHelp = STATES.TITLE; // to return to correct state from help

// ============================================================
// AUDIO
// ============================================================
let audioCtx=null, musicPlaying=false, musicGain=null, sfxGain=null, musicTimeout=null;

function ensureAudioCtx() {
  if(!audioCtx){ audioCtx=new(window.AudioContext||window.webkitAudioContext)(); sfxGain=audioCtx.createGain(); sfxGain.gain.value=0.25; sfxGain.connect(audioCtx.destination); }
  if(audioCtx.state==='suspended') audioCtx.resume();
}

function startMusic() {
  ensureAudioCtx(); if(musicPlaying)return;
  musicGain=audioCtx.createGain(); musicGain.gain.value=0.18; musicGain.connect(audioCtx.destination);
  musicPlaying=true; playMusicLoop();
}

function playMusicLoop() {
  if(!musicPlaying)return;
  const now=audioCtx.currentTime;
  const bass=[55,55,65.41,55,73.42,65.41,55,55], bl=0.5;
  for(let i=0;i<bass.length;i++){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.value=bass[i];g.gain.setValueAtTime(0.3,now+i*bl);g.gain.exponentialRampToValueAtTime(0.01,now+i*bl+bl*0.9);o.connect(g);g.connect(musicGain);o.start(now+i*bl);o.stop(now+i*bl+bl);}
  for(let i=0;i<8;i++){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(150,now+i*bl);o.frequency.exponentialRampToValueAtTime(30,now+i*bl+0.1);g.gain.setValueAtTime(0.4,now+i*bl);g.gain.exponentialRampToValueAtTime(0.01,now+i*bl+0.15);o.connect(g);g.connect(musicGain);o.start(now+i*bl);o.stop(now+i*bl+0.2);}
  for(let i=0;i<16;i++){const bs2=audioCtx.sampleRate*0.05,buf=audioCtx.createBuffer(1,bs2,audioCtx.sampleRate),d=buf.getChannelData(0);for(let j=0;j<bs2;j++)d[j]=(Math.random()*2-1)*0.3;const n=audioCtx.createBufferSource();n.buffer=buf;const g=audioCtx.createGain(),ht=now+i*bl*0.5;g.gain.setValueAtTime(i%2===0?0.08:0.04,ht);g.gain.exponentialRampToValueAtTime(0.001,ht+0.04);const hp=audioCtx.createBiquadFilter();hp.type='highpass';hp.frequency.value=8000;n.connect(hp);hp.connect(g);g.connect(musicGain);n.start(ht);n.stop(ht+0.05);}
  const mel=[220,261.63,329.63,392,329.63,261.63,349.23,293.66];
  for(let i=0;i<mel.length;i++){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=mel[i];const ti=now+i*bl;g.gain.setValueAtTime(0,ti);g.gain.linearRampToValueAtTime(0.15,ti+0.05);g.gain.exponentialRampToValueAtTime(0.01,ti+bl*0.8);o.connect(g);g.connect(musicGain);o.start(ti);o.stop(ti+bl);}
  const pad=[130.81,164.81,196];for(const f of pad){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.04,now);g.gain.setValueAtTime(0.04,now+bass.length*bl-0.1);g.gain.linearRampToValueAtTime(0,now+bass.length*bl);o.connect(g);g.connect(musicGain);o.start(now);o.stop(now+bass.length*bl);}
  musicTimeout=setTimeout(()=>playMusicLoop(),bass.length*bl*1000-50);
}

function stopMusic() {
  musicPlaying=false;
  if(musicTimeout){clearTimeout(musicTimeout);musicTimeout=null;}
  if(musicGain){musicGain.gain.cancelScheduledValues(audioCtx.currentTime);musicGain.gain.setValueAtTime(musicGain.gain.value,audioCtx.currentTime);musicGain.gain.linearRampToValueAtTime(0,audioCtx.currentTime+0.2);const og=musicGain;setTimeout(()=>{try{og.disconnect();}catch(e){}},300);musicGain=null;}
}

function playShotSound() {
  if(!audioCtx)return;const now=audioCtx.currentTime;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(60,now+0.08);g.gain.setValueAtTime(0.2,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.1);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+0.12);
  const bs2=audioCtx.sampleRate*0.04,buf=audioCtx.createBuffer(1,bs2,audioCtx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<bs2;i++)d[i]=(Math.random()*2-1);const n=audioCtx.createBufferSource();n.buffer=buf;const ng=audioCtx.createGain();ng.gain.setValueAtTime(0.12,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.05);const bp=audioCtx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=2;n.connect(bp);bp.connect(ng);ng.connect(sfxGain);n.start(now);n.stop(now+0.05);
}

// --- Init ---
resize();

// ============================================================
// INPUT
// ============================================================
function updatePointer(x, y) {
  pointerX=x; pointerY=y;
  const dx=pointerX-cannon.x, dy=cannon.y-pointerY;
  cannon.angle=Math.atan2(dx,dy);
  const ma=Math.PI/2-0.05; cannon.angle=Math.max(-ma,Math.min(ma,cannon.angle));
}

canvas.addEventListener('mousemove', e => updatePointer(e.clientX, e.clientY));
canvas.addEventListener('touchmove', e => { e.preventDefault(); updatePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
canvas.addEventListener('touchstart', e => {
  e.preventDefault(); const cx=e.touches[0].clientX, cy=e.touches[0].clientY;
  updatePointer(cx, cy); const prev=state; handleClick(cx, cy);
  if(prev===STATES.PLAYING){pointerDown=true;pointerDownTime=performance.now();firedInitialShot=false;}
}, { passive: false });
canvas.addEventListener('mousedown', e => {
  updatePointer(e.clientX, e.clientY); const prev=state; handleClick(e.clientX, e.clientY);
  if(prev===STATES.PLAYING){pointerDown=true;pointerDownTime=performance.now();firedInitialShot=false;}
});
canvas.addEventListener('mouseup', () => { pointerDown=false; });
canvas.addEventListener('touchend', e => { e.preventDefault(); pointerDown=false; }, { passive: false });

// Scroll for help page
canvas.addEventListener('wheel', e => { if(state===STATES.HELP){ helpScrollY-=e.deltaY; e.preventDefault(); } }, { passive: false });
let helpTouchY = 0;
canvas.addEventListener('touchstart', e => { if(state===STATES.HELP) helpTouchY=e.touches[0].clientY; }, { passive: true });
canvas.addEventListener('touchmove', e => { if(state===STATES.HELP){ helpScrollY+=e.touches[0].clientY-helpTouchY; helpTouchY=e.touches[0].clientY; } }, { passive: true });

window.addEventListener('keydown', e => {
  keys[e.key]=true;
  if(e.key===' '&&state===STATES.PLAYING){e.preventDefault();activateAbility();}
  if(e.key==='Escape'){
    if(state===STATES.PLAYING){state=STATES.PAUSED;pointerDown=false;}
    else if(state===STATES.PAUSED) state=STATES.PLAYING;
    else if(state===STATES.HELP){state=prevStateBeforeHelp;}
  }
});
window.addEventListener('keyup', e => { keys[e.key]=false; });

function handleClick(cx, cy) {
  if(state===STATES.HELP){ state=prevStateBeforeHelp; helpScrollY=0; return; }
  if(state===STATES.TITLE){
    const lx=getLangBtnX();
    if(cx>=lx&&cx<=lx+LANG_BTN_W&&cy>=LANG_BTN_Y&&cy<=LANG_BTN_Y+LANG_BTN_H){currentLang=currentLang==='en'?'zh':'en';return;}
    if(cx>=5&&cx<=55&&cy>=5&&cy<=55){prevStateBeforeHelp=STATES.TITLE;state=STATES.HELP;helpScrollY=0;return;}
    state=STATES.MAP_SELECT; return;
  }
  if(state===STATES.MAP_SELECT){
    const maps=['plains','swirl','castle'];
    const bW=180,bH=140,gap=20;
    const tw=maps.length*bW+(maps.length-1)*gap;
    const sx=canvas.width/2-tw/2, bY=canvas.height/2-bH/2+20;
    for(let i=0;i<maps.length;i++){
      const bx=sx+i*(bW+gap);
      if(cx>=bx&&cx<=bx+bW&&cy>=bY&&cy<=bY+bH){
        currentMap=maps[i]; resetGame(); state=STATES.PLAYING; startLevel(); startMusic(); return;
      }
    }
    return;
  }
  if(state===STATES.PAUSED){
    const cx2=canvas.width/2, bw=200, bh=45, gap=15;
    const btns=[{label:'resume',y:canvas.height/2-30},{label:'restartBtn',y:canvas.height/2+30},{label:'quit',y:canvas.height/2+90}];
    for(const btn of btns){
      if(cx>=cx2-bw/2&&cx<=cx2+bw/2&&cy>=btn.y-bh/2&&cy<=btn.y+bh/2){
        if(btn.label==='resume') state=STATES.PLAYING;
        else if(btn.label==='restartBtn'){stopMusic();resetGame();state=STATES.PLAYING;startLevel();startMusic();}
        else if(btn.label==='quit'){stopMusic();resetGame();state=STATES.TITLE;}
        return;
      }
    }
    return;
  }
  if(state===STATES.GAME_OVER){resetGame();state=STATES.MAP_SELECT;return;}
  if(state===STATES.CHEST){openChest();return;}
  if(state===STATES.ABILITY_SELECT){
    const opts=['overkill','bombing','bull','frozen'];
    const bW=200,bH=120,gap=15,tw=opts.length*bW+(opts.length-1)*gap;
    const sx=canvas.width/2-tw/2, bY=canvas.height/2-bH/2+20;
    for(let i=0;i<opts.length;i++){
      const bx=sx+i*(bW+gap);
      if(cx>=bx&&cx<=bx+bW&&cy>=bY&&cy<=bY+bH){
        player.ability=opts[i];player.abilityCharge=ABILITY_DEFS[opts[i]].chargeTime;player.abilityReady=true;
        state=STATES.PLAYING;startLevel();return;
      }
    }
    return;
  }
  if(state===STATES.UPGRADE){
    const bW=260,bH=120,gap=30,tw=upgradeOptions.length*bW+(upgradeOptions.length-1)*gap;
    const sx=canvas.width/2-tw/2, bY=canvas.height/2-bH/2+20;
    for(let i=0;i<upgradeOptions.length;i++){
      const bx=sx+i*(bW+gap);
      if(cx>=bx&&cx<=bx+bW&&cy>=bY&&cy<=bY+bH){applyUpgrade(upgradeOptions[i]);startLevel();state=STATES.PLAYING;return;}
    }
    return;
  }
  if(state===STATES.PLAYING){
    // Pause button (top-right)
    if(cx>=canvas.width-50&&cx<=canvas.width-10&&cy>=10&&cy<=45){state=STATES.PAUSED;pointerDown=false;return;}
    // Help ?
    if(cx>=5&&cx<=55&&cy>=55&&cy<=105){prevStateBeforeHelp=STATES.PLAYING;state=STATES.HELP;helpScrollY=0;return;}
    if(bombTargetMode){executeBombing(cx,cy);bombTargetMode=false;return;}
    if(player.ability&&player.abilityReady){
      const abX=canvas.width/2-50,abY=canvas.height-55;
      if(cx>=abX&&cx<=abX+100&&cy>=abY&&cy<=abY+30){activateAbility();return;}
    }
  }
}

// ============================================================
// ABILITIES
// ============================================================
function activateAbility(){
  if(!player.ability||!player.abilityReady)return;
  const ab=player.ability; player.abilityReady=false; player.abilityCharge=0;
  if(ab==='overkill'){for(const a of aliens)if(a.alive)killAlien(a);}
  else if(ab==='bombing'){bombTargetMode=true;return;}
  else if(ab==='bull'){
    const sin=Math.sin(cannon.angle),cos=Math.cos(cannon.angle);
    for(const a of aliens){if(!a.alive)continue;const dx=a.x-cannon.x,dy=a.y-cannon.y;if(Math.abs(dx*cos+dy*sin)<a.radius+25)killAlien(a);}
    if(boss&&boss.alive){const dx=boss.x-cannon.x,dy=boss.y-cannon.y;if(Math.abs(dx*cos+dy*sin)<boss.radius+25)damageBoss(boss.maxHp*0.3);}
    bullRushActive=true;bullRushX=cannon.x;bullRushY=cannon.y;bullRushAngle=cannon.angle;bullRushTimer=0.4;
    spawnParticles(cannon.x,cannon.y-20,'#00ff88',12,0.4);
  } else if(ab==='frozen'){
    for(const a of aliens)if(a.alive)a.freezeTimer=5.0;
    if(boss&&boss.alive)boss.freezeTimer=5.0;
    spawnParticles(canvas.width/2,canvas.height/2,'#00ccff',20,0.5);
  }
}
function executeBombing(tx,ty){
  const r=120;
  for(const a of aliens){if(!a.alive)continue;const dx=a.x-tx,dy=a.y-ty;if(dx*dx+dy*dy<r*r)killAlien(a);}
  if(boss&&boss.alive){const dx=boss.x-tx,dy=boss.y-ty;if(dx*dx+dy*dy<(r+boss.radius)*(r+boss.radius))damageBoss(boss.maxHp*0.2);}
  spawnParticles(tx,ty,'#ff8800',20,0.5);spawnParticles(tx,ty,'#ffcc00',15,0.4);
}

// ============================================================
// GAME RESET & LEVEL SETUP
// ============================================================
function resetGame(){
  level=1;nonBossClearCount=0;
  player.hp=3;player.maxHp=5;player.score=0;player.fireRate=0.5;player.damage=1;player.fireTimer=0;player.element=null;
  player.upgrades={fireRate:0,firePower:0,freeze:0,fire:0,fireAmount:0,projectiles:0,bounceShot:0};
  player.ability=null;player.abilityCharge=0;player.abilityReady=false;
  bullets=[];aliens=[];particles=[];spawnQueue=[];spawnTimer=0;aliensRemaining=0;
  boss=null;bossProjectiles=[];betweenTimer=0;damageFlashTimer=0;
  chestPending=false;upgradeOptions=[];abilityPending=false;bombTargetMode=false;bullRushActive=false;
}

function isBossLevel(lvl){return lvl%5===0;}

function startLevel(){
  bullets=[];spawnQueue=[];spawnTimer=0;boss=null;bossProjectiles=[];bombTargetMode=false;
  if(isBossLevel(level)){
    const bn=level/5;
    boss={x:playX+playW/2,y:80,hp:20+bn*15,maxHp:20+bn*15,points:200+bn*100,radius:45,speed:1.5,direction:1,
      attackTimer:0,telegraphTimer:0,telegraphing:false,alive:true,freezeTimer:0,burnTimer:0,burnDamageLeft:0,color:'#ff3366'};
    aliensRemaining=1;
  } else generateWave(level);
}

function generateWave(lvl){
  const ts=Math.floor(5+(lvl-1)*1.4),hpB=Math.floor(lvl/5),spB=Math.floor(lvl/3)*0.1;
  const el=Object.entries(ALIEN_TYPES).filter(([,c])=>c.minLevel<=lvl);
  let su=0;const wave=[];
  while(su<ts&&el.length>0){
    const w=el.map(([n])=>{if(n==='SCOUT')return Math.max(1,6-lvl*0.3);if(n==='SOLDIER')return Math.max(1,5-lvl*0.2);if(n==='TANK')return Math.min(5,1+lvl*0.3);if(n==='ELITE')return Math.min(4,0.5+lvl*0.25);if(n==='SWARM')return Math.min(4,1+lvl*0.2);return 1;});
    const tw2=w.reduce((a,b)=>a+b,0);let r=Math.random()*tw2,pk=el[0];
    for(let i=0;i<el.length;i++){r-=w[i];if(r<=0){pk=el[i];break;}}
    const[tn,cfg]=pk;
    if(tn==='SWARM'){const bs=Math.min(5,ts-su);for(let i=0;i<bs;i++)wave.push({typeName:tn,cfg,burst:true});su+=bs;}
    else{wave.push({typeName:tn,cfg,burst:false});su++;}
  }
  let time=0;
  for(let i=0;i<wave.length;i++){
    spawnQueue.push({...wave[i],spawnTime:time,hpBonus:hpB,speedBonus:spB});
    const last=wave[i].burst&&(i+1>=wave.length||!wave[i+1].burst);
    if(last||!wave[i].burst)time+=0.8;
  }
  aliensRemaining=wave.length;spawnTimer=0;
}

function spawnAlien(entry){
  const hp=entry.cfg.baseHp+entry.hpBonus,speed=entry.cfg.baseSpeed+entry.speedBonus;
  const r=entry.cfg.radius;
  let x, swirlAngle=0;
  if(currentMap==='castle'){
    // Narrow corridor: spawn in center 60% of play area
    const cw=playW*0.3;
    x=playX+playW/2-cw+Math.random()*cw*2;
  } else {
    x=playX+r+Math.random()*(playW-r*2);
  }
  const a={type:entry.typeName,x,y:-r,hp,maxHp:hp,speed,baseSpeed:speed,
    points:entry.cfg.points,radius:r,color:entry.cfg.color,alive:true,
    freezeTimer:0,burnTimer:0,burnDamageLeft:0,swirlAngle:Math.random()*Math.PI*2,swirlDist:0};
  if(currentMap==='swirl'){
    // Start from edge, spiral inward
    const angle=Math.random()*Math.PI*2;
    const dist=Math.max(playW,playH)*0.6;
    a.x=playX+playW/2+Math.cos(angle)*dist;
    a.y=canvas.height/2+Math.sin(angle)*dist;
    a.swirlAngle=angle;
    a.swirlDist=dist;
  }
  aliens.push(a);
}

// ============================================================
// SHOOTING
// ============================================================
function fireBullet(){
  playShotSound();
  const tipX=cannon.x+Math.sin(cannon.angle)*35,tipY=cannon.y-Math.cos(cannon.angle)*35;
  let color='#ffdd00';if(player.element==='freeze')color='#00ccff';else if(player.element==='fire')color='#ff6600';
  const bc=1+player.upgrades.fireAmount,isBoom=player.upgrades.projectiles>0&&!boss;
  const szB=isBoom?player.upgrades.projectiles*3:0,canB=player.upgrades.bounceShot>0;
  for(let i=0;i<bc;i++){
    let angle=cannon.angle;if(bc>1)angle+=(i-(bc-1)/2)*0.15;
    bullets.push({x:tipX,y:tipY,vx:Math.sin(angle)*BULLET_SPEED,vy:-Math.cos(angle)*BULLET_SPEED,
      radius:BULLET_RADIUS+szB,alive:true,color,bounces:canB?2:0,
      boomerang:isBoom,boomerangTimer:0,returning:false});
  }
}

// ============================================================
// COLLISION
// ============================================================
function distSq(x1,y1,x2,y2){const dx=x1-x2,dy=y1-y2;return dx*dx+dy*dy;}
function circleCircle(x1,y1,r1,x2,y2,r2){return distSq(x1,y1,x2,y2)<(r1+r2)*(r1+r2);}
function circleRect(cx2,cy2,cr,rx,ry,rw,rh){const clx=Math.max(rx,Math.min(cx2,rx+rw)),cly=Math.max(ry,Math.min(cy2,ry+rh));return distSq(cx2,cy2,clx,cly)<cr*cr;}

function collisionPass(){
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];if(!b.alive)continue;
    const pierce=b.boomerang&&b.returning;
    for(let j=aliens.length-1;j>=0;j--){const a=aliens[j];if(!a.alive)continue;if(circleCircle(b.x,b.y,b.radius,a.x,a.y,a.radius)){if(!pierce)b.alive=false;damageAlien(a,player.damage);if(!pierce)break;}}
    if(!b.alive)continue;
    if(boss&&boss.alive&&circleCircle(b.x,b.y,b.radius,boss.x,boss.y,boss.radius)){if(!pierce)b.alive=false;damageBoss(player.damage);if(!pierce)continue;}
    for(let j=bossProjectiles.length-1;j>=0;j--){const bp=bossProjectiles[j];if(!bp.alive)continue;if(circleCircle(b.x,b.y,b.radius,bp.x,bp.y,bp.radius)){if(!pierce)b.alive=false;bp.hp-=player.damage;if(bp.hp<=0){bp.alive=false;spawnParticles(bp.x,bp.y,'#ff4444',4,0.2);}if(!pierce)break;}}
  }
  for(let i=bossProjectiles.length-1;i>=0;i--){const bp=bossProjectiles[i];if(!bp.alive)continue;if(circleRect(bp.x,bp.y,bp.radius,cannon.x-CANNON_HITBOX_W/2,cannon.y-CANNON_HITBOX_H/2,CANNON_HITBOX_W,CANNON_HITBOX_H)){bp.alive=false;playerTakeDamage(1);}}
}

function damageAlien(a,dmg){a.hp-=dmg;applyStatusEffect(a);if(a.hp<=0)killAlien(a);}
function killAlien(a){a.alive=false;player.score+=a.points;aliensRemaining--;spawnParticles(a.x,a.y,a.color,7,0.3);}
function damageBoss(dmg){boss.hp-=dmg;applyStatusEffect(boss);if(boss.hp<=0)bossDeath();}
function bossDeath(){boss.alive=false;bossProjectiles=[];player.score+=boss.points;aliensRemaining=0;spawnParticles(boss.x,boss.y,boss.color,18,0.6);}
function applyStatusEffect(tgt){if(player.element==='freeze')tgt.freezeTimer=2.0;else if(player.element==='fire'){tgt.burnTimer=3.0;tgt.burnDamageLeft=1.0;}}
function playerTakeDamage(amt){player.hp-=amt;damageFlashTimer=0.15;if(player.hp<=0){player.hp=0;state=STATES.GAME_OVER;stopMusic();}}

// ============================================================
// UPDATE
// ============================================================
function update(dt){
  if(state!==STATES.PLAYING)return;
  const CS=5;
  if(keys['ArrowLeft']||keys['a']||keys['A'])cannon.x-=CS*dt*60;
  if(keys['ArrowRight']||keys['d']||keys['D'])cannon.x+=CS*dt*60;
  cannon.x=Math.max(playX+CANNON_HITBOX_W/2,Math.min(playX+playW-CANNON_HITBOX_W/2,cannon.x));

  if(player.ability&&!player.abilityReady){player.abilityCharge+=dt;if(player.abilityCharge>=ABILITY_DEFS[player.ability].chargeTime){player.abilityReady=true;player.abilityCharge=ABILITY_DEFS[player.ability].chargeTime;}}
  if(bullRushActive){bullRushTimer-=dt;if(bullRushTimer<=0)bullRushActive=false;}

  player.fireTimer-=dt;
  if(pointerDown&&!bombTargetMode){
    const ht=(performance.now()-pointerDownTime)/1000;
    if(!firedInitialShot){if(player.fireTimer<=0){fireBullet();player.fireTimer=player.fireRate;}firedInitialShot=true;}
    else if(ht>=0.3&&player.fireTimer<=0){fireBullet();player.fireTimer=player.fireRate;}
  }

  // Bullets
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];
    if(b.boomerang){b.boomerangTimer+=dt;const ft=0.4+player.upgrades.projectiles*0.15;if(!b.returning&&b.boomerangTimer>=ft)b.returning=true;
      if(b.returning){const dx=cannon.x-b.x,dy=cannon.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d<15){b.alive=false;continue;}const s=BULLET_SPEED*1.3;b.vx=(dx/d)*s;b.vy=(dy/d)*s;}}
    b.x+=b.vx*dt*60;b.y+=b.vy*dt*60;
    if(b.bounces>0){if(b.x<playX+b.radius){b.x=playX+b.radius;b.vx=Math.abs(b.vx);b.bounces--;}else if(b.x>playX+playW-b.radius){b.x=playX+playW-b.radius;b.vx=-Math.abs(b.vx);b.bounces--;}if(b.y<b.radius){b.y=b.radius;b.vy=Math.abs(b.vy);b.bounces--;}}
    if(!b.boomerang){if(b.y>canvas.height+10||b.x<playX-10||b.x>playX+playW+10||b.y<-10){if(b.bounces<=0)b.alive=false;}}
    if(b.boomerang&&b.boomerangTimer>4)b.alive=false;
  }

  collisionPass();

  if(spawnQueue.length>0){spawnTimer+=dt;while(spawnQueue.length>0&&spawnTimer>=spawnQueue[0].spawnTime)spawnAlien(spawnQueue.shift());}

  // Aliens
  const centerX=playX+playW/2, centerY=cannon.y;
  for(let i=aliens.length-1;i>=0;i--){
    const a=aliens[i];if(!a.alive)continue;
    let speed=a.baseSpeed;if(a.freezeTimer>0){a.freezeTimer-=dt;speed=a.baseSpeed*0.5;}
    if(a.burnTimer>0&&a.burnDamageLeft>0){const bd=Math.min(0.33*dt,a.burnDamageLeft);a.hp-=bd;a.burnDamageLeft-=bd;a.burnTimer-=dt;if(a.hp<=0){killAlien(a);continue;}}

    if(currentMap==='swirl'){
      // Spiral inward toward cannon
      a.swirlAngle+=speed*dt*0.25;
      a.swirlDist-=speed*dt*10;
      a.x=centerX+Math.cos(a.swirlAngle)*a.swirlDist;
      a.y=centerY+Math.sin(a.swirlAngle)*a.swirlDist;
      if(a.swirlDist<30){a.alive=false;aliensRemaining--;playerTakeDamage(1);if(state===STATES.GAME_OVER)return;}
    } else {
      a.y+=speed*dt*60;
      if(a.y>canvas.height+a.radius){a.alive=false;aliensRemaining--;playerTakeDamage(1);if(state===STATES.GAME_OVER)return;}
    }
  }

  // Boss
  if(boss&&boss.alive){
    let bs=boss.speed;if(boss.freezeTimer>0){boss.freezeTimer-=dt;bs=boss.speed*0.5;}
    if(boss.burnTimer>0&&boss.burnDamageLeft>0){const bd=Math.min(0.33*dt,boss.burnDamageLeft);boss.hp-=bd;boss.burnDamageLeft-=bd;boss.burnTimer-=dt;if(boss.hp<=0)bossDeath();}
    if(boss.alive){
      boss.x+=bs*boss.direction*dt*60;
      if(boss.x>playX+playW-boss.radius-20)boss.direction=-1;
      if(boss.x<playX+boss.radius+20)boss.direction=1;
      boss.attackTimer+=dt;
      if(boss.telegraphing){boss.telegraphTimer-=dt;if(boss.telegraphTimer<=0){const dx=cannon.x-boss.x,dy=cannon.y-boss.y,d=Math.sqrt(dx*dx+dy*dy);bossProjectiles.push({x:boss.x,y:boss.y,vx:(dx/d)*BOSS_PROJ_SPEED,vy:(dy/d)*BOSS_PROJ_SPEED,radius:BOSS_PROJ_RADIUS,hp:BOSS_PROJ_HP,alive:true});boss.telegraphing=false;boss.attackTimer=0;}}
      else if(boss.attackTimer>=BOSS_ATTACK_INTERVAL-BOSS_TELEGRAPH_DURATION){boss.telegraphing=true;boss.telegraphTimer=BOSS_TELEGRAPH_DURATION;}
    }
  }

  for(let i=bossProjectiles.length-1;i>=0;i--){const bp=bossProjectiles[i];if(!bp.alive)continue;bp.x+=bp.vx*dt*60;bp.y+=bp.vy*dt*60;if(bp.y>canvas.height+20||bp.x<playX-20||bp.x>playX+playW+20)bp.alive=false;}

  bullets=bullets.filter(b=>b.alive);aliens=aliens.filter(a=>a.alive);bossProjectiles=bossProjectiles.filter(b=>b.alive);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  if(damageFlashTimer>0)damageFlashTimer-=dt;
  if(aliensRemaining<=0&&state===STATES.PLAYING)levelComplete();
}

// ============================================================
// LEVEL COMPLETION
// ============================================================
function levelComplete(){
  const wasBoss=isBossLevel(level);if(!wasBoss)nonBossClearCount++;
  chestPending=true;
  abilityPending=(level===10&&wasBoss&&!player.ability);
  level++;if(isBossLevel(level))player.hp=Math.min(player.hp+1,player.maxHp);
  if(abilityPending)state=STATES.ABILITY_SELECT;
  else if(wasBoss&&chestPending)state=STATES.CHEST;
  else{state=STATES.BETWEEN_LEVELS;betweenTimer=3.0;}
}

function updateBetweenLevels(dt){
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  betweenTimer-=dt;if(betweenTimer<=0){if(chestPending)state=STATES.CHEST;else{state=STATES.PLAYING;startLevel();}}
}

// ============================================================
// CHEST & UPGRADES
// ============================================================
function openChest(){
  const el=[];
  if(player.upgrades.fireRate<5)el.push('fireRate');if(player.upgrades.firePower<5)el.push('firePower');
  if(player.upgrades.fireAmount<3)el.push('fireAmount');if(player.upgrades.projectiles<3)el.push('projectiles');
  if(player.upgrades.bounceShot<1)el.push('bounceShot');
  if(player.upgrades.freeze===0&&player.upgrades.fire===0){el.push('freeze');el.push('fire');}
  if(el.length===0){player.hp=Math.min(player.hp+1,player.maxHp);state=STATES.PLAYING;startLevel();return;}
  if(el.length===1)upgradeOptions=[el[0],'hp'];else{const sh=el.sort(()=>Math.random()-0.5);upgradeOptions=[sh[0],sh[1]];}
  state=STATES.UPGRADE;
}

function applyUpgrade(u){switch(u){case'fireRate':player.fireRate=Math.max(0.1,player.fireRate-0.08);player.upgrades.fireRate++;break;case'firePower':player.damage+=1;player.upgrades.firePower++;break;case'freeze':player.element='freeze';player.upgrades.freeze=1;break;case'fire':player.element='fire';player.upgrades.fire=1;break;case'fireAmount':player.upgrades.fireAmount++;break;case'projectiles':player.upgrades.projectiles++;break;case'bounceShot':player.upgrades.bounceShot=1;break;case'hp':player.hp=Math.min(player.hp+1,player.maxHp);break;}}

function getUpgradeName(k){switch(k){case'fireRate':return t('fireRate');case'firePower':return t('firePower');case'freeze':return t('freeze');case'fire':return t('fire');case'hp':return t('plusHp');case'fireAmount':return t('fireAmount');case'projectiles':return t('projectiles');case'bounceShot':return t('bounceShot');}}
function getUpgradeDesc(k){switch(k){case'fireRate':return t('fireRateDesc')+' ('+(player.upgrades.fireRate+1)+'/5)';case'firePower':return t('firePowerDesc')+' ('+(player.upgrades.firePower+1)+'/5)';case'freeze':return t('freezeDesc');case'fire':return t('fireDesc');case'hp':return t('hpDesc');case'fireAmount':return t('fireAmountDesc')+' ('+(player.upgrades.fireAmount+1)+'/3)';case'projectiles':return t('projectilesDesc')+' ('+(player.upgrades.projectiles+1)+'/3)';case'bounceShot':return t('bounceShotDesc');}}

function spawnParticles(x,y,color,count,dur){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color,life:dur,maxLife:dur,radius:2+Math.random()*3});}}

// ============================================================
// RENDER
// ============================================================
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // Black bars outside play area
  ctx.fillStyle='#111';ctx.fillRect(0,0,canvas.width,canvas.height);

  if(state===STATES.TITLE){renderTitle();return;}
  if(state===STATES.MAP_SELECT){renderMapSelect();return;}
  if(state===STATES.HELP){renderHelp();return;}
  if(state===STATES.GAME_OVER){renderField();renderGameOver();return;}

  renderField();renderAliens();renderBoss();renderBossProjectiles();renderBullets();renderCannon();
  if(bullRushActive)renderBullRush();
  renderParticles();renderHUD();

  if(state===STATES.BETWEEN_LEVELS)renderBetweenLevels();
  if(state===STATES.CHEST)renderChest();
  if(state===STATES.UPGRADE)renderUpgradeOverlay();
  if(state===STATES.ABILITY_SELECT)renderAbilitySelect();
  if(state===STATES.PAUSED)renderPaused();

  if(bombTargetMode){ctx.fillStyle='rgba(255,136,0,0.2)';ctx.beginPath();ctx.arc(pointerX,pointerY,120,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff8800';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pointerX,pointerY,120,0,Math.PI*2);ctx.stroke();}
  if(damageFlashTimer>0){ctx.fillStyle='rgba(255,0,0,'+(damageFlashTimer/0.15*0.3)+')';ctx.fillRect(playX,0,playW,canvas.height);}
}

function renderTitle(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#ffffff';for(let i=0;i<80;i++)ctx.fillRect((Math.sin(i*123.456)*0.5+0.5)*canvas.width,(Math.cos(i*654.321)*0.5+0.5)*canvas.height,2,2);
  ctx.textAlign='center';
  let sz=fitText(t('title1'),canvas.width-40,48,'bold');ctx.fillStyle='#33cc33';ctx.font=makeFont(sz,'bold');ctx.fillText(t('title1'),canvas.width/2,canvas.height/2-50);
  sz=fitText(t('title2'),canvas.width-40,48,'bold');ctx.fillStyle='#ff6600';ctx.font=makeFont(sz,'bold');ctx.fillText(t('title2'),canvas.width/2,canvas.height/2+10);
  sz=fitText(t('byline'),canvas.width-40,22,'bold');ctx.fillStyle='#ffffff';ctx.font=makeFont(sz,'bold');ctx.fillText(t('byline'),canvas.width/2,canvas.height/2+55);
  ctx.fillStyle='#aaaaaa';ctx.font=makeFont(18);ctx.fillText(t('start'),canvas.width/2,canvas.height/2+95);
  document.title=t('fullTitle');
  // ? help
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(30,30,22,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(30,30,22,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#000000';ctx.font=makeFont(24,'bold');ctx.textAlign='center';ctx.fillText('?',30,39);
  // Lang
  const lx=getLangBtnX();ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(lx,LANG_BTN_Y,LANG_BTN_W,LANG_BTN_H);
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(lx,LANG_BTN_Y,LANG_BTN_W,LANG_BTN_H);
  ctx.fillStyle='#ffffff';ctx.font=makeFont(16,'bold');ctx.fillText(t('langButton'),lx+LANG_BTN_W/2,LANG_BTN_Y+LANG_BTN_H/2+6);
}

function renderMapSelect(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.textAlign='center';const cs=fitText(t('chooseMap'),canvas.width-40,36,'bold');
  ctx.fillStyle='#FFD700';ctx.font=makeFont(cs,'bold');ctx.fillText(t('chooseMap'),canvas.width/2,canvas.height/2-100);
  const maps=['plains','swirl','castle'];
  const colors=['#4a7c2e','#2a1a4e','#666666'];
  const bW=180,bH=140,gap=20,tw=maps.length*bW+(maps.length-1)*gap;
  const sx=canvas.width/2-tw/2,bY=canvas.height/2-bH/2+20;
  for(let i=0;i<maps.length;i++){
    const bx=sx+i*(bW+gap),m=maps[i];
    ctx.fillStyle=colors[i];ctx.fillRect(bx,bY,bW,bH);
    ctx.strokeStyle='#FFD700';ctx.lineWidth=2;ctx.strokeRect(bx,bY,bW,bH);
    // Mini preview
    if(m==='plains'){ctx.fillStyle='#3a6420';ctx.fillRect(bx+10,bY+70,bW-20,30);}
    else if(m==='swirl'){ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(bx+bW/2,bY+70,20+j*15,0,Math.PI*2);ctx.stroke();}}
    else if(m==='castle'){ctx.fillStyle='#888';ctx.fillRect(bx+30,bY+50,bW-60,60);ctx.fillStyle='#555';ctx.fillRect(bx+30,bY+45,15,10);ctx.fillRect(bx+bW-45,bY+45,15,10);ctx.fillRect(bx+bW/2-7,bY+45,15,10);}
    const nm=t('map'+m.charAt(0).toUpperCase()+m.slice(1));
    ctx.fillStyle='#ffffff';ctx.font=makeFont(18,'bold');ctx.fillText(nm,bx+bW/2,bY+30);
    const desc=t('map'+m.charAt(0).toUpperCase()+m.slice(1)+'Desc');
    ctx.fillStyle='#aaaaaa';ctx.font=makeFont(11);ctx.fillText(desc,bx+bW/2,bY+bH-10);
  }
}

function renderField(){
  if(currentMap==='plains'){
    ctx.fillStyle='#4a7c2e';ctx.fillRect(playX,0,playW,canvas.height);
    ctx.fillStyle='#3a6420';ctx.fillRect(playX,canvas.height-60,playW,60);
    ctx.strokeStyle='#2d4f18';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(playX,canvas.height-60);ctx.lineTo(playX+playW,canvas.height-60);ctx.stroke();
  } else if(currentMap==='swirl'){
    ctx.fillStyle='#1a0a2e';ctx.fillRect(playX,0,playW,canvas.height);
    // Faint spiral rings
    ctx.strokeStyle='rgba(100,50,200,0.15)';ctx.lineWidth=1;
    for(let i=1;i<8;i++){ctx.beginPath();ctx.arc(playX+playW/2,cannon.y,i*50,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#120822';ctx.fillRect(playX,canvas.height-60,playW,60);
  } else if(currentMap==='castle'){
    ctx.fillStyle='#555555';ctx.fillRect(playX,0,playW,canvas.height);
    // Castle walls
    ctx.fillStyle='#777';ctx.fillRect(playX,0,30,canvas.height);ctx.fillRect(playX+playW-30,0,30,canvas.height);
    // Battlements
    for(let y=0;y<canvas.height;y+=40){ctx.fillStyle='#888';ctx.fillRect(playX,y,35,15);ctx.fillRect(playX+playW-35,y,35,15);}
    ctx.fillStyle='#444';ctx.fillRect(playX+30,canvas.height-60,playW-60,60);
  }
}

function renderCannon(){ctx.save();ctx.translate(cannon.x,cannon.y);ctx.fillStyle='#555555';ctx.fillRect(-30,-10,60,20);ctx.fillStyle='#444444';ctx.beginPath();ctx.arc(-20,10,8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(20,10,8,0,Math.PI*2);ctx.fill();ctx.rotate(cannon.angle);ctx.fillStyle='#666666';ctx.fillRect(-5,-40,10,40);ctx.fillStyle='#777777';ctx.fillRect(-7,-42,14,6);ctx.restore();}

function renderBullets(){for(const b of bullets){if(!b.alive)continue;ctx.strokeStyle=b.color;ctx.globalAlpha=0.3;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*2,b.y-b.vy*2);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.fill();}}

function renderBullRush(){const alpha=bullRushTimer/0.4;ctx.strokeStyle=`rgba(0,255,136,${alpha*0.6})`;ctx.lineWidth=50*alpha;ctx.beginPath();ctx.moveTo(bullRushX,bullRushY);ctx.lineTo(bullRushX+Math.sin(bullRushAngle)*canvas.height,bullRushY-Math.cos(bullRushAngle)*canvas.height);ctx.stroke();}

function renderAliens(){
  for(const a of aliens){if(!a.alive)continue;
    if(a.freezeTimer>0){ctx.strokeStyle='#00ccff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(a.x,a.y,a.radius+4,0,Math.PI*2);ctx.stroke();}
    if(a.burnTimer>0){ctx.strokeStyle='#ff6600';ctx.lineWidth=3;ctx.beginPath();ctx.arc(a.x,a.y,a.radius+4,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle=a.color;ctx.beginPath();ctx.arc(a.x,a.y,a.radius,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(a.x-a.radius*0.3,a.y-a.radius*0.15,a.radius*0.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(a.x+a.radius*0.3,a.y-a.radius*0.15,a.radius*0.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000000';ctx.beginPath();ctx.arc(a.x-a.radius*0.3,a.y-a.radius*0.1,a.radius*0.1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(a.x+a.radius*0.3,a.y-a.radius*0.1,a.radius*0.1,0,Math.PI*2);ctx.fill();
    if(a.maxHp>1){const bw=a.radius*2,bx2=a.x-bw/2,by2=a.y-a.radius-8;ctx.fillStyle='#333333';ctx.fillRect(bx2,by2,bw,4);ctx.fillStyle='#00ff00';ctx.fillRect(bx2,by2,bw*(a.hp/a.maxHp),4);}
  }
}

function renderBoss(){
  if(!boss||!boss.alive)return;const tm=performance.now()/1000;
  ctx.strokeStyle=boss.color;ctx.lineWidth=3+Math.sin(tm*4)*2;ctx.globalAlpha=0.5+Math.sin(tm*4)*0.3;ctx.beginPath();ctx.arc(boss.x,boss.y,boss.radius+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  if(boss.freezeTimer>0){ctx.strokeStyle='#00ccff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(boss.x,boss.y,boss.radius+12,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle=boss.color;ctx.beginPath();ctx.arc(boss.x,boss.y,boss.radius,0,Math.PI*2);ctx.fill();
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+tm*0.5;ctx.fillStyle='#ff1144';ctx.beginPath();ctx.arc(boss.x+Math.cos(a)*(boss.radius+12),boss.y+Math.sin(a)*(boss.radius+12),6,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(boss.x-15,boss.y-8,8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(boss.x+15,boss.y-8,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000000';ctx.beginPath();ctx.arc(boss.x-15,boss.y-5,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(boss.x+15,boss.y-5,4,0,Math.PI*2);ctx.fill();
  if(boss.telegraphing){const al=(1-boss.telegraphTimer/BOSS_TELEGRAPH_DURATION)*0.7;ctx.strokeStyle=`rgba(255,0,0,${al})`;ctx.lineWidth=3+(1-boss.telegraphTimer/BOSS_TELEGRAPH_DURATION)*3;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(boss.x,boss.y+boss.radius);ctx.lineTo(cannon.x,cannon.y);ctx.stroke();ctx.setLineDash([]);}
  const bw=Math.min(300,playW-20),bh=20,bx2=canvas.width/2-bw/2,by2=40;
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(bx2-5,by2-25,bw+10,bh+30);
  fitText(t('boss'),bw-10,14,'bold');ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.fillText(t('boss'),canvas.width/2,by2-8);
  ctx.fillStyle='#333333';ctx.fillRect(bx2,by2,bw,bh);ctx.fillStyle='#ff3333';ctx.fillRect(bx2,by2,bw*Math.max(0,boss.hp/boss.maxHp),bh);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.strokeRect(bx2,by2,bw,bh);
}

function renderBossProjectiles(){for(const bp of bossProjectiles){if(!bp.alive)continue;ctx.fillStyle='rgba(255,0,0,0.3)';ctx.beginPath();ctx.arc(bp.x,bp.y,bp.radius+4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff2222';ctx.beginPath();ctx.arc(bp.x,bp.y,bp.radius,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.arc(bp.x,bp.y,bp.radius*0.4,0,Math.PI*2);ctx.fill();}}

function renderParticles(){for(const p of particles){const al=p.life/p.maxLife;ctx.globalAlpha=al;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.radius*(1+(1-al)*0.5),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

function renderHUD(){
  ctx.textAlign='left';const lt=t('level')+': '+level,st=t('score')+': '+player.score;
  const hs=fitText(lt.length>st.length?lt:st,playW/2-40,18,'bold');ctx.font=makeFont(hs,'bold');
  ctx.fillStyle='#000000';ctx.fillText(lt,playX+12,27);ctx.fillText(st,playX+12,52);
  ctx.fillStyle='#ffffff';ctx.fillText(lt,playX+10,25);ctx.fillText(st,playX+10,50);

  // ? help
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(playX+30,80,16,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(playX+30,80,16,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#ffffff';ctx.font=makeFont(16,'bold');ctx.textAlign='center';ctx.fillText('?',playX+30,86);

  // Pause button (II icon) top-right
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(canvas.width-48,12,36,30);
  ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1;ctx.strokeRect(canvas.width-48,12,36,30);
  ctx.fillStyle='#ffffff';ctx.fillRect(canvas.width-40,18,8,18);ctx.fillRect(canvas.width-28,18,8,18);

  ctx.textAlign='right';
  for(let i=0;i<player.maxHp;i++){const hx=playX+playW-30-i*28;drawHeart(hx,25,10,'#ff3333',i<player.hp);}

  ctx.textAlign='center';const ind=[];
  if(player.upgrades.fireRate>0)ind.push(t('frLabel')+' x'+player.upgrades.fireRate);
  if(player.upgrades.firePower>0)ind.push(t('fpLabel')+' x'+player.upgrades.firePower);
  if(player.upgrades.fireAmount>0)ind.push(t('faLabel')+' x'+player.upgrades.fireAmount);
  if(player.upgrades.projectiles>0)ind.push(t('prLabel')+' x'+player.upgrades.projectiles);
  if(player.upgrades.bounceShot>0)ind.push(t('bsLabel'));
  if(player.upgrades.freeze>0)ind.push(t('freezeLabel'));if(player.upgrades.fire>0)ind.push(t('fireLabel'));

  if(ind.length>0){ctx.font=makeFont(14);let mw=0;for(const s of ind){const w=ctx.measureText(s).width;if(w>mw)mw=w;}
    const pw=Math.max(70,mw+16),pg=10,tw2=ind.length*pw+(ind.length-1)*pg,sx=canvas.width/2-tw2/2,iy=canvas.height-95;
    for(let i=0;i<ind.length;i++){const ix=sx+i*(pw+pg)+pw/2;ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(ix-pw/2,iy-10,pw,22);ctx.fillStyle='#ffffff';ctx.fillText(ind[i],ix,iy+5);}}

  if(player.ability){const def=ABILITY_DEFS[player.ability],abX=canvas.width/2-50,abY=canvas.height-55,abW=100,abH=30;
    const pct=player.abilityCharge/def.chargeTime;ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(abX,abY,abW,abH);
    ctx.fillStyle=player.abilityReady?def.color:'#333333';ctx.fillRect(abX,abY,abW*pct,abH);
    ctx.strokeStyle=player.abilityReady?'#ffffff':'#666666';ctx.lineWidth=player.abilityReady?2:1;ctx.strokeRect(abX,abY,abW,abH);
    ctx.fillStyle='#ffffff';ctx.font=makeFont(11,'bold');
    const abN=t('ability'+player.ability.charAt(0).toUpperCase()+player.ability.slice(1));
    ctx.fillText(player.abilityReady?abN+' [SPACE]':t('abilityCharging')+' '+Math.floor(pct*100)+'%',canvas.width/2,abY+abH/2+4);}
}

function drawHeart(x,y,sz,col,filled){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,sz*0.3);ctx.bezierCurveTo(-sz,-sz*0.3,-sz,-sz,0,-sz*0.5);ctx.bezierCurveTo(sz,-sz,sz,-sz*0.3,0,sz*0.3);if(filled){ctx.fillStyle=col;ctx.fill();}else{ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();}

function renderBetweenLevels(){ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';const ct=tFormat('levelComplete',{n:level-1}),cs=fitText(ct,canvas.width-40,36,'bold');ctx.fillStyle='#ffffff';ctx.font=makeFont(cs,'bold');ctx.fillText(ct,canvas.width/2,canvas.height/2-10);ctx.font=makeFont(20);ctx.fillStyle='#aaaaaa';ctx.fillText(tFormat('nextLevel',{n:level}),canvas.width/2,canvas.height/2+30);}

function renderChest(){ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,canvas.width,canvas.height);const cx2=canvas.width/2,cy2=canvas.height/2,tm=performance.now()/1000;for(let i=0;i<4;i++){const a=tm*2+(i/4)*Math.PI*2;ctx.fillStyle='#ffdd00';ctx.globalAlpha=0.5+Math.sin(tm*3+i)*0.3;ctx.beginPath();ctx.arc(cx2+Math.cos(a)*50,cy2+Math.sin(a)*30,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.fillStyle='#8B4513';ctx.fillRect(cx2-35,cy2-25,70,50);ctx.fillStyle='#A0522D';ctx.fillRect(cx2-38,cy2-28,76,18);ctx.strokeStyle='#FFD700';ctx.lineWidth=2;ctx.strokeRect(cx2-35,cy2-25,70,50);ctx.strokeRect(cx2-38,cy2-28,76,18);ctx.fillStyle='#FFD700';ctx.fillRect(cx2-5,cy2-5,10,12);ctx.beginPath();ctx.arc(cx2,cy2-5,7,Math.PI,0);ctx.strokeStyle='#FFD700';ctx.lineWidth=3;ctx.stroke();ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.font=makeFont(20,'bold');ctx.fillText(t('openChest'),cx2,cy2+55);}

function renderUpgradeOverlay(){ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';const cs=fitText(t('chooseUpgrade'),canvas.width-40,32,'bold');ctx.fillStyle='#FFD700';ctx.font=makeFont(cs,'bold');ctx.fillText(t('chooseUpgrade'),canvas.width/2,canvas.height/2-90);const bW=260,bH=120,gap=30,tw=upgradeOptions.length*bW+(upgradeOptions.length-1)*gap,sx=canvas.width/2-tw/2,bY=canvas.height/2-bH/2+20;for(let i=0;i<upgradeOptions.length;i++){const bx=sx+i*(bW+gap),k=upgradeOptions[i];ctx.fillStyle='#2a2a4a';ctx.fillRect(bx,bY,bW,bH);ctx.strokeStyle='#FFD700';ctx.lineWidth=2;ctx.strokeRect(bx,bY,bW,bH);let nc='#ffffff';if(k==='freeze')nc='#00ccff';if(k==='fire')nc='#ff6600';if(k==='hp')nc='#ff3333';if(k==='fireAmount')nc='#ffcc00';if(k==='projectiles')nc='#88ff88';if(k==='bounceShot')nc='#ff88ff';const nm=getUpgradeName(k),ns=fitText(nm,240,22,'bold');ctx.fillStyle=nc;ctx.font=makeFont(ns,'bold');ctx.fillText(nm,bx+bW/2,bY+40);const dt=getUpgradeDesc(k),ds=fitText(dt,240,14);ctx.fillStyle='#aaaaaa';ctx.font=makeFont(ds);ctx.fillText(dt,bx+bW/2,bY+70);ctx.fillStyle='#666666';ctx.font=makeFont(12);ctx.fillText(t('selectUpgrade'),bx+bW/2,bY+100);}}

function renderAbilitySelect(){ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';const cs=fitText(t('chooseAbility'),canvas.width-40,32,'bold');ctx.fillStyle='#00ffcc';ctx.font=makeFont(cs,'bold');ctx.fillText(t('chooseAbility'),canvas.width/2,canvas.height/2-100);const opts=['overkill','bombing','bull','frozen'],bW=200,bH=120,gap=15,tw=opts.length*bW+(opts.length-1)*gap,sx=canvas.width/2-tw/2,bY=canvas.height/2-bH/2+20;for(let i=0;i<opts.length;i++){const bx=sx+i*(bW+gap),k=opts[i],def=ABILITY_DEFS[k];ctx.fillStyle='#1a1a3e';ctx.fillRect(bx,bY,bW,bH);ctx.strokeStyle=def.color;ctx.lineWidth=2;ctx.strokeRect(bx,bY,bW,bH);const nm=t('ability'+k.charAt(0).toUpperCase()+k.slice(1)),ns=fitText(nm,bW-20,20,'bold');ctx.fillStyle=def.color;ctx.font=makeFont(ns,'bold');ctx.fillText(nm,bx+bW/2,bY+35);const desc=t('ability'+k.charAt(0).toUpperCase()+k.slice(1)+'Desc'),ds=fitText(desc,bW-20,11);ctx.fillStyle='#aaaaaa';ctx.font=makeFont(ds);ctx.fillText(desc,bx+bW/2,bY+65);ctx.fillStyle='#666666';ctx.font=makeFont(11);ctx.fillText(t('selectUpgrade'),bx+bW/2,bY+100);}}

function renderPaused(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.font=makeFont(48,'bold');ctx.fillText(t('paused'),canvas.width/2,canvas.height/2-80);
  const btns=[{key:'resume',y:canvas.height/2-30,col:'#33cc33'},{key:'restartBtn',y:canvas.height/2+30,col:'#ffcc00'},{key:'quit',y:canvas.height/2+90,col:'#ff3333'}];
  const bw=200,bh=45;
  for(const btn of btns){
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(canvas.width/2-bw/2,btn.y-bh/2,bw,bh);
    ctx.strokeStyle=btn.col;ctx.lineWidth=2;ctx.strokeRect(canvas.width/2-bw/2,btn.y-bh/2,bw,bh);
    ctx.fillStyle='#ffffff';ctx.font=makeFont(20,'bold');ctx.fillText(t(btn.key),canvas.width/2,btn.y+7);
  }
}

function renderGameOver(){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';const gs=fitText(t('gameOver'),canvas.width-40,48,'bold');ctx.fillStyle='#ff3333';ctx.font=makeFont(gs,'bold');ctx.fillText(t('gameOver'),canvas.width/2,canvas.height/2-50);ctx.fillStyle='#ffffff';ctx.font=makeFont(24);ctx.fillText(t('score')+': '+player.score,canvas.width/2,canvas.height/2+10);ctx.fillText(t('level')+': '+level,canvas.width/2,canvas.height/2+45);ctx.fillStyle='#aaaaaa';ctx.font=makeFont(20);ctx.fillText(t('restart'),canvas.width/2,canvas.height/2+100);}

// ============================================================
// SCROLLABLE HELP SCREEN
// ============================================================
function renderHelp(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,canvas.width,canvas.height);
  const cx2=canvas.width/2,leftX=Math.max(20,cx2-280),colW=canvas.width-leftX-20;
  const lh=20,sg=10;
  // Calculate total content height first
  let totalH=36; // title
  const sections=[
    ['helpControls','#33cc33',['helpShoot','helpAutoFire','helpMove','helpPause']],
    ['helpCombat','#cccc00',['helpAliens','helpAlienDmg']],
    ['helpBoss','#ff3366',['helpBossShoot','helpBossTelegraph','helpBossDodge']],
    ['helpSurvival','#ff3333',['helpHP','helpHPBoss','helpHPChest']],
    ['helpUpgrades','#FFD700',['helpFireRate','helpFirePower','helpMultiShot','helpBigBullets','helpBounce','helpFreeze','helpFire','helpExclusive']],
    ['helpAbilities','#00ffcc',['helpAbility1','helpAbility2','helpAbility3','helpAbility4','helpAbilityUse']],
    ['helpMaps','#ff8800',['helpMap1','helpMap2','helpMap3']],
    ['helpTips','#00ccff',['helpTip1','helpTip2','helpTip3','helpTip4','helpTip5']],
  ];
  for(const[,, items]of sections) totalH+=lh+2+items.length*lh+sg;
  totalH+=40; // back button

  // Clamp scroll
  const maxScroll=0, minScroll=Math.min(0,canvas.height-totalH-60);
  helpScrollY=Math.max(minScroll,Math.min(maxScroll,helpScrollY));

  let y=40+helpScrollY;
  const hs=fitText(t('howToPlay'),canvas.width-40,28,'bold');
  ctx.textAlign='center';ctx.fillStyle='#FFD700';ctx.font=makeFont(hs,'bold');ctx.fillText(t('howToPlay'),cx2,y);y+=36;

  for(const[tk,col,items]of sections){
    const ts=fitText(t(tk),colW,16,'bold');ctx.fillStyle=col;ctx.font=makeFont(ts,'bold');ctx.textAlign='left';ctx.fillText(t(tk),leftX,y);y+=lh+2;
    for(const ik of items){const is=fitText('  '+t(ik),colW,12);ctx.fillStyle='#cccccc';ctx.font=makeFont(is);ctx.fillText('  '+t(ik),leftX,y);y+=lh;}
    y+=sg;
  }

  // Back
  ctx.textAlign='center';ctx.fillStyle='#aaaaaa';ctx.font=makeFont(16);ctx.fillText(t('back'),cx2,y+20);

  // Scroll indicator
  if(totalH>canvas.height){
    const barH=canvas.height*canvas.height/totalH,barY=-helpScrollY/totalH*canvas.height;
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(canvas.width-8,barY,5,barH);
  }
}

// ============================================================
// GAME LOOP
// ============================================================
function gameLoop(ts){
  const dt=Math.min((ts-lastTime)/1000,0.05);lastTime=ts;
  if(state===STATES.BETWEEN_LEVELS)updateBetweenLevels(dt);else update(dt);
  render();requestAnimationFrame(gameLoop);
}
lastTime=performance.now();requestAnimationFrame(gameLoop);
