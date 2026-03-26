# Alien Cannon Defense - Localization Plan (English / Chinese)

This document covers adding Chinese language support with a toggle button on the title screen.

---

## Overview

- All player-visible text supports English and Chinese
- A language toggle button on the title screen switches between the two
- The selected language persists during the session (resets to English on page reload)
- No external libraries or font files — uses system fonts available in Chrome

---

## Step 1: Define Text Strings

Create a `LANG` object containing all player-visible strings in both languages:

```javascript
const LANG = {
  en: {
    title1: 'ALIEN CANNON',
    title2: 'DEFENSE',
    byline: 'by Richard',
    start: 'Press to Start',
    levelComplete: 'Level {n} Complete!',
    nextLevel: 'Next: Level {n}',
    openChest: 'Press to Open',
    chooseUpgrade: 'Choose an Upgrade',
    selectUpgrade: '[ Press to Select ]',
    gameOver: 'GAME OVER',
    score: 'Score',
    level: 'Level',
    restart: 'Press to Restart',
    boss: 'BOSS',
    fireRate: 'Fire Rate',
    firePower: 'Fire Power',
    freeze: 'Freeze',
    fire: 'Fire',
    plusHp: '+1 HP',
    fireRateDesc: '-0.08s delay',
    firePowerDesc: '+1 damage',
    freezeDesc: 'Slow aliens 50% for 2s',
    fireDesc: 'Burn 1 dmg over 3s',
    hpDesc: 'Restore 1 HP',
    frLabel: 'FR',
    fpLabel: 'FP',
    freezeLabel: 'FREEZE',
    fireLabel: 'FIRE',
    langButton: '中文',
  },
  zh: {
    title1: '外星人大炮',
    title2: '防御战',
    byline: '作者：Richard',
    start: '按下开始',
    levelComplete: '第 {n} 关完成！',
    nextLevel: '下一关：第 {n} 关',
    openChest: '按下打开',
    chooseUpgrade: '选择升级',
    selectUpgrade: '[ 按下选择 ]',
    gameOver: '游戏结束',
    score: '分数',
    level: '关卡',
    restart: '按下重新开始',
    boss: 'BOSS',
    fireRate: '射速',
    firePower: '火力',
    freeze: '冰冻',
    fire: '燃烧',
    plusHp: '+1 生命',
    fireRateDesc: '射击间隔 -0.08秒',
    firePowerDesc: '伤害 +1',
    freezeDesc: '减速外星人50% 持续2秒',
    fireDesc: '灼烧 1点伤害 持续3秒',
    hpDesc: '恢复 1 生命值',
    frLabel: '射速',
    fpLabel: '火力',
    freezeLabel: '冰冻',
    fireLabel: '燃烧',
    langButton: 'EN',
  },
};
```

---

## Step 2: Language State & Helper

```javascript
let currentLang = 'en';

function t(key) {
  const str = LANG[currentLang][key];
  return str !== undefined ? str : LANG.en[key] || key;
}

function tFormat(key, values) {
  let str = t(key);
  for (const [k, v] of Object.entries(values)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}
```

- `t('gameOver')` → returns the localized string
- `tFormat('levelComplete', { n: 5 })` → "Level 5 Complete!" or "第 5 关完成！"

---

## Step 3: Language Toggle Button on Title Screen

### Design
- A button in the top-right corner of the title screen
- Shows "中文" when in English (click to switch to Chinese)
- Shows "EN" when in Chinese (click to switch to English)
- Rendered as a bordered box: 70x35px, positioned at `(canvas.width - 85, 15)`
- White border, white text, semi-transparent background

### Implementation
- Render the button in `renderTitle()`
- In `handleClick()`, when state is TITLE, check if click is inside the language button hitbox before checking the "start game" action
- On click: toggle `currentLang` between `'en'` and `'zh'`
- The button only appears on the title screen (not during gameplay)

