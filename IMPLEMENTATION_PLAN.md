# Alien Cannon Defense - Implementation Plan

This document breaks the design (DESIGN.md) into ordered, buildable phases. Each phase produces a testable result. Later phases depend on earlier ones.

---

## Phase 1: Project Skeleton & Static Server

**Files**: `server.js`, `public/index.html`, `public/style.css`, `public/game.js`

### Tasks
1. Create `server.js` — Node.js HTTP server using built-in `http` and `fs` modules
   - Serve static files from `public/`
   - Path traversal guard: reject paths outside `public/`
   - MIME types for `.html`, `.css`, `.js`
   - Listen on port 3000
2. Create `public/index.html` — minimal HTML page with a single `<canvas id="game">` and script/style links
3. Create `public/style.css` — full-bleed canvas, no scroll, `touch-action: none`, no user-select
4. Create `public/game.js` — empty game shell:
   - Get canvas and 2d context
   - Resize canvas to `window.innerWidth` x `window.innerHeight` (and on resize)
   - Start a `requestAnimationFrame` loop that clears the canvas each frame

### Verify
- `node server.js` → open `localhost:3000` → blank canvas fills the browser window, no console errors

---

## Phase 2: Game States & Screens

**File**: `public/game.js`

### Tasks
1. Define game state enum: `TITLE`, `PLAYING`, `BETWEEN_LEVELS`, `CHEST`, `UPGRADE`, `GAME_OVER`
2. Implement title screen renderer
   - Draw "Alien Cannon Defense" centered, large font
   - Draw "Click to Start" below
   - On click/tap while in `TITLE` state → transition to `PLAYING`, init level 1
3. Implement game over screen renderer
   - Draw "Game Over", final score, level reached
   - Draw "Click to Restart"
   - On click/tap → reset all state (HP, score, level, upgrades, arrays), transition to `PLAYING` and init level 1
4. Implement between-levels pause
   - Show "Level X Complete" for 3 seconds, then transition to next level

### Verify
- Click through: title → playing (blank field) → (manually trigger game over) → game over → click restart → playing level 1

---

## Phase 3: Battlefield & Cannon

**File**: `public/game.js`

### Tasks
1. Render the battlefield
   - Green (`#4a7c2e`) fill for the field
   - Darker ground strip at the bottom 60px
2. Define cannon state: `{ x, y, angle, hitboxW: 60, hitboxH: 40 }`
   - Position: `x = canvas.width / 2`, `y = canvas.height - 30`
   - Recalculate on resize
3. Render the cannon
   - Base: dark gray rectangle (60x20) centered at cannon position
   - Barrel: dark gray rectangle (10x35) rotated to `cannon.angle`
4. Input handling — unified model
   - Track pointer position (mousemove, touchmove, touchstart)
   - Calculate `cannon.angle = atan2(pointerX - cannon.x, cannon.y - pointerY)`
   - Clamp angle so the barrel never aims below horizontal
   - On mousedown/touchstart: set `pointerDown = true`, record `pointerDownTime`
   - On mouseup/touchend: set `pointerDown = false`
   - Each frame: if `pointerDown` and held < 0.3s → fire on initial press only; if held >= 0.3s → auto-fire at current fire rate

### Verify
- Cannon appears at bottom center, barrel rotates to follow mouse/touch, does not aim downward

---

## Phase 4: Shooting

**File**: `public/game.js`

### Tasks
1. Define player state: `{ hp: 3, maxHp: 5, score: 0, fireRate: 0.5, damage: 1, fireTimer: 0, element: null, upgrades: { fireRate: 0, firePower: 0, freeze: 0, fire: 0 } }`
2. Define bullet object: `{ x, y, vx, vy, radius: 4, alive: true }`
3. On fire (per input rules from Phase 3):
   - Calculate velocity vector from cannon tip in the direction of `cannon.angle`
   - Bullet speed: 8 px/frame
   - Push new bullet into `bullets[]` array
   - Reset `fireTimer`
4. Each frame: update bullet positions, remove bullets that leave the canvas
5. Render bullets as small circles
   - Default: yellow (`#ffdd00`)
   - With Freeze upgrade: blue (`#00ccff`)
   - With Fire upgrade: orange (`#ff6600`)

### Verify
- Click/tap fires yellow bullets from cannon tip in aimed direction, bullets leave screen and are cleaned up

