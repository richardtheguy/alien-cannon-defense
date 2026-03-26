// ============================================================
// Alien Cannon Defense — Complete Game
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- Resize ---
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cannon.x = canvas.width / 2;
  cannon.y = canvas.height - 30;
}
window.addEventListener('resize', resize);

// --- Constants ---
const ALIEN_TYPES = {
  SCOUT:   { color: '#33cc33', baseHp: 1, baseSpeed: 2.5, points: 10,  radius: 15, minLevel: 1 },
  SOLDIER: { color: '#cccc00', baseHp: 2, baseSpeed: 1.8, points: 25,  radius: 18, minLevel: 2 },
  TANK:    { color: '#cc3333', baseHp: 4, baseSpeed: 1.0, points: 50,  radius: 22, minLevel: 4 },
  ELITE:   { color: '#9933cc', baseHp: 6, baseSpeed: 1.8, points: 75,  radius: 20, minLevel: 7 },
  SWARM:   { color: '#00cccc', baseHp: 1, baseSpeed: 3.5, points: 15,  radius: 12, minLevel: 5 },
};

const STATES = { TITLE: 0, PLAYING: 1, BETWEEN_LEVELS: 2, CHEST: 3, UPGRADE: 4, GAME_OVER: 5 };
const BULLET_SPEED = 8;
const BULLET_RADIUS = 4;
const BOSS_PROJ_RADIUS = 8;
const BOSS_PROJ_SPEED = 2.5;
const BOSS_PROJ_HP = 3;
const BOSS_ATTACK_INTERVAL = 2.5;
const BOSS_TELEGRAPH_DURATION = 0.6;
const CANNON_HITBOX_W = 60;
const CANNON_HITBOX_H = 40;

// --- Game State ---
let state = STATES.TITLE;
let level = 1;
let nonBossClearCount = 0;
let lastTime = 0;

const cannon = { x: 0, y: 0, angle: 0 };
const player = { hp: 3, maxHp: 5, score: 0, fireRate: 0.5, damage: 1, fireTimer: 0, element: null,
  upgrades: { fireRate: 0, firePower: 0, freeze: 0, fire: 0 } };

let bullets = [];
let aliens = [];
let particles = [];
let spawnQueue = [];
let spawnTimer = 0;
let aliensRemaining = 0;

// Boss
let boss = null;
let bossProjectiles = [];

// Between levels
let betweenTimer = 0;

// Input
let pointerX = 0, pointerY = 0;
let pointerDown = false;
let pointerDownTime = 0;
let firedInitialShot = false;

// Damage flash
let damageFlashTimer = 0;

// Chest / Upgrade
let chestPending = false;
let upgradeOptions = [];

// --- Init ---
resize();

// ============================================================
// INPUT
// ============================================================
function updatePointer(x, y) {
  pointerX = x;
  pointerY = y;
  const dx = pointerX - cannon.x;
  const dy = cannon.y - pointerY;
  cannon.angle = Math.atan2(dx, dy);
  // Clamp to not aim below horizontal
  const maxAngle = Math.PI / 2 - 0.05;
  if (cannon.angle > maxAngle) cannon.angle = maxAngle;
  if (cannon.angle < -maxAngle) cannon.angle = -maxAngle;
}

canvas.addEventListener('mousemove', e => updatePointer(e.clientX, e.clientY));
canvas.addEventListener('touchmove', e => { e.preventDefault(); updatePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  pointerDown = true;
  pointerDownTime = performance.now();
  firedInitialShot = false;
}, { passive: false });
canvas.addEventListener('mousedown', e => {
  updatePointer(e.clientX, e.clientY);
  pointerDown = true;
  pointerDownTime = performance.now();
  firedInitialShot = false;
});
canvas.addEventListener('mouseup', () => { pointerDown = false; });
canvas.addEventListener('touchend', e => { e.preventDefault(); pointerDown = false; }, { passive: false });

canvas.addEventListener('click', e => {
  const cx = e.clientX, cy = e.clientY;
  handleClick(cx, cy);
});
canvas.addEventListener('touchstart', e => {
  // handled via click for state transitions
}, { passive: false });

