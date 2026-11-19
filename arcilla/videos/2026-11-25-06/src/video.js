// =====================================================================
//  GUION 6 · «No eliges a quién le llega»
//  Muchas botellas salen al mar y las olas las reparten a lugares al azar.
// =====================================================================
const SEA6 = ['#4f9bb0', '#6fb4bd', '#8fcac6', '#5aa5b5'];
function daySky(a = '#bfe0ee', b = '#fcebd0') { skyGrad(a, b, 1250); }
function tealClouds(y) { for (let i = 0; i < 2; i++) sprite('nube-teal.png', mod(100 + i * 600 + TT * 20, W + 400) - 200, y + i * 120, 260 - i * 50); }
const SPOTS = [[180, 1300, 0.0], [420, 1380, 0.25], [660, 1290, 0.5], [880, 1400, 0.15], [300, 1520, 0.4], [760, 1540, 0.6]];
// ---- 1 · GANCHO (0-3.5): seis botellas caen al mar al mismo tiempo
function s_hook() {
  daySky(); tealClouds(560); claySun(860, 1060, 100);
  clayWaves(1180, 110, SEA6, { amp: 18, sp: 1.4 });
  SPOTS.forEach(([x, y, d], i) => {
    const t1 = 0.45 + d, u = TT / t1;
    if (TT < t1) sprite('botella.png', lerp(x - 120, x, u), lerp(560 + (i % 3) * 70, y, u * u), 300, { rot: 2 + u * 4 + i });
    else floatBottle(x, y, 260, { ph: i });
    splashClay(x, y + 20, seg(TT, t1, t1 + 0.6));
  });
  DEFER.push(() => clayCard([{ t: 'No eliges' }, { t: 'a quién le llega', hi: true }], CX, 400, 70, { rot: -0.015 }));
}
// ---- 2 · EL MAR REPARTE (3.5-7): las olas las llevan cada una para su lado
function s_spread() {
  daySky(); tealClouds(560); claySun(860, 1060, 100);
  clayWaves(1180, 110, SEA6, { amp: 24, sp: 2.2 });
  SPOTS.forEach(([x, y], i) => {
    const u = EZ.io(seg(TT, E0 + i * 0.1, E0 + 3.4)), dir = [-1, -0.4, 0.4, 1, -0.8, 0.8][i];
    floatBottle(x + dir * 520 * u, y - 60 * u * (i % 2), 260 * (1 - 0.35 * u), { ph: i });
  });
  DEFER.push(() => clayCard([{ t: 'El mar las reparte' }, { t: 'al azar', hi: true }], CX, 340, 66, { rot: 0.015 }));
}
// ---- 3 · A UNA ISLA (7-9.7)
function s_island() {
  daySky('#a9dcef', '#fdf0cf'); claySun(200, 980, 90); tealClouds(640);
  clayWaves(1180, 110, SEA6.slice(0, 1), { amp: 14, sp: 1 });
  sprite('isla.png', 640, 1150, 560);
  clayWaves(1290, 110, SEA6.slice(1), { amp: 18, sp: 1.3 });
  const u = EZ.io(seg(TT, E0, E0 + 2.2));
  floatBottle(lerp(80, 470, u), lerp(1550, 1290, u), 240);
  DEFER.push(() => clayCard([{ t: 'Quizás a una isla…' }], CX, 340, 66, { rot: -0.015 }));
}
// ---- 4 · A UN PESCADOR (9.7-12.4): la botella choca con su bote
function s_boat() {
  skyGrad('#f6cbb6', '#fbe4c6', 1250); claySun(820, 1060, 110, { col: '#f0a64a', hi: '#ffd27a' }); clouds2(600, 2, 14); birds(E0, 760);
  const bx = lerp(380, 560, EZ.io(seg(TT, E0, E0 + 2.6))), by = 1030 + Math.sin(TT * 2.4) * 10;
  sprite('pescador.png', bx, by, 440, { rot: Math.sin(TT * 2.1) * 0.04 });
  const u = EZ.io(seg(TT, E0, E0 + 1.6)); floatBottle(lerp(1000, bx + 250, u), 1230, 220);
  clayWaves(1230, 110, ['#5f8fa8', '#7aa8b8', '#98c0c4', '#6a9cb0'], { amp: 16, sp: 1.3 });
  DEFER.push(() => clayCard([{ t: '…a alguien' }, { t: 'que salió a pescar…' }], CX, 340, 62, { rot: 0.015 }));
}
// ---- 5 · A LA NIEVE (12.4-15.2): ella la encontró en una costa fría
function s_snow() {
  skyGrad('#cfe1ee', '#eef4f6', 1250); clouds2(560, 2, 10);
  // montes nevados al fondo
  clayMound(1120, '#e9f1f4', { amp: 230, cx: 260, wid: 330 }); clayMound(1150, '#dfeaf0', { amp: 180, cx: 820, wid: 300 });
  clayWaves(1180, 90, ['#6e93a8', '#88a9ba'], { amp: 12, sp: 0.9 });
  clayMound(1500, '#f4f8fa', { amp: 50 });
  sprite('botella-vacia.png', 270, 1640, 300, { rot: 0.25 });
  personPop('invierno.png', 700, 1800, 360, E0);
  clayMound(1790, '#f4f8fa', { amp: 70, cx: 700, wid: 280 });
  const R = RNG('snow6'); for (let i = 0; i < 60; i++) { const x = mod(R.r(0, 1080) + Math.sin(TT + i) * 30 + TT * 20, 1080), y = mod(R.r(0, 1920) + TT * R.r(60, 140), 1920); dot(x, y, R.r(4, 9), 'rgba(255,255,255,0.9)'); }
  DEFER.push(() => clayCard([{ t: '…o a alguien' }, { t: 'en una costa con nieve', hi: true }], CX, 340, 60, { rot: -0.015 }));
}
// ---- 6 · QUÉ ES (15.2-17): escribes una vez, el mar elige
function s_what() {
  daySky(); tealClouds(560); claySun(860, 1060, 100);
  clayWaves(1180, 110, SEA6, { amp: 18, sp: 1.3 });
  floatBottle(lerp(300, 560, EZ.io(seg(TT, E0, E0 + 1.8))), 1420, 380);
  DEFER.push(() => clayCard([{ t: 'Tú escribes.' }, { t: 'El mar elige.', hi: true }], CX, 380, 72, { rot: 0.015 }));
}
// ---- 7 · CIERRE (17-20)
function s_close() {
  daySky(); tealClouds(560); claySun(860, 1060, 100);
  clayWaves(1180, 110, SEA6, { amp: 18, sp: 1.3 });
  floatBottle(560, 1420, 380);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