---

## Phase 5: Aliens & Waves

**File**: `public/game.js`

### Tasks
1. Define alien type configs (from design table):
   ```
   SCOUT:   { color: '#33cc33', baseHp: 1, baseSpeed: 2.5, points: 10,  radius: 15, minLevel: 1 }
   SOLDIER: { color: '#cccc00', baseHp: 2, baseSpeed: 1.8, points: 25,  radius: 18, minLevel: 2 }
   TANK:    { color: '#cc3333', baseHp: 4, baseSpeed: 1.0, points: 50,  radius: 22, minLevel: 4 }
   ELITE:   { color: '#9933cc', baseHp: 6, baseSpeed: 1.8, points: 75,  radius: 20, minLevel: 7 }
   SWARM:   { color: '#00cccc', baseHp: 1, baseSpeed: 3.5, points: 15,  radius: 12, minLevel: 5 }
   ```
2. Define alien object: `{ type, x, y, hp, maxHp, speed, points, radius, alive, freezeTimer: 0, burnTimer: 0, burnDamageLeft: 0 }`
3. Wave generation for a given level:
   - Calculate alien count: `floor(5 + (level - 1) * 1.4)`
   - Filter eligible types by `minLevel <= level`
   - Randomly pick types from eligible pool, weighted toward simpler types at lower levels
   - For Swarm picks: one Swarm pick consumes **5 slots** from the wave count and spawns 5 Swarm aliens as a burst group. If fewer than 5 slots remain, fill remaining slots with Swarm aliens (e.g., 3 slots left = 3 Swarm aliens in the burst)
   - HP scaling: `baseHp + floor(level / 5)`
   - Speed scaling: `baseSpeed + floor(level / 3) * 0.1`
   - Build a spawn queue with stagger timing (0.8s apart, Swarm bursts share the same timestamp)
4. Spawn system: each frame, check if `spawnTimer >= 0.8s` and queue has entries → spawn next alien at random x (clamped to stay on screen), y = -radius
5. Alien movement: each frame, move alien downward by its speed. If `y > canvas.height + radius` → alien reached bottom, remove it, player loses 1 HP. **If `player.hp <= 0` → transition to `GAME_OVER`**
6. Render aliens: colored circles with two white-dot eyes
7. Track `aliensRemaining` counter (decrements on kill or bottom-reach). When 0 → level complete

### Verify
- Level 1 spawns 5 green scouts that drift downward. They appear one at a time. Reaching the bottom costs HP.

---

## Phase 6: Collision — Bullets vs Aliens

**File**: `public/game.js`

### Tasks
1. Single collision pass each frame, iterating `bullets[]`:
   - For each alive bullet, check against each alive alien
   - Circle-circle test: `dist(bullet, alien) < bullet.radius + alien.radius`
   - On hit: reduce alien HP by `player.damage`, mark bullet as dead
   - If alien HP <= 0: mark alien dead, add points to score, decrement `aliensRemaining`, spawn particle burst
