# Alien Cannon Defense - Testing Plan

This document defines all tests to verify the game works correctly before and after deployment. Tests are organized by system and ordered to match the implementation phases.

---

## How to Use This Plan

1. Run tests in order — later tests depend on earlier systems working
2. Each test has a clear action and expected result
3. Mark each test PASS or FAIL as you go
4. If a test fails, fix the issue before continuing to the next section
5. Re-run the full plan after any significant code change

---

## T1: Server & Page Load

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 1.1 | Run `node server.js` | Console prints "Alien Cannon Defense running at http://localhost:3000" | |
| 1.2 | Open `http://localhost:3000` in Chrome | Page loads with no console errors (F12 → Console) | |
| 1.3 | Check canvas | Canvas fills the entire browser window, no scrollbars | |
| 1.4 | Resize browser window | Canvas resizes to match new window dimensions | |
| 1.5 | Run `curl --path-as-is http://localhost:3000/../server.js` in terminal | Response body does NOT contain the contents of server.js (any non-200 error status is acceptable) | |

---

## T2: Game States & Screen Transitions

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 2.1 | Load the page | Title screen: "Alien Cannon Defense" + "Click to Start" centered | |
| 2.2 | Click "Click to Start" | Game transitions to PLAYING, level 1 begins | |
| 2.3 | Let all aliens reach the bottom until HP = 0 | "Game Over" screen with final score and level reached | |
| 2.4 | Click "Click to Restart" on game over screen | Game restarts at level 1, score = 0, HP = 3, no upgrades | |
| 2.5 | Kill all aliens in level 1 | "Level 1 Complete" shown, 3-second pause before level 2 | |

---

## T3: Cannon & Aiming

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 3.1 | Observe cannon position | Cannon base centered at bottom of screen | |
| 3.2 | Move mouse to top-left | Barrel rotates to aim toward top-left | |
| 3.3 | Move mouse to top-right | Barrel rotates to aim toward top-right | |
| 3.4 | Move mouse to directly above cannon | Barrel points straight up | |
| 3.5 | Move mouse below the cannon | Barrel clamps to horizontal, does not aim downward | |
| 3.6 | Resize window | Cannon repositions to new bottom-center | |

---

