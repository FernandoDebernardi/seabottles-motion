// =====================================================================
//  GUION 9 · «Las botellas nuevas flotan. Las viejas, en el fondo»
//  Corte del mar: la cámara baja de la superficie al fondo; cuanto más hondo, más antigua la botella.
// =====================================================================
// anzuelo de arcilla y sedal desde arriba
function hookAt(x, y, x0 = 760, y0 = -40, wig = 0) {
  ctx.save(); ctx.strokeStyle = 'rgba(250,250,240,0.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0);
  for (let k = 1; k <= 20; k++) { const v = k / 20; ctx.lineTo(lerp(x0, x, v) + Math.sin(v * 9 + TT * 30) * wig * Math.sin(v * Math.PI), lerp(y0, y, v)); }
  ctx.stroke();
  ctx.shadowColor = 'rgba(20,20,30,0.3)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
  ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 50); ctx.arc(x - 22, y + 50, 22, 0, Math.PI * 0.9); ctx.stroke();
  ctx.fillStyle = '#e45b4a'; ctx.beginPath(); ctx.arc(x, y - 40, 16, 0, TAU); ctx.fill();   // plomada roja
  ctx.restore();
}
// el fondo del mar (en código): agua que oscurece con la profundidad, rocas y algas
function deep(depth) {   // depth 0 = arriba, 1 = fondo
  const top = mixH('#7fc3c8', '#183a5a', depth), bot = mixH('#3f8aa0', '#0f2440', depth);
  skyGrad(top, bot, 1920);
  ctx.save(); ctx.globalAlpha = 0.1 * (1 - depth) + 0.04; ctx.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) { const x = 100 + i * 280 + Math.sin(TT * 0.7 + i) * 40; ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x + 80, -20); ctx.lineTo(x + 240, 1920); ctx.lineTo(x + 120, 1920); ctx.fill(); }
  ctx.restore();
  const R = RNG('b8'); for (let i = 0; i < 18; i++) { const x = R.r(40, 1040), sp = R.r(90, 170), y = 1900 - mod(TT * sp + R.r(0, 1900), 1900), r = R.r(6, 14);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + Math.sin(TT * 3 + i) * 8, y, r, 0, TAU); ctx.stroke(); ctx.restore(); }
}
function swimFish(t0, y, dir, w, ph = 0) {
  const x = dir > 0 ? -200 + (TT - t0) * 260 : 1280 - (TT - t0) * 260;
  sprite('pez.png', x, y + Math.sin(TT * 4 + ph) * 18, w, { sx: dir > 0 ? -1 : 1, rot: Math.sin(TT * 4 + ph) * 0.08 });
}