function handleClick(cx, cy) {
  if (state === STATES.TITLE) {
    resetGame();
    state = STATES.PLAYING;
    startLevel();
    return;
  }
  if (state === STATES.GAME_OVER) {
    resetGame();
    state = STATES.PLAYING;
    startLevel();
    return;
  }
  if (state === STATES.CHEST) {
    // Check if click is on chest
    const chestX = canvas.width / 2, chestY = canvas.height / 2;
    if (cx >= chestX - 40 && cx <= chestX + 40 && cy >= chestY - 30 && cy <= chestY + 30) {
      openChest();
    }
    return;
  }
  if (state === STATES.UPGRADE) {
    // Check which option was clicked
    const boxW = 260, boxH = 120, gap = 30;
    const totalW = upgradeOptions.length * boxW + (upgradeOptions.length - 1) * gap;
    const startX = canvas.width / 2 - totalW / 2;
    const boxY = canvas.height / 2 - boxH / 2 + 20;
    for (let i = 0; i < upgradeOptions.length; i++) {
      const bx = startX + i * (boxW + gap);
      if (cx >= bx && cx <= bx + boxW && cy >= boxY && cy <= boxY + boxH) {
        applyUpgrade(upgradeOptions[i]);
        startLevel();
        state = STATES.PLAYING;
        return;
      }
    }
    return;
  }
}

// ============================================================
// GAME RESET
// ============================================================
function resetGame() {
  level = 1;
  nonBossClearCount = 0;
  player.hp = 3;
  player.maxHp = 5;
  player.score = 0;
  player.fireRate = 0.5;
  player.damage = 1;
  player.fireTimer = 0;
  player.element = null;
  player.upgrades = { fireRate: 0, firePower: 0, freeze: 0, fire: 0 };
  bullets = [];
  aliens = [];
  particles = [];
  spawnQueue = [];
  spawnTimer = 0;
  aliensRemaining = 0;
  boss = null;
  bossProjectiles = [];
  betweenTimer = 0;
  damageFlashTimer = 0;
  chestPending = false;
  upgradeOptions = [];
}

// ============================================================
// LEVEL SETUP
// ============================================================
function isBossLevel(lvl) { return lvl % 5 === 0; }

function startLevel() {
  bullets = [];
  spawnQueue = [];
  spawnTimer = 0;
  boss = null;
  bossProjectiles = [];

  if (isBossLevel(level)) {
    const bossNumber = level / 5;
    boss = {
      x: canvas.width / 2, y: 80,
      hp: 20 + bossNumber * 15,
      maxHp: 20 + bossNumber * 15,
      points: 200 + bossNumber * 100,
      radius: 45,
      speed: 1.5,
      direction: 1,
      attackTimer: 0,
      telegraphTimer: 0,
      telegraphing: false,
      alive: true,
      freezeTimer: 0,
      burnTimer: 0,
      burnDamageLeft: 0,
      color: '#ff3366',
    };
    aliensRemaining = 1; // boss counts as 1
  } else {
    generateWave(level);
  }
}

