// =====================================================================
//  GUION 7 · «¿Sobre qué escribirías hoy?»
//  La botella entra en mares de distintos colores: cada mar es un tema (dibujos reales de la app).
// =====================================================================
const MARES = [
  ['mar-amor.png', 'amor', ['#e98a86', '#f0a59c', '#f6c1b5'], '#fbd9cf'],
  ['mar-secretos.png', 'secretos', ['#6d6aa6', '#8683bb', '#a19ecd'], '#d9d6ef'],
  ['mar-recuerdos.png', 'recuerdos', ['#c99a5b', '#d8b077', '#e6c896'], '#f6e6c8'],
  ['mar-pensamientos.png', 'pensamientos', ['#6fa97c', '#8cc094', '#aad5ae'], '#dff0d8'],
  ['mar-actualidad.png', 'actualidad', ['#4f8fc0', '#6ea8d2', '#8fc0e0'], '#d6e9f5'],
];
function marAt(t0, per) { return Math.min(MARES.length - 1, Math.max(0, Math.floor((TT - t0) / per))); }
// burbuja de pensamiento de arcilla
function thought(x, y, r) {
  ctx.save(); ctx.shadowColor = 'rgba(40,30,20,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; ctx.fillStyle = PAPER;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 0.75, y + r * 1.15, r * 0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 1.0, y + r * 1.55, r * 0.11, 0, TAU); ctx.fill(); ctx.restore();
}
// ---- 1 · GANCHO (0-3.5): él piensa; en la burbuja pasan los mares
function s_hook() {
  skyGrad('#c9e6ee', '#fdeccb', 1250); claySun(860, 1000, 90); clouds2(640, 2, 14);
  clayWaves(1100, 100, ['#4f9bb0', '#6fb4bd', '#8fcac6'], { amp: 16, sp: 1.2 });
  clayMound(1450, '#e6c873', { amp: 50 });
  personPop('pensador.png', 330, 1800, 230, -1);
  clayMound(1840, '#e6c873', { amp: 50, cx: 330, wid: 220, drop: 200 });
  thought(700, 1130, 190);
  const i = Math.floor(TT / 0.55) % MARES.length, k = 0.85 + 0.15 * EZ.back(clamp((TT % 0.55) / 0.2));
  sprite(MARES[i][0], 700, 1130, 290 * k, { shadow: false });
  DEFER.push(() => clayCard([{ t: '¿Sobre qué' }, { t: 'escribirías hoy?', hi: true }], CX, 420, 76, { rot: -0.015 }));
}
// ---- 2 y 3 · LOS MARES (3.5-10.5): la botella cruza cinco mares, cada uno de su color
const PER = 1.4;
function marScene(card) {
  const t0 = 3.5, i = marAt(t0, PER), u = seg(TT, t0 + i * PER, t0 + (i + 1) * PER), M = MARES[i], P = MARES[Math.max(0, i - 1)];
  const blend = i > 0 ? EZ.io(clamp(u / 0.25)) : 1, mix3 = (k) => mixH(P[2][k], M[2][k], blend);
  skyGrad(mixH(P[3], M[3], blend), '#fdf5e6', 1250); clouds2(820, 2, 14);
  clayWaves(1180, 110, [mix3(0), mix3(1), mix3(2), mix3(0)], { amp: 18, sp: 1.4 });
  floatBottle(lerp(-120, 1200, seg(TT, 3.5, 10.5)), 1430, 340);
  sprite(M[0], 540, 700, 340 * Math.min(1, popS(t0 + i * PER)), { shadow: false });
  DEFER.push(() => {
    clayCard(card, CX, 340, 60, { rot: -0.015 });
    clayCard([{ t: 'mar de ' + M[1], hi: true }], CX, 950, 60, { rot: 0.02, s: popS(t0 + i * PER + 0.1) });
  });
}
function s_mares1() { marScene([{ t: 'Cada tema' }, { t: 'es un mar', hi: true }]); }
function s_mares2() { marScene([{ t: 'Tu botella navega' }, { t: 'el mar que elijas', hi: true }]); }
// ---- 4 · ELIGE (10.5-14): tres mares vuelan hacia la botella
function s_choose() {
  skyGrad('#c9e6ee', '#fdeccb', 1250); claySun(860, 1000, 90); clouds2(640, 2, 14);
  clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd', '#8fcac6', '#5aa5b5'], { amp: 18, sp: 1.3 });
  const bx = 540, by = 1420; floatBottle(bx, by, 380);
  [0, 2, 3].forEach((mi, j) => {
    const t = E0 + 0.5 + j * 0.8, u = EZ.io(seg(TT, t + 0.5, t + 1.2)), x0 = 220 + j * 320, y0 = 760;
    if (TT < t) return;
    const s = Math.min(1, popS(t)) * (1 - 0.75 * u);
    sprite(MARES[mi][0], lerp(x0, bx + 80, u), lerp(y0, by - 120, u), 250 * s, { shadow: false });
    if (u >= 1) sparkle(bx + 80, by - 140, 30 * Math.max(0, 1 - (TT - t - 1.2) * 2), '#fff6d6');
  });
  DEFER.push(() => clayCard([{ t: 'Elige de uno' }, { t: 'a tres mares', hi: true }], CX, 340, 68, { rot: 0.015 }));
}
// ---- 5 · QUÉ ES (14-17): zarpa hacia alguien que explora esos mares
function s_what() {
  skyGrad('#f8cfb5', '#fde6c2', 1250); claySun(540, 1150, 120, { col: '#f0a64a', hi: '#ffd27a' }); clouds2(640, 2, 12); birds(E0, 760);
  clayWaves(1180, 110, ['#6f9fb0', '#8bb7bd', '#a8cbc6', '#7aa9b3'], { amp: 16, sp: 1.0 });
  floatBottle(lerp(360, 760, EZ.io(seg(TT, E0, E0 + 3))), 1420, lerp(360, 260, EZ.io(seg(TT, E0, E0 + 3))));
  DEFER.push(() => clayCard([{ t: 'Sin tu nombre, llega a alguien' }, { t: 'que explora esos mares', hi: true }], CX, 360, 54, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  skyGrad('#c9e6ee', '#fdeccb', 1250); claySun(860, 1000, 90); clouds2(640, 2, 14);
  clayWaves(1180, 110, ['#4f9bb0', '#6fb4bd', '#8fcac6', '#5aa5b5'], { amp: 18, sp: 1.3 });
  floatBottle(540, 1420, 380);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