## T4: Shooting

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 4.1 | Click once | One bullet fires from cannon tip toward aim point | |
| 4.2 | Click rapidly (faster than 0.5s) | Bullets fire at base rate (0.5s interval), clicks during cooldown are ignored | |
| 4.3 | Hold mouse button for < 0.3s then release | Only the initial click shot fires, no auto-fire | |
| 4.4 | Hold mouse button for > 0.3s | Auto-fire engages at current fire rate | |
| 4.5 | Fire bullet off-screen | Bullet disappears when it leaves canvas, no memory leak | |
| 4.6 | Observe bullet color (no upgrades) | Yellow (#ffdd00) | |

---

## T5: Aliens & Waves

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 5.1 | Start level 1 | 5 green Scout aliens spawn from the top | |
| 5.2 | Watch spawn timing | Aliens appear one at a time, ~0.8s apart | |
| 5.3 | Observe alien spawn positions | Random x positions, all within screen bounds | |
| 5.4 | Watch alien movement | Aliens move straight downward at their defined speed | |
| 5.5 | Let a Scout reach the bottom | Scout disappears, HP decreases by 1 | |
| 5.6 | Start level 2 multiple times | Soldiers (yellow, 2 HP) can appear — they are eligible but not guaranteed per wave | |
| 5.7 | Start level 4 multiple times | Tanks (red, 4 HP, slow) can appear — eligible but not guaranteed per wave | |
| 5.8 | Start level 5 | Boss level — no regular aliens (tested in T9) | |
| 5.9 | Start level 7+ multiple times | Elite aliens (purple, 6 HP) can appear — eligible but not guaranteed per wave | |
| 5.10 | Play several non-boss levels at level 5+ | Swarm aliens (cyan, burst of up to 5) can appear — eligible but not guaranteed per wave. When they do appear, they spawn simultaneously ignoring stagger | |

### T5.1: Scaling Verification

| # | Level | Expected Count | Expected HP Bonus | Expected Speed Bonus |
|---|-------|---------------|-------------------|---------------------|
| 5.11 | 1 | 5 | +0 | +0.0 |
| 5.12 | 2 | 6 | +0 | +0.0 |
| 5.13 | 3 | 7 | +0 | +0.1 |
| 5.14 | 6 | 12 | +1 | +0.2 |
| 5.15 | 11 | 19 | +2 | +0.3 |

Formula check: count = `floor(5 + (level - 1) * 1.4)`, HP bonus = `floor(level / 5)`, speed bonus = `floor(level / 3) * 0.1`

---

## T6: Collision & Combat

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 6.1 | Shoot a Scout (1 HP) | One bullet kills it, bullet disappears on hit | |
| 6.2 | Shoot a Soldier (2 HP) | First bullet damages, second kills | |
| 6.3 | Shoot a Tank (4 HP) | Takes 4 hits to kill with base damage | |
| 6.4 | Kill any alien | Score increases by that alien's point value | |
| 6.5 | Kill any alien | Particle burst appears in the alien's color | |
| 6.6 | Verify no bullet piercing | A bullet that hits an alien does not continue to hit others behind it | |
| 6.7 | Kill all aliens in a wave | Level completes, aliensRemaining reaches 0 | |
| 6.8 | Mix of kills and bottom-reaches | Level still completes when all queued aliens are accounted for | |

---

## T7: HUD

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 7.1 | Start a game | "Level: 1" and "Score: 0" visible at top-left | |
| 7.2 | Kill an alien | Score updates in real time | |
| 7.3 | Complete a level | Level number increments in HUD | |
| 7.4 | Observe HP display | Red filled hearts = current HP, outlined = lost HP, up to maxHp | |
| 7.5 | Lose 1 HP | One heart changes from filled to outlined | |
| 7.6 | Gain HP (boss level start) | One heart changes from outlined to filled | |
| 7.7 | Pick an upgrade | Upgrade indicator appears at bottom-center (e.g., "FR x1") | |
| 7.8 | Stack an upgrade | Indicator updates count (e.g., "FR x2") | |

---

## T8: Level Progression

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 8.1 | Complete level 1 | 3s pause → level 2 starts with more aliens | |
| 8.2 | Complete level 2 | 3s pause → level 3 starts | |
| 8.3 | Complete level 3 (non-boss clear count = 3) | Chest spawns on the field | |
| 8.4 | Complete level 4 | Level 5 is next — HP recovers +1 (capped at 5) before boss | |
| 8.5 | Complete levels 6 and 7 (non-boss clear counts 5 and 6) | Chest spawns after level 7 (count = 6), not after level 6 (count = 5) | |
| 8.6 | Track non-boss clear counter across the full game | Counter never resets. Chests at counts 3, 6, 9, 12... (maps to levels 3, 7, 11, 14, 18...) | |
| 8.7 | Verify boss levels: 5, 10, 15, 20 | Each triggers boss fight, not regular wave | |

---

## T9: Boss Fights

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 9.1 | Reach level 5 | Boss appears, no regular aliens | |
| 9.2 | Observe boss | Large alien (3x size), moves side-to-side at top | |
| 9.3 | Check boss HP bar | Visible at top-center with "BOSS" label | |
| 9.4 | Wait 1.9s | Red telegraph line appears from boss to cannon | |
| 9.5 | Wait 0.6s more (2.5s total) | Boss projectile fires toward cannon | |
| 9.6 | Let boss projectile hit cannon | Player loses 1 HP, screen flashes red | |
| 9.7 | Shoot a boss projectile (3 HP) | Takes 3 base-damage hits to destroy | |
| 9.8 | Verify bullet despawns on projectile hit | Bullet disappears after hitting boss projectile | |
| 9.9 | Shoot the boss | Boss HP bar decreases | |
| 9.10 | Kill the boss | All in-flight projectiles immediately despawn | |
| 9.11 | Boss death | Chest appears on field, points awarded | |
| 9.12 | Let boss kill player (HP → 0) | Game over screen appears | |

### T9.1: Boss Scaling

| # | Level | Boss # | Expected HP | Expected Points |
|---|-------|--------|-------------|-----------------|
| 9.13 | 5 | 1 | 35 | 300 |
| 9.14 | 10 | 2 | 50 | 400 |
| 9.15 | 15 | 3 | 65 | 500 |

Formula check: HP = `20 + bossNumber * 15`, points = `200 + bossNumber * 100`

---

## T10: Treasure Chests & Upgrades

### Chest Interaction

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.1 | Chest spawns after boss/3rd non-boss clear | Chest graphic visible at center of playfield | |
| 10.2 | Observe chest | "Click to Open" text below chest | |
| 10.3 | Click anywhere NOT on chest | Nothing happens, chest stays | |
| 10.4 | Click on chest | Transitions to upgrade selection overlay | |

### Upgrade Selection

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.5 | Upgrade overlay appears | Dark semi-transparent overlay, "Choose an Upgrade", two option boxes | |
| 10.6 | Game state during overlay | Game is paused — no aliens moving, no bullets firing | |
| 10.7 | Click an upgrade option | Upgrade applied, game resumes with next level | |

### Fire Rate Upgrade

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.8 | Pick Fire Rate x1 | Fire interval decreases from 0.50s to 0.42s | |
| 10.9 | Pick Fire Rate x5 (max) | Fire interval = 0.10s (minimum). Fire Rate no longer offered | |

### Fire Power Upgrade

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.10 | Pick Fire Power x1 | Bullet damage increases from 1 to 2 | |
| 10.11 | Shoot a 2 HP Soldier with Fire Power x1 | One bullet kills it | |
| 10.12 | Pick Fire Power x5 (max) | Damage = 6. Fire Power no longer offered | |

### Freeze Upgrade

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.13 | Pick Freeze | Bullet color changes to blue (#00ccff) | |
| 10.14 | Shoot an alien with Freeze | Alien speed halves for 2 seconds | |
| 10.15 | Shoot same alien again within 2s | Freeze timer refreshes (stays slowed), does NOT stack to 75% slow | |
| 10.16 | Wait 2s without shooting alien | Alien returns to normal speed | |
| 10.17 | Shoot boss with Freeze | Boss movement speed halves, attack timer unaffected | |
| 10.18 | Check upgrade options after Freeze | Fire never appears as an option | |

### Fire Upgrade

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.19 | Pick Fire | Bullet color changes to orange (#ff6600) | |
| 10.20 | Shoot an alien with Fire | Alien takes 1 burn damage over 3 seconds (0.33/s) | |
| 10.21 | Shoot same alien again within 3s | Burn timer and damage reset (not stacked) | |
| 10.22 | Observe burn kill | If burn reduces HP to 0, alien dies with particle burst | |
| 10.23 | Shoot boss with Fire | Boss takes burn damage, HP bar decreases over time | |
| 10.24 | Check upgrade options after Fire | Freeze never appears as an option | |

### Mutual Exclusion

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.25 | Have neither Freeze nor Fire, open several chests | Both Freeze and Fire are eligible and can appear — not guaranteed on any single chest since options are randomly selected from the eligible pool | |
| 10.26 | Have Freeze | Fire never offered in any future chest | |
| 10.27 | Have Fire | Freeze never offered in any future chest | |

### Upgrade Exhaustion

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 10.28 | Max Fire Rate (5) + Max Fire Power (5) + have Freeze or Fire | 0 eligible upgrades → chest grants +1 HP | |
| 10.29 | Only 1 upgrade eligible | Chest offers that upgrade vs +1 HP | |
| 10.30 | HP at max (5) + all upgrades maxed | Chest grants +1 HP (capped, no effect) | |

---

## T11: Visual Effects

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 11.1 | Kill an alien | 6-8 particle burst in alien's color, fades over 0.3s | |
| 11.2 | Kill a boss | 15-20 particle burst, larger, fades over 0.6s | |
| 11.3 | Take damage (alien reaches bottom or boss projectile) | Screen flashes red for ~0.15s | |
| 11.4 | Observe bullet in flight | Fading trail line behind bullet in bullet's color | |
| 11.5 | Observe boss telegraph | Pulsing red line with increasing opacity over 0.6s | |
| 11.6 | Observe chest on field | Sparkle particles around chest | |
| 11.7 | Observe boss during fight | Pulsing glow outline on boss | |

---

## T12: Mobile (Chrome on Phone)

All tests use the tunnel URL in Google Chrome on a phone.

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 12.1 | Open tunnel URL | Canvas fills phone screen | |
| 12.2 | Try to pinch-zoom | Nothing happens — canvas stays fixed | |
| 12.3 | Try to scroll | Nothing happens — no page bounce | |
| 12.4 | Tap on title screen | Game starts | |
| 12.5 | Tap on screen during gameplay | Cannon aims at tap point, fires one shot | |
| 12.6 | Hold finger on screen 0.3s+ | Auto-fire engages | |
| 12.7 | Drag finger while holding | Cannon aim follows finger, auto-fire continues | |
| 12.8 | Tap chest | Chest opens, upgrade overlay appears | |
| 12.9 | Tap upgrade option | Upgrade applied, game resumes | |
| 12.10 | Tap "Click to Restart" on game over | Game restarts correctly | |
| 12.11 | Play through level 5 boss | All boss mechanics work via touch | |

---

## T13: Edge Cases & Stress

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 13.1 | Resize window mid-gameplay | Canvas resizes, cannon repositions, no crash | |
| 13.2 | Rapid clicking during BETWEEN_LEVELS | No effect — clicks are ignored until next state | |
| 13.3 | Click during upgrade overlay outside option boxes | Nothing happens, overlay stays | |
| 13.4 | Multiple aliens reach bottom same frame | Each costs 1 HP, game over triggers if total HP <= 0 | |
| 13.5 | Boss projectile hits cannon in the same frame an alien reaches the bottom | Both damage events apply correctly, HP decreases by 2 | |
| 13.6 | Kill boss while telegraph is active | Telegraph disappears, no projectile fires | |
| 13.7 | Burn damage kills alien between frames | Alien removed correctly, aliensRemaining decrements | |
| 13.8 | Open Chrome DevTools during gameplay | No console errors or warnings | |
| 13.9 | Play for 20+ levels continuously. Open Chrome DevTools → Memory tab → take heap snapshot at level 1 and again at level 20+ | No unbounded growth pattern: heap size at level 20+ should be in the same order of magnitude as level 1. Look for arrays (bullets, aliens, particles) that grow without bound. Exact thresholds depend on machine — this is a regression check, not a fixed pass/fail | |
| 13.10 | Game over → restart → play to level 5 | All state fully reset — no leftover aliens, bullets, upgrades, or boss | |

---

## T14: Deployment Verification

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 14.1 | `node server.js` starts | Server running on port 3000 | |
| 14.2 | `cloudflared tunnel --url http://localhost:3000` | Tunnel URL printed to console | |
| 14.3 | Open tunnel URL on Chrome PC | Full game works identically to localhost | |
| 14.4 | Open tunnel URL on Chrome mobile | Full game works via touch | |
| 14.5 | Share URL with another person | They can load and play the game | |
| 14.6 | Stop server (Ctrl+C), refresh page | Page fails to load (expected) | |
| 14.7 | Restart server | Game accessible again on same tunnel URL | |
| 14.8 | Stop tunnel, restart tunnel | New URL generated, game accessible on new URL | |