function generateWave(lvl) {
  const totalSlots = Math.floor(5 + (lvl - 1) * 1.4);
  const hpBonus = Math.floor(lvl / 5);
  const speedBonus = Math.floor(lvl / 3) * 0.1;

  // Filter eligible types
  const eligible = Object.entries(ALIEN_TYPES).filter(([, cfg]) => cfg.minLevel <= lvl);

  let slotsUsed = 0;
  const wave = [];

  while (slotsUsed < totalSlots && eligible.length > 0) {
    // Weighted random: favor simpler types
    const weights = eligible.map(([name]) => {
      if (name === 'SCOUT') return 5;
      if (name === 'SOLDIER') return 4;
      if (name === 'TANK') return 2;
      if (name === 'ELITE') return 1;
      if (name === 'SWARM') return 2;
      return 1;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    let picked = eligible[0];
    for (let i = 0; i < eligible.length; i++) {
      r -= weights[i];
      if (r <= 0) { picked = eligible[i]; break; }
    }

    const [typeName, cfg] = picked;

    if (typeName === 'SWARM') {
      const burstSize = Math.min(5, totalSlots - slotsUsed);
      for (let i = 0; i < burstSize; i++) {
        wave.push({ typeName, cfg, burst: true });
      }
      slotsUsed += burstSize;
    } else {
      wave.push({ typeName, cfg, burst: false });
      slotsUsed++;
    }
  }

  // Build spawn queue with timing
  let time = 0;
  for (let i = 0; i < wave.length; i++) {
    if (wave[i].burst && i > 0 && wave[i - 1].burst) {
      // Same timestamp as previous burst member
      spawnQueue.push({ ...wave[i], spawnTime: time, hpBonus, speedBonus });
    } else {
      spawnQueue.push({ ...wave[i], spawnTime: time, hpBonus, speedBonus });
      if (!(wave[i].burst && i + 1 < wave.length && wave[i + 1].burst)) {
        time += 0.8;
      }
    }
  }

  aliensRemaining = wave.length;
  spawnTimer = 0;
}

function spawnAlien(entry) {
  const cfg = entry.cfg;
  const hp = cfg.baseHp + entry.hpBonus;
  const speed = cfg.baseSpeed + entry.speedBonus;
  const radius = cfg.radius;
  const x = radius + Math.random() * (canvas.width - radius * 2);
  aliens.push({
    type: entry.typeName,
    x, y: -radius,
    hp, maxHp: hp,
    speed, baseSpeed: speed,
    points: cfg.points,
    radius,
    color: cfg.color,
    alive: true,
    freezeTimer: 0,
    burnTimer: 0,
    burnDamageLeft: 0,
  });
}

// ============================================================
// SHOOTING
// ============================================================
function fireBullet() {
  const tipX = cannon.x + Math.sin(cannon.angle) * 35;
  const tipY = cannon.y - Math.cos(cannon.angle) * 35;
  const vx = Math.sin(cannon.angle) * BULLET_SPEED;
  const vy = -Math.cos(cannon.angle) * BULLET_SPEED;

  let color = '#ffdd00';
  if (player.element === 'freeze') color = '#00ccff';
  else if (player.element === 'fire') color = '#ff6600';

  bullets.push({ x: tipX, y: tipY, vx, vy, radius: BULLET_RADIUS, alive: true, color });
}

// ============================================================
// COLLISION
// ============================================================
function distSq(x1, y1, x2, y2) {
  const dx = x1 - x2, dy = y1 - y2;
  return dx * dx + dy * dy;
}

function circleCircle(x1, y1, r1, x2, y2, r2) {
  return distSq(x1, y1, x2, y2) < (r1 + r2) * (r1 + r2);
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  return distSq(cx, cy, closestX, closestY) < cr * cr;
}

function collisionPass() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b.alive) continue;

    // Bullet vs aliens
    for (let j = aliens.length - 1; j >= 0; j--) {
      const a = aliens[j];
      if (!a.alive) continue;
      if (circleCircle(b.x, b.y, b.radius, a.x, a.y, a.radius)) {
        b.alive = false;
        damageAlien(a, player.damage);
        break;
      }
    }
    if (!b.alive) continue;

    // Bullet vs boss
    if (boss && boss.alive) {
      if (circleCircle(b.x, b.y, b.radius, boss.x, boss.y, boss.radius)) {
        b.alive = false;
        damageBoss(player.damage);
        continue;
      }
    }

    // Bullet vs boss projectiles
    for (let j = bossProjectiles.length - 1; j >= 0; j--) {
      const bp = bossProjectiles[j];
      if (!bp.alive) continue;
      if (circleCircle(b.x, b.y, b.radius, bp.x, bp.y, bp.radius)) {
        b.alive = false;
        bp.hp -= player.damage;
        if (bp.hp <= 0) {
          bp.alive = false;
          spawnParticles(bp.x, bp.y, '#ff4444', 4, 0.2);
        }
        break;
      }
    }
  }

  // Boss projectiles vs cannon
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    const bp = bossProjectiles[i];
    if (!bp.alive) continue;
    const rx = cannon.x - CANNON_HITBOX_W / 2;
    const ry = cannon.y - CANNON_HITBOX_H / 2;
    if (circleRect(bp.x, bp.y, bp.radius, rx, ry, CANNON_HITBOX_W, CANNON_HITBOX_H)) {
      bp.alive = false;
      playerTakeDamage(1);
    }
  }
}