// el mundo es alto: superficie en y=1300, medio en 2500, fondo en 3700; la cámara baja
function oldBottle(x, y, w, rot, age) {   // age 0..1: algas y una estrella pegada
  ctx.save(); ctx.filter = `saturate(${1 - 0.45 * age}) brightness(${1 - 0.2 * age}) sepia(${0.35 * age})`; sprite('botella.png', x, y, w, { rot }); ctx.restore();
  if (age > 0.3) { const R = RNG('alg', x); for (let i = 0; i < Math.round(10 * age); i++) { const [px, py] = bottleLocal(x, y, w, rot, R.r(0.2, 0.75), R.r(0.4, 0.85)); dot(px, py, R.r(6, 12), i % 2 ? '#4f8a52' : '#6aa86a'); } }
  if (age > 0.7) { const [sx, sy] = bottleLocal(x, y, w, rot, 0.4, 0.55); sprite('estrella2.png', sx, sy, w * 0.32, { rot: 0.4 }); }
}
function world(camY) {
  fillBg('#0f2440');
  const g = ctx.createLinearGradient(0, 1250 - camY, 0, 4200 - camY); g.addColorStop(0, '#5fb0bd'); g.addColorStop(0.4, '#2f6f8f'); g.addColorStop(1, '#0f2440'); ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80);
  if (1260 - camY > 0) { const s2 = ctx.createLinearGradient(0, -camY, 0, 1260 - camY); s2.addColorStop(0, '#bfe3ee'); s2.addColorStop(1, '#fdeccb'); ctx.fillStyle = s2; ctx.fillRect(-40, -40, W + 80, 1300 - camY); }
  ctx.save(); ctx.translate(0, -camY);
  claySun(240, 980, 90); clouds2(640, 2, 14);
  // rayos de luz
  ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const x = 100 + i * 280 + Math.sin(TT * 0.7 + i) * 40; ctx.beginPath(); ctx.moveTo(x, 1300); ctx.lineTo(x + 80, 1300); ctx.lineTo(x + 300, 3600); ctx.lineTo(x + 180, 3600); ctx.fill(); } ctx.restore();
  // burbujas
  const R = RNG('b9'); for (let i = 0; i < 40; i++) { const x = R.r(40, 1040), sp = R.r(90, 170), y = 3900 - mod(TT * sp + R.r(0, 2600), 2600), r = R.r(6, 14); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + Math.sin(TT * 3 + i) * 8, y, r, 0, TAU); ctx.stroke(); ctx.restore(); }
  // fondo con algas y rocas
  for (let i = 0; i < 9; i++) { const x = 60 + i * 125, h = 260 + (i % 3) * 90, y = 3820;
    ctx.save(); ctx.strokeStyle = i % 2 ? '#2f6a4a' : '#3f7a55'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y + 60); for (let k = 1; k <= 10; k++) { const v = k / 10; ctx.lineTo(x + Math.sin(TT * 1.8 + i + v * 3) * 30 * v, y + 60 - h * v); } ctx.stroke(); ctx.restore(); }
  // botellas: nuevas arriba (flotan), de semanas en el medio, antiguas en el fondo
  [[260, 1330, 0], [560, 1300, 1.5], [840, 1340, 3]].forEach(([x, y, p]) => floatBottle(x, y, 260, { ph: p }));
  [[300, 2450, 0.5], [760, 2600, -0.6]].forEach(([x, y, r], i) => oldBottle(x + Math.sin(TT + i) * 20, y + Math.sin(TT * 1.3 + i) * 15, 270, r + Math.sin(TT + i) * 0.1, 0.45));
  swimFish(3.0, 2000, 1, 180); swimFish(8.5, 2900, -1, 160, 2); swimFish(11.5, 3300, 1, 150, 4);
  [[320, 3760, 1.1], [720, 3800, -0.4]].forEach(([x, y, r]) => oldBottle(x, y, 300, r, 0.95));
  ctx.restore();
  clayMound(3880 - camY, '#2d3e55', { amp: 70, cx: 900, wid: 220, drop: 100 });
  clayMound(3920 - camY, '#b39456', { amp: 40 });
  // la superficie del agua (franja de olas) sobre todo, en coordenadas del mundo
  ctx.save(); ctx.beginPath(); ctx.rect(-40, 1240 - camY, W + 80, 120); ctx.clip();
  clayWaves(1290 - camY, 70, ['#6fb4bd'], { amp: 14, sp: 1.2 }); ctx.restore();
}
function camAtT() { return springTrack([[0, 300], [3.6, 750], [7.1, 1750], [10.6, 2650], [14.1, 2350]], SPRING.heavy); }
// ---- 1 · GANCHO (0-3.5): caen botellas al mar desde el cielo
function s_hook() {
  world(camAtT());
  [[200, 0.2], [880, 0.7]].forEach(([x, d]) => { const u = TT / (0.6 + d); if (u < 1) sprite('botella.png', x, lerp(300, 1050, u * u), 260, { rot: 2 + u * 5 }); splashClay(x, 1050, seg(TT, 0.6 + d, 1.2 + d)); });
  DEFER.push(() => clayCard([{ t: 'Las botellas nuevas flotan.' }, { t: 'Las viejas, en el fondo.', hi: true }], CX, 420, 60, { rot: -0.015 }));
}
function s_top() { world(camAtT()); DEFER.push(() => clayCard([{ t: 'Arriba, las que' }, { t: 'acaban de zarpar', hi: true }], CX, 340, 64, { rot: 0.015 })); }
function s_mid() { world(camAtT()); DEFER.push(() => clayCard([{ t: 'Más abajo, las que' }, { t: 'navegan hace semanas', hi: true }], CX, 340, 60, { rot: -0.015 })); }
function s_deep() { world(camAtT()); DEFER.push(() => clayCard([{ t: 'Y en el fondo,' }, { t: 'las más antiguas', hi: true }], CX, 340, 64, { rot: 0.015 })); }
// ---- 5 · (14-17): baja un sedal: puedes ir a buscarlas
function s_fish() {
  const cam = camAtT(); world(cam);
  const y = lerp(1200, 3600, EZ.io(seg(TT, E0, E0 + 2.6))) - cam;
  hookAt(560, y, 560, -40, 2);
  DEFER.push(() => clayCard([{ t: 'Cuanto más hondo,' }, { t: 'más antigua la botella', hi: true }], CX, 340, 62, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(240, 980, 90); clouds2(640, 2, 14);
  clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd', '#8fcac6', '#5aa5b5'], { amp: 16, sp: 1.2 });
  floatBottle(560, 1420, 380);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
