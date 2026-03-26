# Alien Cannon Defense - Mobile Enhancement Plan

This document covers changes needed to make the game fully playable on mobile phones (Chrome) with feature parity to the desktop version.

---

## Current Mobile State

### Working
- Touch to aim and fire
- Hold 0.3s+ to auto-fire
- Drag to re-aim while holding
- All UI interactions (title, chest, upgrades, game over)
- No zoom/scroll (viewport meta + touch-action CSS)

### Broken / Missing
- Cannon movement (arrow keys / WASD have no mobile equivalent)
- Mobile players cannot dodge boss projectiles
- No visual feedback for touch controls
- No mobile control instructions on title screen

---

## Enhancement 1: On-Screen Movement Controls

### Design
- Two semi-transparent arrow buttons rendered on the canvas
- Positioned at bottom-left and bottom-right corners, above the ground strip
- Left arrow: bottom-left corner, 60x60px touch target
- Right arrow: bottom-right corner, 60x60px touch target
- Buttons are always visible during PLAYING state
- Holding a button moves the cannon continuously (same speed as keyboard: 5 px/frame, frame-rate independent)

### Visual Style
- Semi-transparent white arrows on dark circular backgrounds
- `rgba(255, 255, 255, 0.15)` background, `rgba(255, 255, 255, 0.5)` arrow
- Slightly brighter when pressed: `rgba(255, 255, 255, 0.3)` background
- Small enough to not obstruct gameplay but large enough for comfortable touch (60x60px with 10px margin from edges)

### Implementation
1. Detect mobile: `('ontouchstart' in window)` or `navigator.maxTouchPoints > 0`
2. Only render on-screen buttons on mobile devices
3. Track touch state per button:
   - On `touchstart`: check if touch point is inside left or right button hitbox → set `mobileLeft = true` or `mobileRight = true`
   - On `touchmove`: update which button is pressed based on current touch position
   - On `touchend`: clear the corresponding button state
   - Support multi-touch: one finger on movement button, another finger for aiming/firing
4. In the update loop: treat `mobileLeft`/`mobileRight` the same as keyboard keys for cannon movement
5. Render buttons in the HUD layer (drawn last, always on top)

### Multi-Touch Handling
- The game must support simultaneous movement + firing
- Touch IDs must be tracked: one touch can control movement while another controls aiming/firing
- `touchstart` must check button hitboxes first, then fall through to aim/fire if the touch is not on a button
- `touchend` must only clear the state for the specific touch that was on the button

---

## Enhancement 2: Mobile-Specific Aim + Fire Behavior

### Current Problem
- On mobile, tapping to fire also changes the aim direction
- This makes it hard to fire rapidly at a target without the cannon jittering

### Design
- Split the screen into zones:
  - **Bottom 100px** (near cannon): reserved for movement buttons, taps here do NOT change aim
  - **Rest of screen**: tap to aim + fire (existing behavior)
- This prevents accidental aim changes when using movement buttons

---

## Enhancement 3: Mobile Title Screen Instructions

### Design
- On mobile devices, replace "Click to Start" with "Tap to Start"
- Add control hint below: "Use arrows to move, tap to shoot"
- On desktop, keep existing text

### Implementation
- Check `isMobile` flag (same detection as Enhancement 1)
- Swap text strings in `renderTitle()`

---

## Enhancement 4: Mobile Upgrade/Chest UI Sizing

### Current Problem
- Upgrade option boxes (260x120px) may be too small or overflow on narrow phone screens
- Chest hitbox (80x60) is small for finger taps

### Design
- Scale upgrade boxes based on screen width:
  - If `canvas.width < 600`: stack boxes vertically instead of side-by-side
  - Increase box height to 100px for easier tapping
- Increase chest clickable hitbox to 120x90 on mobile
- Increase "Click to Open" → "Tap to Open" on mobile

---

## Enhancement 5: Prevent Address Bar Interference

### Current Problem
- On some phones, scrolling down hides the address bar, causing a resize event mid-gameplay
- The cannon repositions but gameplay can feel jarring

### Design
- Add `position: fixed` to canvas CSS
- Use `window.visualViewport` API if available for more stable sizing
- Debounce resize handler: only reposition cannon if width actually changed (ignore height-only changes from address bar hide/show)

---

## Implementation Order

```
Enhancement 1 (on-screen buttons)    ← Critical: enables cannon movement
  → Enhancement 2 (aim zones)        ← Prevents aim jitter from button taps
    → Enhancement 3 (title text)     ← Quick polish
    → Enhancement 4 (UI scaling)     ← Usability on small screens
    → Enhancement 5 (address bar)    ← Edge case stability
```

### Priority
- **Must have**: Enhancement 1 (without this, mobile has no cannon movement)
- **Should have**: Enhancement 2 (prevents frustrating aim jitter)
- **Nice to have**: Enhancements 3, 4, 5 (polish and edge cases)

---

## Testing Checklist

| # | Check | Expected |
|---|-------|----------|
| 1 | On-screen arrows visible on mobile | Two arrow buttons at bottom corners |
| 2 | On-screen arrows hidden on desktop | No buttons visible with mouse input |
| 3 | Hold left arrow | Cannon moves left continuously |
| 4 | Hold right arrow | Cannon moves right continuously |
| 5 | Cannon stays on screen | Clamped to screen bounds |
| 6 | Move + fire simultaneously | One finger on arrow, another taps to fire |
| 7 | Arrow button tap does not change aim | Aim stays on last non-button touch point |
| 8 | Release arrow button | Cannon stops moving |
| 9 | Upgrade boxes on narrow screen (<600px) | Stacked vertically, not overlapping |
| 10 | Chest tap on mobile | Opens with enlarged hitbox |
| 11 | Title screen on mobile | "Tap to Start" + control hints |
| 12 | Address bar hide/show | No gameplay disruption |