function damageAlien(alien, dmg) {
  alien.hp -= dmg;
  applyStatusEffect(alien);
  if (alien.hp <= 0) {
    killAlien(alien);
  }
}

function killAlien(alien) {
  alien.alive = false;
  player.score += alien.points;
  aliensRemaining--;
  spawnParticles(alien.x, alien.y, alien.color, 7, 0.3);
}

function damageBoss(dmg) {
  boss.hp -= dmg;
  applyStatusEffect(boss);
  if (boss.hp <= 0) {
    bossDeath();
  }
}

function bossDeath() {
  boss.alive = false;
  bossProjectiles = [];
  player.score += boss.points;
  aliensRemaining = 0;
  spawnParticles(boss.x, boss.y, boss.color, 18, 0.6);
}

function applyStatusEffect(target) {
  if (player.element === 'freeze') {
    target.freezeTimer = 2.0;
  } else if (player.element === 'fire') {
    target.burnTimer = 3.0;
    target.burnDamageLeft = 1.0;
  }
}

function playerTakeDamage(amount) {
  player.hp -= amount;
  damageFlashTimer = 0.15;
  if (player.hp <= 0) {
    player.hp = 0;
    state = STATES.GAME_OVER;
  }
}

// ============================================================
// UPDATE
// ============================================================
function update(dt) {
  if (state !== STATES.PLAYING) return;

  // --- Input / Firing ---
  player.fireTimer -= dt;
  if (pointerDown) {
    const holdTime = (performance.now() - pointerDownTime) / 1000;
    if (!firedInitialShot) {
      if (player.fireTimer <= 0) {
        fireBullet();
        player.fireTimer = player.fireRate;
      }
      firedInitialShot = true;
    } else if (holdTime >= 0.3) {
      if (player.fireTimer <= 0) {
        fireBullet();
        player.fireTimer = player.fireRate;
      }
    }
  }

  // --- Bullets ---
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -10 || b.x > canvas.width + 10 || b.y < -10 || b.y > canvas.height + 10) {
      b.alive = false;
    }
  }

  // --- Collision ---
  collisionPass();

  // --- Spawn queue ---
  if (spawnQueue.length > 0) {
    spawnTimer += dt;
    // Spawn all entries whose time has come
    while (spawnQueue.length > 0 && spawnTimer >= spawnQueue[0].spawnTime) {
      spawnAlien(spawnQueue.shift());
    }
  }

  // --- Aliens ---
  for (let i = aliens.length - 1; i >= 0; i--) {
    const a = aliens[i];
    if (!a.alive) continue;

    // Freeze
    let speed = a.baseSpeed;
    if (a.freezeTimer > 0) {
      a.freezeTimer -= dt;
      speed = a.baseSpeed * 0.5;
    }

    // Burn
    if (a.burnTimer > 0 && a.burnDamageLeft > 0) {
      const burnDmg = Math.min(0.33 * dt, a.burnDamageLeft);
      a.hp -= burnDmg;
      a.burnDamageLeft -= burnDmg;
      a.burnTimer -= dt;
      if (a.hp <= 0) {
        killAlien(a);
        continue;
      }
    }

    a.y += speed;

    if (a.y > canvas.height + a.radius) {
      a.alive = false;
      aliensRemaining--;
      playerTakeDamage(1);
      if (state === STATES.GAME_OVER) return;
    }
  }

  // --- Boss ---
  if (boss && boss.alive) {
    // Movement
    let bossSpeed = boss.speed;
    if (boss.freezeTimer > 0) {
      boss.freezeTimer -= dt;
      bossSpeed = boss.speed * 0.5;
    }

    // Burn
    if (boss.burnTimer > 0 && boss.burnDamageLeft > 0) {
      const burnDmg = Math.min(0.33 * dt, boss.burnDamageLeft);
      boss.hp -= burnDmg;
      boss.burnDamageLeft -= burnDmg;
      boss.burnTimer -= dt;
      if (boss.hp <= 0) {
        bossDeath();
      }
    }

    if (boss.alive) {
      boss.x += bossSpeed * boss.direction;
      if (boss.x > canvas.width - boss.radius - 20) boss.direction = -1;
      if (boss.x < boss.radius + 20) boss.direction = 1;

      // Attack cycle
      boss.attackTimer += dt;
      if (boss.telegraphing) {
        boss.telegraphTimer -= dt;
        if (boss.telegraphTimer <= 0) {
          // Fire projectile
          const dx = cannon.x - boss.x;
          const dy = cannon.y - boss.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          bossProjectiles.push({
            x: boss.x, y: boss.y,
            vx: (dx / dist) * BOSS_PROJ_SPEED,
            vy: (dy / dist) * BOSS_PROJ_SPEED,
            radius: BOSS_PROJ_RADIUS,
            hp: BOSS_PROJ_HP,
            alive: true,
          });
          boss.telegraphing = false;
          boss.attackTimer = 0;
        }
      } else if (boss.attackTimer >= BOSS_ATTACK_INTERVAL - BOSS_TELEGRAPH_DURATION) {
        boss.telegraphing = true;
        boss.telegraphTimer = BOSS_TELEGRAPH_DURATION;
      }
    }
  }

  // --- Boss Projectiles ---
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    const bp = bossProjectiles[i];
    if (!bp.alive) continue;
    bp.x += bp.vx;
    bp.y += bp.vy;
    if (bp.y > canvas.height + 20 || bp.x < -20 || bp.x > canvas.width + 20) {
      bp.alive = false;
    }
  }

  // --- Cleanup dead entities ---
  bullets = bullets.filter(b => b.alive);
  aliens = aliens.filter(a => a.alive);
  bossProjectiles = bossProjectiles.filter(bp => bp.alive);

  // --- Particles ---
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // --- Damage flash ---
  if (damageFlashTimer > 0) damageFlashTimer -= dt;

  // --- Level completion ---
  if (aliensRemaining <= 0 && state === STATES.PLAYING) {
    levelComplete();
  }
}