### Hitbox
```javascript
const langBtnX = canvas.width - 85;
const langBtnY = 15;
const langBtnW = 70;
const langBtnH = 35;
```

---

## Step 4: Replace All Hardcoded Strings

Every hardcoded string in the render functions must be replaced with `t()` or `tFormat()` calls:

| Location | Current | Replacement |
|----------|---------|-------------|
| `renderTitle()` | `'ALIEN CANNON'` | `t('title1')` |
| `renderTitle()` | `'DEFENSE'` | `t('title2')` |
| `renderTitle()` | `'by Richard'` | `t('byline')` |
| `renderTitle()` | `'Click to Start'` | `t('start')` |
| `renderBetweenLevels()` | `'Level ' + (level-1) + ' Complete!'` | `tFormat('levelComplete', { n: level-1 })` |
| `renderBetweenLevels()` | `'Next: Level ' + level` | `tFormat('nextLevel', { n: level })` |
| `renderChest()` | `'Click to Open'` | `t('openChest')` |
| `renderUpgradeOverlay()` | `'Choose an Upgrade'` | `t('chooseUpgrade')` |
| `renderUpgradeOverlay()` | `'[ Click to Select ]'` | `t('selectUpgrade')` |
| `renderGameOver()` | `'GAME OVER'` | `t('gameOver')` |
| `renderGameOver()` | `'Score: '` | `t('score') + ': '` |
| `renderGameOver()` | `'Level: '` | `t('level') + ': '` |
| `renderGameOver()` | `'Click to Restart'` | `t('restart')` |
| `renderHUD()` | `'Level: '` | `t('level') + ': '` |
| `renderHUD()` | `'Score: '` | `t('score') + ': '` |
| `renderBoss()` | `'BOSS'` | `t('boss')` |
| `getUpgradeName()` | All 5 cases | `t('fireRate')`, `t('firePower')`, etc. |
| `getUpgradeDesc()` | All 5 cases | `t('fireRateDesc')` + stack count, etc. |
| `renderHUD()` | `'FR x'`, `'FP x'`, etc. | `t('frLabel')`, `t('fpLabel')`, etc. |

---

## Step 5: Font Handling for Chinese

### Problem
Chinese characters need a font that supports CJK glyphs. The default `monospace` may not render Chinese properly on all systems.

### Solution
Use a font stack that falls back gracefully:
```javascript
const FONT_FAMILY = "'Courier New', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', monospace";
```

Replace all `ctx.font = '... monospace'` with `ctx.font = '... ' + FONT_FAMILY`.

- `PingFang SC` — macOS/iOS
- `Microsoft YaHei` — Windows
- `Noto Sans SC` — Android/Linux
- `monospace` — final fallback

### Text-Fit Strategy

Chinese characters are wider per glyph than Latin characters. Several UI elements have fixed-width layouts that can clip Chinese text. Use a `fitText()` helper to auto-scale font size to fit within a given width:

```javascript
function fitText(text, maxWidth, baseFontSize, fontWeight) {
  let size = baseFontSize;
  ctx.font = (fontWeight ? fontWeight + ' ' : '') + size + 'px ' + FONT_FAMILY;
  while (ctx.measureText(text).width > maxWidth && size > 8) {
    size--;
    ctx.font = (fontWeight ? fontWeight + ' ' : '') + size + 'px ' + FONT_FAMILY;
  }
  return size;
}
```

Apply `fitText()` to every constrained text area:

