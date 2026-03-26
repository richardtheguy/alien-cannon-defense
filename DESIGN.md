# Alien Cannon Defense - Game Design Document

## Overview
A tap/click-to-shoot alien defense game where the player controls a cannon at the bottom of a plain field, shooting down waves of aliens across increasingly difficult levels. Every 5 levels a mini boss appears. Treasure chests drop after boss kills and every 3rd non-boss level cleared, offering upgrades.

---

## Core Mechanics

### Player Cannon
- Fixed at bottom-center of the screen
- Rotates to aim toward the mouse/tap position
- Fires projectiles on click/tap in the aimed direction
- Has a health bar (3 HP base, max 5 HP, boss attacks reduce it)
- HP can increase via: boss level recovery (+1 at start of boss level) and upgrade exhaustion chests (+1)
- Game over when HP reaches 0

### Shooting
- Base fire rate: 1 shot per 0.5 seconds (upgradeable)
- Base damage: 1 per bullet (upgradeable)
- Bullets travel in a straight line from cannon toward the aim point
- Bullets despawn when they leave the screen, hit an alien, or hit a boss projectile (one bullet = one hit, no piercing)

### Battlefield
- Plain green/brown field background (flat, no obstacles)
- Full browser window canvas
- Aliens spawn from the top and move downward
- If an alien reaches the bottom, the player loses 1 HP
- Player recovers +1 HP at the start of each boss level (capped at max 5 HP)

---

## Aliens

### Types by Level Tier

| Type    | Color  | HP | Speed (px/frame) | Points | Appears                                        |
|---------|--------|----|-------------------|--------|------------------------------------------------|
| Scout   | Green  | 1  | 2.5               | 10     | Level 1+                                      |
| Soldier | Yellow | 2  | 1.8               | 25     | Level 2+                                      |
| Tank    | Red    | 4  | 1.0               | 50     | Level 4+                                      |
| Elite   | Purple | 6  | 1.8               | 75     | Level 7+                                      |
| Swarm   | Cyan   | 1  | 3.5               | 15     | Level 5+ (burst of up to 5 at once, ignores stagger; consumes 5 wave slots, or remaining slots if fewer than 5 left)|

### Spawn Timing
- Aliens spawn in staggered intervals (one every 0.8s) at the top of the screen at random x positions
- All aliens for the wave are queued at level start; the wave ends when every queued alien is killed or reaches the bottom
- This prevents screen flooding at higher levels

### Base Counts & Scaling
- **Level 1 base count**: 5 aliens
- Each level increases alien count: `floor(5 + (level - 1) * 1.4)` (level 1 = 5, level 2 = 6, level 3 = 7, ...)
- Alien HP gets a +1 bonus every 5 levels: `baseHP + floor(level / 5)`
- Speed scales by +0.1 px/frame every 3 levels: `baseSpeed + floor(level / 3) * 0.1`

---

## Levels & Waves

- **Each level** = 1 wave of aliens to clear
- Level number is displayed on screen
- Clearing all aliens in a wave completes the level
- Short 3-second pause between levels

### Mini Boss (Every 5 Levels: 5, 10, 15, 20...)
- Large alien (3x size of normal)
- Boss HP scales: `20 + (bossNumber * 15)`
- Boss points: `200 + (bossNumber * 100)`
- **Boss fights solo** - no regular aliens spawn during boss levels
- **Boss attacks the player**: fires projectiles aimed at the cannon every 2.5 seconds
  - Boss projectiles travel at 2.5 px/frame toward the cannon's fixed position and deal 1 HP damage on hit
  - **Counterplay — shoot them down**: boss projectiles have **3 HP** and can be destroyed by the player's bullets before they reach the cannon. They use the same collision detection as aliens (circle-circle, radius 8px)
  - A red telegraph line flashes from the boss to the cannon for 0.6s before the projectile fires, giving the player time to shift aim toward the incoming shot
  - This creates a skill-based trade-off: time spent shooting boss projectiles is time not spent damaging the boss, extending the fight and increasing total projectiles faced
  - Projectiles despawn when they leave the screen or are destroyed
- Boss moves side-to-side across the top of the screen at 1.5 px/frame
- Defeating the boss completes the level: all in-flight boss projectiles are immediately despawned (no post-death damage) and the boss always drops a treasure chest
- Boss has a visible health bar

---

## Treasure Chests & Upgrades

### Spawn Rules
- Guaranteed drop after every mini boss
- Also spawns after every 3rd non-boss level completed (tracked by a counter that increments on non-boss clears: chest at counts 3, 6, 9...)
- Chest appears at center of screen; player clicks it to open
- Game pauses while upgrade selection is shown

### Upgrade Options (Pick 1 of 2 offered randomly)