// ============================================================
// LEVEL COMPLETION
// ============================================================
function levelComplete() {
  state = STATES.BETWEEN_LEVELS;
  betweenTimer = 3.0;

  // Track non-boss clears
  if (!isBossLevel(level)) {
    nonBossClearCount++;
  }

  // Determine if chest should spawn
  chestPending = false;
  if (isBossLevel(level)) {
    chestPending = true;
  } else if (nonBossClearCount % 3 === 0 && nonBossClearCount > 0) {
    chestPending = true;
  }

  // Increment level for next
  level++;

  // HP recovery before boss
  if (isBossLevel(level)) {
    player.hp = Math.min(player.hp + 1, player.maxHp);
  }
}

function updateBetweenLevels(dt) {
  // Update particles during between-levels too
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  betweenTimer -= dt;
  if (betweenTimer <= 0) {
    if (chestPending) {
      state = STATES.CHEST;
    } else {
      state = STATES.PLAYING;
      startLevel();
    }
  }
}

// ============================================================
// CHEST & UPGRADES
// ============================================================
function openChest() {
  // Determine eligible upgrades
  const eligible = [];
  if (player.upgrades.fireRate < 5) eligible.push('fireRate');
  if (player.upgrades.firePower < 5) eligible.push('firePower');
  if (player.upgrades.freeze === 0 && player.upgrades.fire === 0) {
    eligible.push('freeze');
    eligible.push('fire');
  }

  if (eligible.length === 0) {
    // Grant HP
    player.hp = Math.min(player.hp + 1, player.maxHp);
    state = STATES.PLAYING;
    startLevel();
    return;
  }

  if (eligible.length === 1) {
    upgradeOptions = [eligible[0], 'hp'];
  } else {
    // Pick 2 random
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    upgradeOptions = [shuffled[0], shuffled[1]];
  }

  state = STATES.UPGRADE;
}

