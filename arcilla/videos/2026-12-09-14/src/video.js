// =====================================================================
//  GUION 14 · «Una carta, una respuesta. Sin apuro»
//  La botella va y vuelve entre dos playas; cada uno espera su turno.
// =====================================================================
function twoBeaches() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(540, 900, 80); clouds2(620, 2, 14);
  clayWaves(1100, 100, ['#5f9fb0', '#7ab8be', '#98ccc8'], { amp: 14, sp: 1.2 });
  clayMound(1520, SANDT, { amp: 120, cx: 120, wid: 260, drop: 400 });
  clayMound(1520, SANDT, { amp: 120, cx: 960, wid: 260, drop: 400 });
}
// ---- 1 · GANCHO (0-3.5): dos playas, la botella cruza entre las dos
function s_hook() {
  twoBeaches();
  personPop('abuelo-carta.png', 150, 1720, 200, -1);
  personPop('joven.png', 930, 1720, 190, -1);
  const u = (TT % 3.5) / 3.5, x = lerp(300, 780, EZ.io(u));
  floatBottle(x, 1300, 220, { rot: -0.12 });
  DEFER.push(() => clayCard([{ t: 'Una carta, una respuesta.' }, { t: 'Sin apuro', hi: true }], CX, 400, 60, { rot: -0.015 }));
}
// ---- 2 · ESCRIBE (3.5-7): él escribe en su playa
function s_write() {
  beachT({ sx: 820 });
  sprite('palmera.png', 230, 1500, 330);
  personPop('abuelo-carta.png', 640, 1840, 300, E0);
  DEFER.push(() => clayCard([{ t: 'Le escribes a alguien' }, { t: 'de otro país', hi: true }], CX, 380, 62, { rot: 0.015 }));
}
// ---- 3 · CRUZA (7-10.5): la botella cruza el mar, pasan los días
function s_cross() {
  const u = (TT - E0) / 3.5, night = Math.max(0, Math.sin(u * 2 * TAU - Math.PI / 2) * 0.5 + 0.5);
  skyGrad(mixH('#bfe3ee', '#1d2a4f', night), mixH('#fdeccb', '#3b4a7a', night), 1250);
  if (night > 0.5) { ctx.save(); ctx.globalAlpha = (night - 0.5) * 2; stars('c', 80, 1000, 30); ctx.restore(); moon(800, 900, 55); } else claySun(240, 960, 85);
  clayWaves(1160, 110, ['#4f9bb0', '#6fb4bd'], { amp: 16, sp: 1.2 });
  floatBottle(lerp(180, 880, u), 1320, 360);
  seaFront();
  DEFER.push(() => clayCard([{ t: 'Tu botella cruza el mar…' }], CX, 380, 62, { rot: -0.015 }));
}
// ---- 4 · RESPONDE (10.5-14): ella responde una sola vez
function s_reply() {
  beachT({ a: '#f7d2bf', b: '#fde8c8', sx: 240 });
  sprite('botella-vacia.png', 280, 1660, 280, { rot: 0.2 });
  personPop('joven.png', 690, 1840, 300, E0);
  DEFER.push(() => clayCard([{ t: '…y te responde' }, { t: 'una sola vez', hi: true }], CX, 380, 66, { rot: 0.015 }));
}
// ---- 5 · TU TURNO (14-17): la botella vuelve; ahora le toca a él
function s_turn() {
  twoBeaches();
  personPop('abuelo-carta.png', 150, 1720, 200, -1);
  personPop('joven.png', 930, 1720, 190, -1);
  floatBottle(lerp(780, 300, EZ.io(seg(TT, E0, E0 + 3))), 1300, 220, { rot: 0.12 });
  DEFER.push(() => clayCard([{ t: 'Después, tu turno.' }, { t: 'Como cartas de antes', hi: true }], CX, 400, 60, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  beachT();
  sprite('botella.png', 520, 1560, 460, { rot: -0.08 });
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