| Upgrade        | Effect                              | Max Stacks | Notes                              |
|----------------|-------------------------------------|------------|------------------------------------|
| **Fire Rate**  | -0.08s between shots                | 5          | Min delay: 0.1s                   |
| **Fire Power** | +1 bullet damage                    | 5          | Stacks additively                 |
| **Freeze**     | Bullets slow aliens by 50% for 2s   | 1          | Mutually exclusive with Fire      |
| **Fire**       | Bullets deal +1 burn damage over 3s | 1          | Mutually exclusive with Freeze    |

### Status Effect Rules
- **Freeze**: On hit, the alien's speed is halved for 2 seconds. Subsequent freeze hits **refresh** the 2s timer but do not stack the slow (always 50%). Freeze affects bosses.
- **Fire**: On hit, the alien takes 1 burn damage total over 3 seconds (0.33 dmg/s). Subsequent fire hits **refresh** the 3s timer and **reset** the burn — they do **not** stack. This prevents rapid-fire builds from creating overlapping burn that trivializes HP pools. Fire affects bosses.
- An alien can only have one status effect active at a time (moot since the player can only have Freeze or Fire, never both).

### Mutual Exclusion Rule
- If the player has **Freeze**, **Fire** will never appear as an option (and vice versa)
- If neither is picked yet, both can appear
- Fire Rate and Fire Power are always eligible

### Upgrade Exhaustion
- If all upgrades are maxed out, the chest grants +1 HP instead (capped at max 5 HP)
- If only 1 upgrade is eligible, the chest offers that upgrade vs +1 HP

---

## UI Layout

```
+-----------------------------------+
|  Level: 3    Score: 450   HP: !!!  |
|                                   |
|    [alien]  [alien]  [alien]      |
|        [alien]    [alien]         |
|                                   |
|           [chest]                 |   <-- (when spawned)
|                                   |
|              .                    |   <-- bullet
|              .                    |
|             /|\                   |
|            --A--                  |   <-- cannon
+-----------------------------------+
```

### HUD Elements
- **Top-left**: Level number, Score
- **Top-right**: HP hearts
- **Top-center**: Boss HP bar (during boss fights)
- **Bottom**: Active upgrades shown as icons

### Screens
1. **Title Screen** - "Alien Cannon Defense" + "Click to Start"
2. **Gameplay** - Main game loop
3. **Between Levels** - "Level X Complete" 3-second pause (skipped after boss kills)
4. **Chest** - Clickable treasure chest on the playfield, "Click to Open"
5. **Upgrade Selection** - Modal overlay with 2 upgrade choices
6. **Game Over** - Final score + level reached + "Click to Restart"

---

## Technical Spec

- **Web app** served via a local Node.js dev server
- **Project structure**:
  - `server.js` - Simple Node.js HTTP server (no dependencies, uses built-in `http` module)
  - `public/index.html` - Main game page
  - `public/style.css` - Game styles
  - `public/game.js` - Game logic
- **HTML5 Canvas** for all rendering (no external assets - all drawn with shapes)
- **requestAnimationFrame** game loop at 60fps
- Touch and mouse input supported — **unified firing model** across both:
  - Cannon aims toward the pointer (mouse or touch) position at all times
  - **Click/tap fires one shot**; **hold/long-press enables auto-fire** at the current fire rate after a 0.3s hold threshold
  - This keeps fire-rate upgrades equally meaningful on both platforms
  - On mobile, touch-move updates aim direction while held
- No external dependencies - runs with just Node.js
- All game state is client-side; the server only serves static files
- **Local dev**: `node server.js` then open `http://localhost:3000` in Chrome
- **Deployment**: Cloudflare Quick Tunnel (`cloudflared tunnel --url http://localhost:3000`) to expose publicly via a temporary `*.trycloudflare.com` URL

### Game Loop
1. Process input (aim direction from pointer position, fire if click/hold)
2. Update player bullets (move forward)
3. **Collision pass** (single pass, each bullet checked once):
   - Player bullet vs aliens: damage alien, despawn bullet
   - Player bullet vs boss projectiles: damage boss projectile, despawn bullet
   - Boss projectile vs cannon: damage player, despawn boss projectile
4. Update aliens (move downward, apply status effects, check if reached bottom)
5. Update boss if boss level (move side-to-side, telegraph timer, spawn new projectiles)
6. Update boss projectiles (move toward cannon)
7. Check level completion (all aliens/boss dead)
8. Render everything

### Collision Detection
- Circle-circle for player bullets vs aliens
- Circle-circle for player bullets vs boss projectiles (radius 8px, 3 HP)
- Circle-rectangle for boss projectiles vs cannon (cannon hitbox 60px wide x 40px tall)

---

## Visual Style
- **Background**: Plain grass-green field with subtle ground line
- **Cannon**: Dark gray triangle/turret shape
- **Bullets**: Small bright yellow circles (blue if Freeze, orange if Fire)
- **Aliens**: Drawn as simple colored shapes with eyes
- **Boss**: Larger alien with spikes/horns, glowing outline
- **Treasure chest**: Brown box with gold trim, sparkle effect
- **Effects**: Small particle burst on alien death, screen flash on player damage