function applyUpgrade(upgrade) {
  switch (upgrade) {
    case 'fireRate':
      player.fireRate = Math.max(0.1, player.fireRate - 0.08);
      player.upgrades.fireRate++;
      break;
    case 'firePower':
      player.damage += 1;
      player.upgrades.firePower++;
      break;
    case 'freeze':
      player.element = 'freeze';
      player.upgrades.freeze = 1;
      break;
    case 'fire':
      player.element = 'fire';
      player.upgrades.fire = 1;
      break;
    case 'hp':
      player.hp = Math.min(player.hp + 1, player.maxHp);
      break;
  }
}

function getUpgradeName(key) {
  switch (key) {
    case 'fireRate': return 'Fire Rate';
    case 'firePower': return 'Fire Power';
    case 'freeze': return 'Freeze';
    case 'fire': return 'Fire';
    case 'hp': return '+1 HP';
  }
}

function getUpgradeDesc(key) {
  switch (key) {
    case 'fireRate': return '-0.08s delay (x' + (player.upgrades.fireRate + 1) + '/5)';
    case 'firePower': return '+1 damage (x' + (player.upgrades.firePower + 1) + '/5)';
    case 'freeze': return 'Slow aliens 50% for 2s';
    case 'fire': return 'Burn 1 dmg over 3s';
    case 'hp': return 'Restore 1 HP';
  }
}

// ============================================================
// PARTICLES
// ============================================================
function spawnParticles(x, y, color, count, duration) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: duration,
      maxLife: duration,
      radius: 2 + Math.random() * 3,
    });
  }
}

// ============================================================
// RENDER
// ============================================================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === STATES.TITLE) {
    renderTitle();
    return;
  }
  if (state === STATES.GAME_OVER) {
    renderField();
    renderGameOver();
    return;
  }

  renderField();
  renderAliens();
  renderBoss();
  renderBossProjectiles();
  renderBullets();
  renderCannon();
  renderParticles();
  renderHUD();

  if (state === STATES.BETWEEN_LEVELS) {
    renderBetweenLevels();
  }
  if (state === STATES.CHEST) {
    renderChest();
  }
  if (state === STATES.UPGRADE) {
    renderUpgradeOverlay();
  }

  // Damage flash
  if (damageFlashTimer > 0) {
    ctx.fillStyle = 'rgba(255, 0, 0, ' + (damageFlashTimer / 0.15 * 0.3) + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function renderTitle() {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 80; i++) {
    const sx = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
    const sy = (Math.cos(i * 654.321) * 0.5 + 0.5) * canvas.height;
    ctx.fillRect(sx, sy, 2, 2);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#33cc33';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('ALIEN CANNON', canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillStyle = '#ff6600';
  ctx.fillText('DEFENSE', canvas.width / 2, canvas.height / 2 + 20);

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 80);
}

function renderField() {
  // Sky/field
  ctx.fillStyle = '#4a7c2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground strip
  ctx.fillStyle = '#3a6420';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  // Ground line
  ctx.strokeStyle = '#2d4f18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 60);
  ctx.lineTo(canvas.width, canvas.height - 60);
  ctx.stroke();
}

function renderCannon() {
  ctx.save();
  ctx.translate(cannon.x, cannon.y);

  // Base
  ctx.fillStyle = '#555555';
  ctx.fillRect(-30, -10, 60, 20);

  // Wheels
  ctx.fillStyle = '#444444';
  ctx.beginPath();
  ctx.arc(-20, 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 10, 8, 0, Math.PI * 2);
  ctx.fill();

  // Barrel
  ctx.rotate(cannon.angle);
  ctx.fillStyle = '#666666';
  ctx.fillRect(-5, -40, 10, 40);

  // Barrel tip
  ctx.fillStyle = '#777777';
  ctx.fillRect(-7, -42, 14, 6);

  ctx.restore();
}

