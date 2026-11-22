// =====================================================================
//  GUION 13 · «¿Te llegó algo que no es para ti?»
//  Alguien lee una botella, sonríe y la devuelve al agua para que siga su viaje.
// =====================================================================
const NOTE13 = ['¿Alguien más extraña', 'el olor a lluvia?'];
// ---- 1 · GANCHO (0-3.5): una ola deja la botella a sus pies
function s_hook() {
  beachT({ sx: 820 });
  personPop('chico-lee.png', 700, 1800, 280, -1);
  const u = EZ.o2(seg(TT, 0, 1.6));
  sprite('botella.png', lerp(180, 360, u), lerp(1230, 1640, u), 300, { rot: lerp(-0.6, 0.15, u) + Math.sin(TT * 2.5) * 0.05 });
  if (TT < 1.8) splashClay(lerp(180, 360, u), lerp(1260, 1660, u), seg(TT, 0, 1.8));
  DEFER.push(() => clayCard([{ t: '¿Te llegó algo' }, { t: 'que no es para ti?', hi: true }], CX, 400, 66, { rot: -0.015 }));
}
// ---- 2 · LA LEE (3.5-7): la carta habla de algo que no es suyo
function s_read() {
  beachT({ sx: 820 });
  sprite('botella-vacia.png', 300, 1660, 280, { rot: 0.2 });
  personPop('chico-lee.png', 700, 1840, 330, E0 - 1);
  DEFER.push(() => {
    clayCard([{ t: 'La lees y sonríes…' }], CX, 360, 64, { rot: 0.015 });
    clayCard([{ t: NOTE13[0] }, { t: NOTE13[1] }], CX, 640, 58, { rot: -0.025, s: popS(E0 + 0.4) });
  });
}
// ---- 3 · LA DEVUELVE (7-10.5): la lanza otra vez al mar
function s_back() {
  beachT({ sx: 820 });
  personPop('chico-lanza.png', 720, 1820, 290, E0 - 1);
  if (TT < E0 + 0.5) sprite('botella.png', 760, 1180, 150, { rot: -0.5 });
  bottleArc(E0 + 0.5, E0 + 1.7, [760, 1180], [300, 1150], 300, 150, 220);
  if (TT >= E0 + 1.7) floatBottle(300, 1150, 220);
  DEFER.push(() => clayCard([{ t: 'Puedes devolverla' }, { t: 'al mar', hi: true }], CX, 380, 66, { rot: -0.015 }));
}
// ---- 4 · SIGUE (10.5-14): la botella sigue su viaje
function s_sail() {
  seaT({ sx: 240 });
  birds(E0, 760);
  floatBottle(lerp(200, 860, EZ.io(seg(TT, E0, E0 + 3.4))), 1320, 380);
  seaFront();
  DEFER.push(() => clayCard([{ t: 'y sigue su viaje' }, { t: 'hacia otra persona', hi: true }], CX, 380, 64, { rot: 0.015 }));
}
// ---- 5 · LLEGA (14-17): en otra playa, otra persona la encuentra
function s_arrive() {
  beachT({ a: '#f7d2bf', b: '#fde8c8', sx: 240 });
  sprite('palmera.png', 900, 1480, 300);
  sprite('botella.png', 300, 1660, 300, { rot: 0.2 });
  personPop('senora.png', 560, 1840, 300, E0);
  DEFER.push(() => clayCard([{ t: 'Quizás era' }, { t: 'para alguien más', hi: true }], CX, 380, 66, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  beachT();
  sprite('botella.png', 520, 1560, 460, { rot: -0.08 });
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