2. Status effect application on hit:
   - If player has Freeze: set `alien.freezeTimer = 2.0` (seconds). Alien speed becomes `baseSpeed * 0.5` while timer > 0. Refresh on subsequent hits (reset timer, don't stack slow).
   - If player has Fire: set `alien.burnTimer = 3.0`, `alien.burnDamageLeft = 1.0`. Each frame, tick burn: `dmg = 0.33 * dt`, subtract from HP and burnDamageLeft. On subsequent hit, reset both timer and burnDamageLeft to full (no stacking).
3. Status effect tick in alien update step:
   - Decrement `freezeTimer` by dt each frame, restore normal speed when expired
   - Decrement `burnTimer` by dt, apply burn damage, stop when timer or burnDamageLeft hits 0
4. Particle burst on alien death: spawn 6-8 small circles in the alien's color that expand outward and fade over 0.3s

### Verify
- Shooting aliens reduces their HP, kills them, awards points. Status effects (tested later with upgrades) have code paths ready.

---

## Phase 7: HUD

**File**: `public/game.js`

### Tasks
1. **Top-left**: Draw "Level: X" and "Score: Y" in white, 20px font, with dark text shadow
2. **Top-right**: Draw HP as red heart shapes (filled = current HP, outlined = lost HP up to maxHp)
3. **Bottom-center**: Draw active upgrade icons as small labeled boxes (e.g., "FR x2", "FP x3", "FREEZE", "FIRE")
4. All HUD renders on top of gameplay (drawn last in render step)

### Verify
- Level, score, hearts, and upgrade indicators display correctly and update in real time

---

## Phase 8: Level Progression

**File**: `public/game.js`

### Tasks
1. When `aliensRemaining === 0` and game state is `PLAYING`:
   - Transition to `BETWEEN_LEVELS` state
   - Show "Level X Complete" for 3 seconds
   - Increment `nonBossClearCount` (if not a boss level)
   - Increment level counter (so `level` now refers to the upcoming level)
   - Check if upcoming level is a boss level (`level % 5 === 0`)
     - If yes: grant +1 HP (capped at maxHp) before boss starts
   - Check if chest should spawn:
     - After boss levels: always
     - After non-boss levels: if `nonBossClearCount % 3 === 0`
   - If chest: transition to `CHEST` state (chest appears on the field, must be clicked to open)
   - Otherwise: if upcoming level is a boss level, create boss object (no alien wave); if regular level, generate alien wave. Transition to `PLAYING`

### Verify
- Completing level 1 shows pause, then level 2 starts with more aliens. Non-boss clear counter tracks correctly.

---

## Phase 9: Boss Fights

**File**: `public/game.js`

### Tasks
1. Detect boss level: `level % 5 === 0`
2. Calculate `bossNumber = level / 5`
3. Create boss object:
   ```
   {
     x, y: 80,
     hp: 20 + bossNumber * 15,
     maxHp: (same),
     points: 200 + bossNumber * 100,
     radius: 45 (3x normal),
     speed: 1.5,
     direction: 1,
     attackTimer: 0,
     telegraphTimer: 0,
     telegraphing: false,
     alive: true,
     freezeTimer: 0,
     burnTimer: 0,
     burnDamageLeft: 0
   }
   ```
4. Boss movement: move side-to-side, reverse direction when hitting screen edges (with padding)
   - Apply freeze effect: if `boss.freezeTimer > 0`, boss moves at half speed (0.75 px/frame instead of 1.5). Attack timer is unaffected by freeze
5. Boss status effect tick (same logic as alien status effects in Phase 6):
   - Decrement `boss.freezeTimer` by dt each frame; restore normal speed when expired
   - Decrement `boss.burnTimer` by dt; apply burn damage (`0.33 * dt` per frame); stop when timer or burnDamageLeft hits 0
   - Check boss death from burn damage: if `boss.hp <= 0`, trigger boss death sequence
6. Boss attack cycle:
   - `attackTimer` counts up each frame
   - At 1.9s (2.5s - 0.6s telegraph): start telegraph → set `telegraphing = true`, `telegraphTimer = 0.6`
   - Draw red line from boss center to cannon center during telegraph
   - When telegraph expires: spawn boss projectile aimed at cannon, reset `attackTimer`
7. Boss projectile object: `{ x, y, vx, vy, radius: 8, hp: 3, alive: true }`
   - Velocity: direction vector from boss to cannon, normalized, scaled by 2.5 px/frame
8. Collision: player bullets vs boss projectiles (circle-circle, same pass as Phase 6)
   - On hit: reduce projectile HP by `player.damage`, despawn bullet
   - If projectile HP <= 0: destroy projectile
9. Collision: boss projectile vs cannon (circle-rectangle)
   - `cannon hitbox: { x - 30, y - 20, 60, 40 }`
   - On hit: player loses 1 HP, despawn projectile, screen flash red. **If `player.hp <= 0` → transition to `GAME_OVER`**
10. Collision: player bullets vs boss (circle-circle, same pass)
    - On hit: damage boss, apply status effects (same rules as aliens), despawn bullet
11. Boss death: set `alive = false`, despawn all boss projectiles, award points, trigger level complete
12. Render boss: large colored shape with spikes, glowing outline, eyes
13. Render boss HP bar: top-center of screen, red bar over dark background, "BOSS" label

### Verify
- Level 5 spawns a boss. Boss moves, telegraphs, fires. Player can shoot projectiles down. Boss dies, projectiles clear, chest spawns.

---

## Phase 10: Treasure Chests & Upgrades

**File**: `public/game.js`

### Tasks
1. **CHEST state** (entered from Phase 8 when chest is due):
   - Game is paused (no alien/bullet updates)
   - Render a treasure chest graphic at center of the playfield (brown box, gold trim, sparkle particles)
   - Draw "Click to Open" text below the chest
   - On click/tap on the chest → transition to `UPGRADE` state
   - Chest has a clickable hitbox (80x60 centered on screen)
2. **UPGRADE state** — determine eligible upgrades:
   - Fire Rate: eligible if `upgrades.fireRate < 5`
   - Fire Power: eligible if `upgrades.firePower < 5`
   - Freeze: eligible if `upgrades.freeze === 0` AND `upgrades.fire === 0`
   - Fire: eligible if `upgrades.fire === 0` AND `upgrades.freeze === 0`
   - If 0 eligible: grant +1 HP, skip selection, resume
   - If 1 eligible: offer that upgrade vs +1 HP
   - If 2+ eligible: pick 2 at random, offer as choices
3. Render upgrade selection overlay:
   - Semi-transparent dark overlay
   - "Choose an Upgrade" text at top
   - Two clickable option boxes, each showing upgrade name, description, and current stack count
4. On click/tap on an option:
   - Apply the upgrade:
     - Fire Rate: `player.fireRate = max(0.1, player.fireRate - 0.08)`, increment stack
     - Fire Power: `player.damage += 1`, increment stack
     - Freeze: `player.element = 'freeze'`, set stack to 1
     - Fire: `player.element = 'fire'`, set stack to 1
     - +1 HP: `player.hp = min(player.hp + 1, player.maxHp)`
   - Transition back: if current level is a boss level, create boss object (no alien wave); if regular level, generate alien wave. Set state to `PLAYING`

### Verify
- Chest appears after level 5 boss and every 3rd non-boss clear. Picking upgrades applies them correctly. Freeze blocks Fire from appearing and vice versa. Max stacks respected.

---

## Phase 11: Visual Polish

**File**: `public/game.js`

### Tasks
1. Particle system: array of `{ x, y, vx, vy, color, life, maxLife, radius }`, rendered as fading circles
2. Alien death burst: 6-8 particles in alien color, expand outward, fade over 0.3s
3. Boss death burst: 15-20 particles, larger, slower fade (0.6s)
4. Player damage flash: screen tints red for 0.15s
5. Bullet trail: draw a fading short line behind each bullet in its color
6. Boss telegraph: pulsing red line with increasing opacity during 0.6s telegraph phase
7. Treasure chest sparkle: 3-4 small yellow particles orbiting the chest icon
8. Boss glow: pulsing outer ring on the boss sprite

### Verify
- Deaths have particle bursts, damage flashes red, boss telegraph is visible, chest sparkles

---

## Phase 12: Final Integration & Testing

### Tasks
1. Full playthrough test: title → levels 1-5 → boss → chest → levels 6-10 → boss 2
2. Verify scaling: alien counts, HP, and speed increase correctly per formulas
3. Verify chest cadence: boss drops + every 3rd non-boss clear
4. Verify upgrade exhaustion: max all upgrades, next chest gives HP
5. Verify mutual exclusion: pick Freeze, confirm Fire never appears
6. Verify boss counterplay: shoot down boss projectiles, telegraph is visible
7. Verify boss death clears projectiles
8. Verify HP recovery at boss level start
9. Verify game over → restart resets all state
10. Test window resize during gameplay
11. Test on mobile (touch input, auto-fire on hold)
12. Test via Cloudflare tunnel: `cloudflared tunnel --url http://localhost:3000`

### Verify
- Complete game loop works end-to-end with no crashes, no stale state, no console errors

---

## File Summary

| File | Phase | Purpose |
|------|-------|---------|
| `server.js` | 1 | Static file server |
| `public/index.html` | 1 | Canvas page |
| `public/style.css` | 1 | Full-bleed styles |
| `public/game.js` | 2-11 | All game logic, built incrementally |

## Build Order Dependencies

```
Phase 1 (skeleton)
  -> Phase 2 (screens)
    -> Phase 3 (cannon)
      -> Phase 4 (shooting)
        -> Phase 5 (aliens)
          -> Phase 6 (collision)
            -> Phase 7 (HUD)
            -> Phase 8 (level progression)
              -> Phase 9 (boss)
              -> Phase 10 (chests/upgrades)
                -> Phase 11 (polish)
                  -> Phase 12 (testing)
```