function renderBullets() {
  for (const b of bullets) {
    if (!b.alive) continue;

    // Trail
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Bullet
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderAliens() {
  for (const a of aliens) {
    if (!a.alive) continue;

    // Freeze glow
    if (a.freezeTimer > 0) {
      ctx.strokeStyle = '#00ccff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Burn glow
    if (a.burnTimer > 0) {
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(a.x - a.radius * 0.3, a.y - a.radius * 0.15, a.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(a.x + a.radius * 0.3, a.y - a.radius * 0.15, a.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(a.x - a.radius * 0.3, a.y - a.radius * 0.1, a.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(a.x + a.radius * 0.3, a.y - a.radius * 0.1, a.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // HP bar for multi-hp aliens
    if (a.maxHp > 1) {
      const barW = a.radius * 2;
      const barH = 4;
      const barX = a.x - barW / 2;
      const barY = a.y - a.radius - 8;
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(barX, barY, barW * (a.hp / a.maxHp), barH);
    }
  }
}

function renderBoss() {
  if (!boss || !boss.alive) return;

  const time = performance.now() / 1000;

  // Glow
  ctx.strokeStyle = boss.color;
  ctx.lineWidth = 3 + Math.sin(time * 4) * 2;
  ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.radius + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Freeze glow
  if (boss.freezeTimer > 0) {
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Body
  ctx.fillStyle = boss.color;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
  ctx.fill();

  // Spikes
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time * 0.5;
    const sx = boss.x + Math.cos(angle) * (boss.radius + 12);
    const sy = boss.y + Math.sin(angle) * (boss.radius + 12);
    ctx.fillStyle = '#ff1144';
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(boss.x - 15, boss.y - 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(boss.x + 15, boss.y - 8, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(boss.x - 15, boss.y - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(boss.x + 15, boss.y - 5, 4, 0, Math.PI * 2);
  ctx.fill();

  // Telegraph
  if (boss.telegraphing) {
    const alpha = (1 - boss.telegraphTimer / BOSS_TELEGRAPH_DURATION) * 0.7;
    ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.lineWidth = 3 + (1 - boss.telegraphTimer / BOSS_TELEGRAPH_DURATION) * 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(boss.x, boss.y + boss.radius);
    ctx.lineTo(cannon.x, cannon.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Boss HP bar (top center)
  const barW = 300;
  const barH = 20;
  const barX = canvas.width / 2 - barW / 2;
  const barY = 40;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(barX - 5, barY - 25, barW + 10, barH + 30);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BOSS', canvas.width / 2, barY - 8);

  ctx.fillStyle = '#333333';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(barX, barY, barW * Math.max(0, boss.hp / boss.maxHp), barH);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);
}

function renderBossProjectiles() {
  for (const bp of bossProjectiles) {
    if (!bp.alive) continue;
    // Glow
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, bp.radius + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff2222';
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, bp.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * (1 + (1 - alpha) * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderHUD() {
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px monospace';

  // Text shadow
  ctx.fillStyle = '#000000';
  ctx.fillText('Level: ' + level, 12, 27);
  ctx.fillText('Score: ' + player.score, 12, 52);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Level: ' + level, 10, 25);
  ctx.fillText('Score: ' + player.score, 10, 50);

  // HP hearts
  ctx.textAlign = 'right';
  for (let i = 0; i < player.maxHp; i++) {
    const hx = canvas.width - 30 - i * 28;
    const hy = 25;
    if (i < player.hp) {
      drawHeart(hx, hy, 10, '#ff3333', true);
    } else {
      drawHeart(hx, hy, 10, '#ff3333', false);
    }
  }

  // Upgrade indicators
  ctx.textAlign = 'center';
  ctx.font = '14px monospace';
  const indicators = [];
  if (player.upgrades.fireRate > 0) indicators.push('FR x' + player.upgrades.fireRate);
  if (player.upgrades.firePower > 0) indicators.push('FP x' + player.upgrades.firePower);
  if (player.upgrades.freeze > 0) indicators.push('FREEZE');
  if (player.upgrades.fire > 0) indicators.push('FIRE');

  const indY = canvas.height - 70;
  const totalIndW = indicators.length * 80 + (indicators.length - 1) * 10;
  const indStartX = canvas.width / 2 - totalIndW / 2;
  for (let i = 0; i < indicators.length; i++) {
    const ix = indStartX + i * 90 + 40;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(ix - 35, indY - 10, 70, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(indicators[i], ix, indY + 5);
  }
}

function drawHeart(x, y, size, color, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(-size, -size * 0.3, -size, -size, 0, -size * 0.5);
  ctx.bezierCurveTo(size, -size, size, -size * 0.3, 0, size * 0.3);
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function renderBetweenLevels() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('Level ' + (level - 1) + ' Complete!', canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = '20px monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('Next: Level ' + level, canvas.width / 2, canvas.height / 2 + 30);
}

function renderChest() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const time = performance.now() / 1000;

  // Sparkle particles
  for (let i = 0; i < 4; i++) {
    const angle = time * 2 + (i / 4) * Math.PI * 2;
    const sx = cx + Math.cos(angle) * 50;
    const sy = cy + Math.sin(angle) * 30;
    ctx.fillStyle = '#ffdd00';
    ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Chest box
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(cx - 35, cy - 25, 70, 50);

  // Chest lid
  ctx.fillStyle = '#A0522D';
  ctx.fillRect(cx - 38, cy - 28, 76, 18);

  // Gold trim
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 35, cy - 25, 70, 50);
  ctx.strokeRect(cx - 38, cy - 28, 76, 18);

  // Lock
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(cx - 5, cy - 5, 10, 12);
  ctx.beginPath();
  ctx.arc(cx, cy - 5, 7, Math.PI, 0);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('Click to Open', cx, cy + 55);
}

function renderUpgradeOverlay() {
  // Overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 32px monospace';
  ctx.fillText('Choose an Upgrade', canvas.width / 2, canvas.height / 2 - 90);

  // Option boxes
  const boxW = 260, boxH = 120, gap = 30;
  const totalW = upgradeOptions.length * boxW + (upgradeOptions.length - 1) * gap;
  const startX = canvas.width / 2 - totalW / 2;
  const boxY = canvas.height / 2 - boxH / 2 + 20;

  for (let i = 0; i < upgradeOptions.length; i++) {
    const bx = startX + i * (boxW + gap);
    const key = upgradeOptions[i];

    // Box background
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(bx, boxY, boxW, boxH);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, boxY, boxW, boxH);

    // Name
    let nameColor = '#ffffff';
    if (key === 'freeze') nameColor = '#00ccff';
    if (key === 'fire') nameColor = '#ff6600';
    if (key === 'hp') nameColor = '#ff3333';

    ctx.fillStyle = nameColor;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(getUpgradeName(key), bx + boxW / 2, boxY + 40);

    // Description
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px monospace';
    ctx.fillText(getUpgradeDesc(key), bx + boxW / 2, boxY + 70);

    // Hover hint
    ctx.fillStyle = '#666666';
    ctx.font = '12px monospace';
    ctx.fillText('[ Click to Select ]', bx + boxW / 2, boxY + 100);
  }
}

function renderGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3333';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = '24px monospace';
  ctx.fillText('Score: ' + player.score, canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText('Level: ' + level, canvas.width / 2, canvas.height / 2 + 45);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '20px monospace';
  ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

// ============================================================
// GAME LOOP
// ============================================================
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap dt
  lastTime = timestamp;

  if (state === STATES.BETWEEN_LEVELS) {
    updateBetweenLevels(dt);
  } else {
    update(dt);
  }

  render();
  requestAnimationFrame(gameLoop);
}

lastTime = performance.now();
requestAnimationFrame(gameLoop);
