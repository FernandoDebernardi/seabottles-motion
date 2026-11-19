// =====================================================================
//  GUION 8 · «¿Y si pudieras pescar un mensaje?»
//  Baja un sedal al fondo del mar, tiembla y sube una botella de otra persona.
// =====================================================================
const NOTE8 = ['Hoy vi nevar', 'por primera vez.'];
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
function seafloor(y) {
  // algas que se mecen
  for (let i = 0; i < 9; i++) { const x = 60 + i * 125, h = 260 + (i % 3) * 90;
    ctx.save(); ctx.strokeStyle = i % 2 ? '#3f8a5a' : '#5aa06a'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(x, y + 60); for (let k = 1; k <= 10; k++) { const v = k / 10; ctx.lineTo(x + Math.sin(TT * 1.8 + i + v * 3) * 30 * v, y + 60 - h * v); } ctx.stroke(); ctx.restore(); }
  clayMound(y + 40, '#3d4f66', { amp: 90, cx: 220, wid: 260, drop: 120 });
  clayMound(y + 80, '#c7a866', { amp: 40 });
}
function swimFish(t0, y, dir, w, ph = 0) {
  const x = dir > 0 ? -200 + (TT - t0) * 260 : 1280 - (TT - t0) * 260;
  sprite('pez.png', x, y + Math.sin(TT * 4 + ph) * 18, w, { sx: dir > 0 ? -1 : 1, rot: Math.sin(TT * 4 + ph) * 0.08 });
}
// ---- 1 · GANCHO (0-3.5): el sedal baja al agua desde arriba
function s_hook() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(240, 980, 90); clouds2(640, 2, 14);
  const y = lerp(820, 1500, seg(TT, 0, 2.6));
  clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd'], { amp: 16, sp: 1.2 });
  hookAt(760, y);
  clayWaves(1400, 110, ['#8fcac6', '#5aa5b5', '#4f9bb0'], { amp: 16, sp: 1.2 });
  splashClay(760, 1240, seg(TT, 0.5, 1.1));
  clayFish(0.2, 0.9, 160, 420, 1330, 300, 170);
  clayFish(1.9, 0.9, 960, 720, 1450, 260, 150);
  DEFER.push(() => clayCard([{ t: '¿Y si pudieras' }, { t: 'pescar un mensaje?', hi: true }], CX, 420, 72, { rot: -0.015 }));
}
// ---- 2 · BAJA (3.5-7): bajo el agua, el anzuelo baja; pasan peces
function s_down() {
  const u = seg(TT, E0, E0 + 3.5);
  deep(u * 0.8);
  swimFish(E0 - 0.5, 1200, 1, 220); swimFish(E0 + 0.6, 1550, -1, 160, 2);
  hookAt(700, lerp(1000, 1500, u), 700, -40);
  DEFER.push(() => clayCard([{ t: 'Baja el sedal' }, { t: 'hasta el fondo', hi: true }], CX, 340, 68, { rot: 0.015 }));
}
// ---- 3 · TIEMBLA (7-10.5): en el fondo hay una botella; el sedal tiembla y la engancha
const BB = { x: 560, y: 1560 };
function s_bite() {
  deep(0.85);
  swimFish(E0 + 0.4, 1080, -1, 180, 1);
  sprite('botella.png', BB.x, BB.y, 380, { rot: 0.35 });
  seafloor(1640);
  const lip = bottleLocal(BB.x, BB.y, 380, 0.35, 0.84, 0.16), u = EZ.io(seg(TT, E0, E0 + 1.6)), wig = TT > CU.bite ? 18 * Math.exp(-(TT - CU.bite) * 1.2) + 4 : 0;
  hookAt(lerp(700, lip[0] + 20, u), lerp(1100, lip[1] - 60, u) + (TT > CU.bite ? Math.sin(TT * 40) * 8 : 0), lerp(700, lip[0] + 20, u), -40, wig);
  DEFER.push(() => clayCard([{ t: 'Algo tiembla…', hi: true }], CX, 340, 70, { rot: -0.015 }));
}
// ---- 4 · SUBE (10.5-14): la botella sube con el sedal y sale a la superficie
function s_up() {
  const u = EZ.i2(seg(TT, E0 + 0.2, CU.surface));
  if (TT < CU.surface) {
    deep(0.85 - u * 0.85);
    const by = lerp(1500, 200, u); swimFish(E0, 900, 1, 170, 3);
    hookAt(560, by - 170, 560, -40, 3);
    sprite('botella.png', 560, by, 360, { rot: -1.2 + Math.sin(TT * 3) * 0.1 });
  } else {
    skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(240, 980, 90); clouds2(640, 2, 14);
    clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd'], { amp: 16, sp: 1.2 });
    const v = EZ.o2(seg(TT, CU.surface, CU.surface + 0.8));
    hookAt(560, lerp(1300, 820, v) - 170, 560, -40, 2);
    sprite('botella.png', 560, lerp(1300, 820, v), 380, { rot: -1.2 + Math.sin(TT * 3) * 0.1 });
    splashClay(560, 1230, seg(TT, CU.surface, CU.surface + 0.6));
    clayWaves(1400, 110, ['#8fcac6', '#5aa5b5', '#4f9bb0'], { amp: 16, sp: 1.2 });
  }
  DEFER.push(() => clayCard([{ t: '…y sube una botella' }, { t: 'de otra persona', hi: true }], CX, 340, 64, { rot: 0.015 }));
}
// ---- 5 · LA LEES (14-17): en la arena, la botella abierta y la nota
function s_read() {
  skyGrad('#f8cfb5', '#fde6c2', 1250); claySun(840, 1000, 100); clouds2(640, 2, 12); birds(E0, 760);
  clayWaves(1080, 100, ['#5f8fa8', '#7aa8b8', '#98c0c4'], { amp: 16, sp: 1.1 });
  clayMound(1430, '#e6c873', { amp: 50 });
  sprite('botella-vacia.png', 380, 1600, 420, { rot: 0.15 });
  { const ck = asset('corcho.png'), bt = asset('botella.png'); if (ck && bt) sprite('corcho.png', 700, 1690, 420 * ck.naturalWidth / bt.naturalWidth, { rot: 1.3 }); }
  DEFER.push(() => {
    clayCard([{ t: 'Lees lo que escribió' }, { t: 'alguien de otro país', hi: true }], CX, 330, 62, { rot: -0.015 });
    clayCard([{ t: NOTE8[0] }, { t: NOTE8[1] }], CX, 610, 60, { rot: 0.025, s: popS(E0 + 0.3) });
    clayCard([{ t: 'Sin puntos ni premios.' }], CX, 860, 50, { rot: -0.01, s: popS(E0 + 1.2) });
  });
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(240, 980, 90); clouds2(640, 2, 14);
  clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd', '#8fcac6', '#5aa5b5'], { amp: 16, sp: 1.2 });
  floatBottle(560, 1420, 380);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
