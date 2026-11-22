// =====================================================================
//  TANDA 4-10/12/2026 — ayudas compartidas (además de comun.js)
// =====================================================================
const SANDT = '#e7c97a';
function beachT(o = {}) {
  skyGrad(o.a ?? '#bfe3ee', o.b ?? '#fdeccb', 1250); claySun(o.sx ?? 820, o.sy ?? 960, 95, { col: '#f0b44a' }); clouds2(o.cy ?? 620, 2, 14);
  clayWaves(o.wy ?? 1080, 100, ['#5f9fb0', '#7ab8be', '#98ccc8'], { amp: 16, sp: 1.2 });
  clayMound(o.my ?? 1420, SANDT, { amp: 50 });
}
function seaT(o = {}) {   // mar abierto de frente
  skyGrad(o.a ?? '#bfe3ee', o.b ?? '#fdeccb', 1250); if (o.sun !== false) claySun(o.sx ?? 240, o.sy ?? 960, 90); clouds2(o.cy ?? 640, 2, 14);
  clayWaves(1160, 110, ['#4f9bb0', '#6fb4bd'], { amp: 16, sp: 1.2 });
}
function seaFront() { clayWaves(1420, 110, ['#8fcac6', '#5aa5b5', '#4f9bb0'], { amp: 16, sp: 1.2 }); }
// pez o tortuga que nada hacia la derecha (cabeza adelante), con ondulación suave
function swimR(name, t0, d, x0, x1, y, w, ph = 0) {
  const u = (TT - t0) / d; if (u < 0 || u > 1) return;
  sprite(name, lerp(x0, x1, u), y + Math.sin(TT * 3 + ph) * 14, w, { rot: Math.sin(TT * 3 + ph + 1) * 0.05, shadow: false });
}
function bubbles(x, y, t0, n = 6) { const R = RNG('bub', x); for (let i = 0; i < n; i++) { const t = (TT - t0 - i * 0.25); if (t < 0) continue; const u = (t % 1.6) / 1.6; ctx.save(); ctx.globalAlpha = 0.7 * (1 - u); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + R.r(-30, 30) + Math.sin(TT * 4 + i) * 8, y - u * 260, R.r(8, 16), 0, TAU); ctx.stroke(); ctx.restore(); } }
// cielo de noche con luna (para escenas de faro y paso de los días)
function nightSky(a = '#1d2a4f', b = '#3b4a7a') { skyGrad(a, b, 1250); stars('ns', 80, 1000, 40); }
function moon(x, y, r) { ctx.save(); ctx.shadowColor = 'rgba(255,240,200,0.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#f6ecd0'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