| Area | Max Width | Base Font Size | Notes |
|------|-----------|----------------|-------|
| Title line 1 | `canvas.width - 40` | 48px | Full screen width minus margins |
| Title line 2 | `canvas.width - 40` | 48px | Same |
| HUD upgrade indicator pills | 66px (70px box - 4px padding) | 14px | Currently 70px wide boxes at game.js:1131 |
| Upgrade card name | 240px (260px box - 20px padding) | 22px | Currently 260px cards at game.js:1231 |
| Upgrade card description | 240px | 14px | Same cards, description line |
| Upgrade card select hint | 240px | 12px | Same cards, bottom hint |
| Boss HP label | 290px (300px bar - 10px padding) | 14px | Currently 300px bar at game.js:1036 |
| HUD top-left (level + score) | `canvas.width / 2 - 40` (half screen minus margin for hearts on right) | 18px | Currently at game.js:1098-1102. Measure text width; if it exceeds half the screen width, shrink font to fit without overlapping the heart row |
| Game over text | `canvas.width - 40` | 48px | Full width |
| Level complete text | `canvas.width - 40` | 36px | Full width |

For the HUD upgrade indicator pills specifically:
- English labels are short ("FR x2", "FIRE") and fit in 70px
- Chinese labels ("射速 x2", "燃烧") are wider
- Increase pill width dynamically: measure the widest active indicator text, set all pills to `max(70, measuredWidth + 16)`
- This keeps pills uniform but sized to fit the current language

---

## Step 6: Upgrade Description with Stack Count

The `getUpgradeDesc()` function includes dynamic stack counts. In Chinese, the format changes:

| English | Chinese |
|---------|---------|
| `-0.08s delay (x2/5)` | `射击间隔 -0.08秒 (2/5)` |
| `+1 damage (x3/5)` | `伤害 +1 (3/5)` |

Implementation:
```javascript
function getUpgradeDesc(key) {
  switch (key) {
    case 'fireRate': return t('fireRateDesc') + ' (' + (player.upgrades.fireRate + 1) + '/5)';
    case 'firePower': return t('firePowerDesc') + ' (' + (player.upgrades.firePower + 1) + '/5)';
    case 'freeze': return t('freezeDesc');
    case 'fire': return t('fireDesc');
    case 'hp': return t('hpDesc');
  }
}
```

---

## Implementation Order

```
Step 1 (LANG object)
  → Step 2 (t() helper)
    → Step 3 (toggle button)
    → Step 4 (replace all strings)
    → Step 5 (font handling)
    → Step 6 (upgrade descriptions)
```

Steps 3-6 are independent of each other and can be done in any order after Steps 1-2.

---

## Testing Checklist

| # | Check | Expected |
|---|-------|----------|
| 1 | Title screen in English | "ALIEN CANNON DEFENSE", "by Richard", "Press to Start" |
| 2 | Language button visible | "中文" button in top-right corner |
| 3 | Click language button | All title text switches to Chinese |
| 4 | Language button in Chinese | Now shows "EN" |
| 5 | Click EN button | All text switches back to English |
| 6 | Start game in Chinese | HUD shows "关卡:" and "分数:" |
| 7 | Level complete in Chinese | "第 X 关完成！" |
| 8 | Chest in Chinese | "按下打开" |
| 9 | Upgrade overlay in Chinese | Chinese upgrade names and descriptions |
| 10 | Game over in Chinese | "游戏结束", "按下重新开始" |
| 11 | Boss HP bar in Chinese | "BOSS" label (kept in English) |
| 12 | Upgrade indicators in Chinese | "射速", "火力", "冰冻", "燃烧" |
| 13 | Chinese title fits on screen | Title auto-scales if wider than screen |
| 14 | Chinese upgrade card text fits | Name, description, and hint text fit within 260px cards |
| 15 | Chinese HUD pills fit | Indicator pills widen to fit Chinese labels without clipping |
| 16 | Chinese game over text fits | "游戏结束" and "按下重新开始" fit within screen width |
| 17 | Chinese HUD text doesn't overlap hearts | "关卡:" and "分数:" labels stay in left half, no collision with heart row on right |
| 18 | Font renders correctly on mobile Chrome | Chinese characters display properly |
| 19 | Language resets on page reload | Defaults to English |
| 20 | Switch language mid-game not possible | Button only on title screen |
