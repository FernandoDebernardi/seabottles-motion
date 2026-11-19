// =====================================================================
//  GUION 2 · «Imagina una red social sin likes»
//  Corazones y pulgares caen al mar y se hunden; arriba queda solo la botella.
// =====================================================================
const DAY_SEA = ['#5fa8b0', '#7fc0bf', '#9ed3c9', '#6aaeb2'];
// insignia de notificación de arcilla (sin números)
function badge(x, y, r) {
  ctx.save(); ctx.shadowColor = 'rgba(60,20,20,0.3)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#f08a7a'); g.addColorStop(1, '#d4483a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#fbf6e8'; ctx.beginPath(); ctx.arc(x, y, r * 0.32, 0, TAU); ctx.fill(); ctx.restore();
}
const ICONS = [['corazon.png', 300, 230, -0.7, 0], ['pulgar.png', 280, 820, -0.4, 1], ['corazon.png', 200, 640, 0.3, 2], ['badge', 80, 420, -0.2, 3], ['pulgar.png', 220, 300, 0.7, 4], ['corazon.png', 170, 900, 1.0, 5], ['badge', 65, 720, 0.5, 6], ['corazon.png', 240, 520, 1.4, 7], ['pulgar.png', 200, 160, 1.7, 8], ['badge', 70, 960, 1.9, 9]];
function drawIcon(n, x, y, w, rot) { if (n === 'badge') badge(x, y, w); else sprite(n, x, y, w, { rot }); }
// ---- 1 · GANCHO (0-3.5): llueven corazones, pulgares y avisos; caen al mar y salpican
function s_hook() {
  skyGrad('#f7d7c4', '#fbecd2', 1300);
  claySun(820, 1080, 110);
  clouds2(700, 2, 18);
  ICONS.forEach(([n, w, x, d, i]) => {
    const t0 = d * 1.2 - 1.1, land = 1230 + (i % 3) * 30, u = (TT - t0) / 2.2;
    if (u < 0) return;
    if (u < 1) drawIcon(n, x + Math.sin(TT * 2 + i) * 20, lerp(-150, land, u * u), w, Math.sin(TT * 3 + i) * 0.3);
    splashClay(x, land + 30, seg(TT, t0 + 2.2, t0 + 2.8));
  });
  clayWaves(1220, 110, DAY_SEA, { amp: 18, sp: 1.3 });
  DEFER.push(() => clayCard([{ t: 'Imagina una red social' }, { t: 'sin likes', hi: true }], CX, 400, 68, { rot: -0.015 }));
}
// bajo el agua: el fondo de arcilla y burbujas que suben
function underwater(dy = 0) {
  skyGrad('#cfe5d2', '#5f9a9c', 1920);
  const img = asset('fondo-mar.png');
  if (img) { const w = 1180, h = w * img.naturalHeight / img.naturalWidth; ctx.drawImage(img, -50, 1920 - h + 60 + dy, w, h); }
  // rayos de luz que se mueven
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) { const x = 120 + i * 260 + Math.sin(TT * 0.8 + i) * 40; ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x + 90, -20); ctx.lineTo(x + 260, 1500); ctx.lineTo(x + 140, 1500); ctx.fill(); }
  ctx.restore();
  const R = RNG('bub2'); for (let i = 0; i < 22; i++) { const x = R.r(40, 1040), sp = R.r(90, 180), y = 1900 - mod(TT * sp + R.r(0, 1900), 1900), r = R.r(6, 16);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(x + Math.sin(TT * 3 + i) * 8, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
}
// ---- 2 · SE HUNDEN (3.5-7): bajo el agua, los íconos bajan despacio hasta la arena
const REST = [[300, 1590, 230, 0.2], [760, 1600, 220, -0.3], [540, 1650, 150, 0.1], [880, 1520, 60, 0], [170, 1660, 150, 0.5]];
function sinkers(t0, dur) {
  ICONS.slice(0, 5).forEach(([n, w], i) => {
    const [rx, ry, rw, rr] = REST[i], u = EZ.o2(seg(TT, t0 + i * 0.3, t0 + i * 0.3 + dur));
    drawIcon(n, rx + Math.sin(TT * 1.5 + i) * 30 * (1 - u), lerp(250 + i * 60, ry, u), n === 'badge' ? rw : rw, rr * u + Math.sin(TT * 2 + i) * 0.25 * (1 - u));
  });
}
function s_sink() {
  underwater();
  sinkers(E0 - 0.2, 3.0);
  DEFER.push(() => clayCard([{ t: 'Sin likes,' }, { t: 'sin seguidores', hi: true }], CX, 330, 66, { rot: 0.015 }));
}
// ---- 3 · EN EL FONDO (7-10.5): quedan quietos en la arena; las burbujas suben
function s_floor() {
  const push = EZ.io(seg(TT, E0, E0 + 3.5));
  ctx.save(); ctx.translate(540, 1500); ctx.scale(1 + push * 0.12, 1 + push * 0.12); ctx.translate(-540, -1500);
  underwater();
  sinkers(-10, 1);
  ctx.restore();
  DEFER.push(() => clayCard([{ t: 'Sin contadores.' }, { t: 'A propósito.', hi: true }], CX, 330, 66, { rot: -0.015 }));
}
// ---- 4 · ARRIBA (10.5-14): mar en calma al atardecer; solo flota la botella
function s_calm() {
  skyGrad('#f3c0b5', '#fbe1c4', 1250);
  claySun(540, 1150, 130, { col: '#f0a64a', hi: '#ffd27a' });
  clouds2(820, 2, 12);
  birds(E0 + 0.2, 700);
  clayWaves(1180, 105, ['#6f9fb0', '#8bb7bd', '#a8cbc6', '#7aa9b3'], { amp: 16, sp: 1.0 });
  floatBottle(lerp(260, 620, EZ.io(seg(TT, E0, E0 + 3.5))), 1430, 400);
  DEFER.push(() => clayCard([{ t: 'Solo queda' }, { t: 'lo que escribes', hi: true }], CX, 340, 66, { rot: 0.015 }));
}
// ---- 5 · QUÉ ES (14-17): la botella se abre; el mensaje sale para alguien de otro país
function s_what() {
  skyGrad('#f3c0b5', '#fbe1c4', 1250);
  claySun(540, 1150, 130, { col: '#f0a64a', hi: '#ffd27a' });
  clouds2(820, 2, 12);
  clayWaves(1180, 105, ['#6f9fb0', '#8bb7bd', '#a8cbc6', '#7aa9b3'], { amp: 16, sp: 1.0 });
  floatBottle(620, 1430, 400, { name: TT > CU.open ? 'botella-abierta.png' : 'botella.png' });
  DEFER.push(() => {
    clayCard([{ t: 'Un mensaje en una botella' }, { t: 'para alguien de otro país', hi: true }], CX, 330, 56, { rot: -0.01 });
    clayCard([{ t: 'Hoy pensé en mi abuela' }, { t: 'y quise contárselo a alguien.' }], CX, 620, 50, { rot: 0.025, s: popS(CU.open + 0.2) });
  });
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  skyGrad('#f3c0b5', '#fbe1c4', 1250);
  claySun(540, 1150, 130, { col: '#f0a64a', hi: '#ffd27a' });
  clayWaves(1180, 105, ['#6f9fb0', '#8bb7bd', '#a8cbc6', '#7aa9b3'], { amp: 16, sp: 1.0 });
  floatBottle(520, 1430, 400);
  birds(E0, 820);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
