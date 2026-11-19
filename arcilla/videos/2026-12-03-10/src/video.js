// =====================================================================
//  GUION 10 · «Tu botella puede llevar un regalo escondido»
//  Caen caracola, estrella y farol dentro; al abrirla, caen al pie de la carta.
// =====================================================================
const NOTE10 = ['Te mando el mar', 'de mi pueblo.'];
const TES = [['concha.png', 150], ['estrella2.png', 150], ['farol2.png', 120]];
const SAND10 = '#e9cd7a';
function beach10(o = {}) {
  skyGrad(o.a ?? '#f7d2bf', o.b ?? '#fde8c8', 1250); claySun(o.sx ?? 820, 980, 100, { col: '#f0b44a' }); clouds2(640, 2, 14);
  clayWaves(1080, 100, ['#5f9fb0', '#7ab8be', '#98ccc8'], { amp: 16, sp: 1.2 });
  clayMound(1420, SAND10, { amp: 50 });
}
const B10 = { x: 520, y: 1500, w: 640, rot: -0.08 };
// ---- 1 · GANCHO (0-3.5): los tesoros caen por el cuello de la botella abierta
function s_hook() {
  beach10();
  const { x, y, w, rot } = B10, lip = bottleLocal(x, y, w, rot, 0.84, 0.16), inside = [[0.42, 0.66], [0.3, 0.72], [0.56, 0.7]];
  sprite('botella-abierta.png', x, y, w, { rot });
  TES.forEach(([n, tw], i) => {
    const t = -0.3 + i * 0.75;
    if (TT >= t + 0.55) { const [px, py] = bottleLocal(x, y, w, rot, ...inside[i]); ctx.save(); ctx.globalAlpha = 0.85; sprite(n, px, py, tw * 0.6, { shadow: false }); ctx.restore(); }
    else if (TT >= t - 0.5) { const u = EZ.i2(seg(TT, t, t + 0.55)); sprite(n, lerp(lip[0] + (i - 1) * 200, lip[0], Math.min(1, u * 1.3)), lerp(820, lip[1], Math.min(1, u * 1.3)), tw * 1.3 * (1 - 0.5 * u), { rot: TT * 2 + i }); }
  });
  DEFER.push(() => clayCard([{ t: 'Tu botella puede llevar' }, { t: 'un regalo escondido', hi: true }], CX, 420, 62, { rot: -0.015 }));
}
// ---- 2 · ELIGE (3.5-7): hasta tres tesoros de un catálogo de cien
function s_pick() {
  fillBg('#fbeede'); const g = ctx.createRadialGradient(540, 1100, 100, 540, 1100, 1100); g.addColorStop(0, '#fff6e6'); g.addColorStop(1, '#f2d9bc'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // estante de arcilla con huecos del catálogo
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = 210 + c * 220, y = 760 + r * 240, k = Math.min(1, popS(E0 + 0.05 * (r * 4 + c)));
    ctx.save(); ctx.shadowColor = 'rgba(80,50,20,0.22)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; ctx.fillStyle = '#f7e6cf'; ctx.beginPath(); ctx.roundRect(x - 90 * k, y - 90 * k, 180 * k, 180 * k, 30); ctx.fill(); ctx.restore(); }
  const picks = [[1, 0], [2, 1], [1, 2]];
  TES.forEach(([n, tw], i) => { const [c, r] = picks[i], x = 210 + c * 220, y = 760 + r * 240, t = E0 + 0.8 + i * 0.7, s = popS(t);
    sprite(n, x, y, 140 * Math.min(1.15, 0.85 + s * 0.3));
    if (TT > t) { ctx.save(); ctx.strokeStyle = '#2b3f6b'; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(x - 95, y - 95, 190, 190, 32); ctx.globalAlpha = Math.min(1, (TT - t) * 4); ctx.stroke(); ctx.restore(); sparkle(x + 80, y - 80, 22 * Math.max(0, 1 - (TT - t) * 2), '#f0b44a'); }
  });
  const R = RNG('cat'); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { if (picks.some(([pc, pr]) => pc === c && pr === r)) continue; const x = 210 + c * 220, y = 760 + r * 240; dot(x, y, 26 * Math.min(1, popS(E0 + 0.05 * (r * 4 + c))), ['#9fcfd0', '#f2a99a', '#c9b2e0', '#a8d49a'][(r + c) % 4]); }
  DEFER.push(() => clayCard([{ t: 'Elige hasta tres tesoros' }, { t: 'de un catálogo de cien', hi: true }], CX, 380, 58, { rot: 0.015 }));
}
// ---- 3 · VIAJAN (7-10.5): se cierra con el corcho y se va con la corriente
function s_sail() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(240, 980, 90); clouds2(640, 2, 14);
  clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd'], { amp: 16, sp: 1.2 });
  floatBottle(lerp(300, 820, EZ.io(seg(TT, E0, E0 + 3.4))), 1330, 380);
  clayWaves(1400, 110, ['#8fcac6', '#5aa5b5', '#4f9bb0'], { amp: 16, sp: 1.2 });
  DEFER.push(() => clayCard([{ t: 'Viajan escondidos' }, { t: 'dentro de la botella', hi: true }], CX, 340, 64, { rot: -0.015 }));
}
// ---- 4 · LA ENCUENTRA (10.5-14): ella la levanta en otra playa
function s_found() {
  beach10({ a: '#c9e6ee', b: '#fdeccb', sx: 240 });
  birds(E0, 760);
  sprite('botella.png', 280, 1610, 320, { rot: 0.2 });
  personPop('abuela.png', 720, 1830, 260, E0);
  clayMound(1880, SAND10, { amp: 120, cx: 720, wid: 300, drop: 200 });
  DEFER.push(() => clayCard([{ t: 'Quien la encuentra' }, { t: 'en otro país…', hi: true }], CX, 340, 64, { rot: 0.015 }));
}
// ---- 5 · LOS DESCUBRE (14-17): la carta y, a sus pies, los tres tesoros
function s_open() {
  beach10({ a: '#c9e6ee', b: '#fdeccb', sx: 240 });
  sprite('botella-vacia.png', 280, 1620, 320, { rot: 0.2 });
  DEFER.push(() => {
    clayCard([{ t: '…los descubre' }, { t: 'al abrirla', hi: true }], CX, 330, 66, { rot: -0.015 });
    clayCard([{ t: NOTE10[0] }, { t: NOTE10[1] }], CX, 620, 62, { rot: 0.025, s: popS(E0 + 0.2) });
    TES.forEach(([n, tw], i) => { const t = E0 + 0.7 + i * 0.35; if (TT < t) return; const fu = EZ.o2(seg(TT, t, t + 0.4)); sprite(n, 360 + i * 180, lerp(640, 860, fu), tw * Math.min(1, popS(t)), { rot: (1 - fu) * 2 }); });
  });
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  beach10();
  sprite('botella.png', 520, 1560, 460, { rot: -0.08 });
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
