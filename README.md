# Alien Cannon Defense

A tap/click-to-shoot alien defense game. Control a cannon at the bottom of the screen and shoot down waves of aliens across increasingly difficult levels.

## Features

- 5 alien types (Scout, Soldier, Tank, Elite, Swarm) with scaling difficulty
- Mini boss every 5 levels with shootable projectiles and telegraph attacks
- Treasure chests with upgrades: Fire Rate, Fire Power, Freeze, Fire
- Freeze and Fire are mutually exclusive
- Works on desktop (mouse) and mobile (touch)
- No external dependencies

## Quick Start

```bash
node server.js
```

Open `http://localhost:3000` in Google Chrome.

## Deploy with Cloudflare Quick Tunnel

```bash
node server.js &
cloudflared tunnel --url http://localhost:3000
```

Share the `*.trycloudflare.com` URL.

## Controls

- **Desktop**: Move mouse to aim, click to fire, hold to auto-fire
- **Mobile**: Tap to aim and fire, hold 0.3s+ to auto-fire, drag to re-aim

## Project Structure

```
server.js           - Node.js static file server (port 3000)
public/
  index.html        - Game page
  style.css         - Styles
  game.js           - All game logic
```

## Requirements

- Node.js 18+
- Google Chrome (PC or mobile)
