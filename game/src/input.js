// input.js — Dapur Nusa: keyboard + mouse input.
// WASD / arrows move, E or Space interacts, M mutes, Enter starts.
// Clicking sets a walk target; clicking a station queues an auto-interact on arrival.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.interactPressed = false; // edge-triggered, consumed by the loop
    this.startPressed = false;
    this.mutePressed = false;
    this.click = null;            // {x, y} canvas coords of the latest click
    this.clickStation = null;     // station key clicked, if any
    this._canvas = canvas;

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      this.keys.add(k);
      if (k === 'e' || k === ' ') this.interactPressed = true;
      if (k === 'enter') this.startPressed = true;
      if (k === 'm') this.mutePressed = true;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      this.click = { x, y };
    });
  }

  // Movement vector from held keys, normalized.
  moveVector() {
    let dx = 0, dy = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    return { dx, dy };
  }

  consumeInteract() { const v = this.interactPressed; this.interactPressed = false; return v; }
  consumeStart() { const v = this.startPressed; this.startPressed = false; return v; }
  consumeMute() { const v = this.mutePressed; this.mutePressed = false; return v; }
  consumeClick() { const c = this.click; this.click = null; return c; }
}
