# Alien Cannon Defense - Deployment Plan

## Host & Target Environment

| Property | Value |
|----------|-------|
| **Host machine** | This machine — Ubuntu 25.10, x86_64 |
| **Host path** | `/mnt/data/bob/richard/alien-cannon-defense/` |
| **Node.js** | 18+ required (verify with `node --version`) |
| **Server** | `server.js` on port 3000, serves static files only |
| **Public access** | Cloudflare Quick Tunnel → `*.trycloudflare.com` HTTPS URL |
| **Target clients** | Google Chrome on PC and mobile phone |
| **Game state** | 100% client-side — server has no API, no database, no user data |

---

## Step 1: Verify Prerequisites

### Node.js (18+)

```bash
node --version
```

Must return v18.x.x or higher. If not installed, install via [nodejs.org](https://nodejs.org/) or:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### cloudflared

```bash
cloudflared --version
```

If the command succeeds, skip to Step 2. If not found, install it:

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
sudo dpkg -i /tmp/cloudflared.deb
rm /tmp/cloudflared.deb
cloudflared --version
```

---

## Step 2: Verify Project Structure

```bash
ls -R /mnt/data/bob/richard/alien-cannon-defense/public/
```

Expected:
```
index.html
style.css
game.js
```

All three files plus `server.js` in the project root must be present before proceeding.

### Verify mobile-critical markup in `public/index.html`

Confirm the HTML file contains these elements required for Chrome mobile:

1. **Viewport meta tag** with `user-scalable=no`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
   ```
2. **touch-action in style.css**: `touch-action: none` on body to prevent scroll/zoom

If either is missing, add them before proceeding — mobile Chrome will scroll and zoom without them.

---

## Step 3: Local Smoke Test (Chrome PC)

### 3.1 Start the server

```bash
cd /mnt/data/bob/richard/alien-cannon-defense
node server.js
```

Expected output:
```
Alien Cannon Defense running at http://localhost:3000
```

### 3.2 Verify in Chrome on this machine

Open `http://localhost:3000` in Google Chrome.

| # | Check | Expected |
|---|-------|----------|
| 1 | Page loads | Canvas fills full browser window, no console errors |
| 2 | Title screen | "Alien Cannon Defense" + "Click to Start" visible |
| 3 | Start game | Click starts level 1, cannon at bottom center |
| 4 | Aiming | Cannon barrel rotates to follow mouse, never aims below horizontal |
| 5 | Shooting | Click fires bullet, hold 0.3s+ enables auto-fire |
| 6 | Aliens | Scouts spawn from top one at a time, move downward |
| 7 | Kill aliens | Bullets destroy aliens, score increases in HUD |
| 8 | Level complete | "Level X Complete" 3s pause, next wave has more aliens |
| 9 | HP loss | Alien reaching bottom reduces HP hearts in top-right |
| 10 | Game over | HP reaches 0 → "Game Over" screen with score + level |
| 11 | Restart | Click "Click to Restart" → fresh game at level 1 |

### 3.3 Boss test (reach level 5)

| # | Check | Expected |
|---|-------|----------|
| 1 | HP recovery | +1 HP granted before boss fight starts |
| 2 | Boss solo | Large alien appears, no regular aliens |
| 3 | Boss movement | Moves side-to-side at top of screen |
| 4 | Telegraph | Red line from boss to cannon for 0.6s before shot |
| 5 | Boss projectiles | Aimed at cannon, can be shot down (3 HP each) |
| 6 | Boss HP bar | Visible at top-center, decreases on hits |
| 7 | Boss death | All projectiles cleared instantly, chest appears on field |

### 3.4 Chest & upgrade test

| # | Check | Expected |
|---|-------|----------|
| 1 | Chest appears | Clickable chest on playfield after boss / every 3rd non-boss clear |
| 2 | Click to open | "Click to Open" text, clicking transitions to upgrade overlay |
| 3 | Upgrade choices | 2 options shown (or 1 upgrade + HP if limited) |
| 4 | Mutual exclusion | After picking Freeze, Fire never offered (and vice versa) |
| 5 | Upgrade applies | Fire rate/power/element changes take effect immediately |
| 6 | Exhaustion | When all maxed, chest grants +1 HP instead |

---

## Step 4: Deploy via Cloudflare Quick Tunnel

### 4.1 Start the server (if not already running)

```bash
cd /mnt/data/bob/richard/alien-cannon-defense
node server.js
```

### 4.2 Start the tunnel (separate terminal)

```bash
cloudflared tunnel --url http://localhost:3000
```

Expected output:
```
+-------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take     |
|  some time to be reachable):                                       |
|  https://random-words-here.trycloudflare.com                      |
+-------------------------------------------------------------------+
```

### 4.3 Share the URL

The `*.trycloudflare.com` URL is the public game link. It serves over HTTPS automatically. Share it with anyone — no login or authentication required. Players open it in Google Chrome on PC or phone.

---

## Step 5: Verify on Chrome PC and Mobile Phone

### 5.1 Chrome PC

Open the tunnel URL in Google Chrome on a PC. Run through the same checks from Step 3.2.

| Check | Expected |
|-------|----------|
| HTTPS loads | Canvas fills window, no mixed-content warnings |
| Full gameplay | Identical behavior to localhost |

### 5.2 Chrome Mobile Phone

Open the tunnel URL in Google Chrome on a phone.

| # | Check | Expected |
|---|-------|----------|
| 1 | Page loads | Canvas fills phone screen, no address bar interference |
| 2 | No zoom/scroll | Canvas stays fixed, no pinch-zoom or page bounce |
| 3 | Tap to aim + fire | Cannon aims at tap position, fires one shot |
| 4 | Hold to auto-fire | Holding 0.3s+ triggers auto-fire at current fire rate |
| 5 | Drag to re-aim | Moving finger while held updates cannon aim direction |
| 6 | Chest interaction | Tapping chest opens it, tapping upgrade option selects it |
| 7 | Full gameplay | Boss fights, upgrades, game over all work via touch |

---

## Step 6: Keep It Running

### Option A: Foreground (simple, requires open terminals)

- Terminal 1: `node server.js`
- Terminal 2: `cloudflared tunnel --url http://localhost:3000`

Game stays live while both terminals are open. Ctrl+C either to stop.

### Option B: Background (survives terminal close)

```bash
cd /mnt/data/bob/richard/alien-cannon-defense

# Start server
nohup node server.js > server.log 2>&1 &
echo $! > server.pid

# Start tunnel
nohup cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &
echo $! > tunnel.pid
```

Get the public URL:
```bash
grep -o 'https://.*trycloudflare.com' tunnel.log
```

### Stop background processes

```bash
kill $(cat server.pid) $(cat tunnel.pid)
rm server.pid tunnel.pid
```

---

## Step 7: Redeployment After Code Changes

### For changes to files in `public/` (game code, styles, HTML)

No restart needed. The server reads files on each request — just save the file and refresh the browser. The tunnel URL stays the same.

### For changes to `server.js` (MIME types, logging, etc.)

The server port is fixed at 3000 — do not change it. Restart only the server; the tunnel stays connected and the public URL does not change:

```bash
kill $(cat server.pid)
cd /mnt/data/bob/richard/alien-cannon-defense
nohup node server.js > server.log 2>&1 &
echo $! > server.pid
```

### When the tunnel URL must change

Only restart cloudflared if the tunnel process has died or you intentionally want a new URL:

```bash
kill $(cat tunnel.pid)
nohup cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &
echo $! > tunnel.pid
grep -o 'https://.*trycloudflare.com' tunnel.log
```

Share the new URL with players.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `lsof -i :3000` → kill the conflicting process |
| cloudflared not found | Run install commands from Step 1 |
| Tunnel URL not reachable | Wait 10-15 seconds for propagation |
| Canvas is black | Open Chrome DevTools (F12) → Console tab → check for JS errors |
| Touch not working on phone | Verify `touch-action: none` in style.css |
| Phone page scrolls/zooms | Verify `user-scalable=no` in viewport meta tag |
| Tunnel drops | Quick Tunnels have no uptime guarantee — restart cloudflared |
| Game lags on phone | All logic is client-side; check phone's Chrome version is up to date |

---

## Security Notes

- Server includes path traversal guard — rejects requests outside `public/`
- All game state is client-side — no server-side state, no API, no database
- Quick Tunnel URLs are random and unlisted, but anyone with the link can play
- No sensitive data is served — safe to expose publicly
