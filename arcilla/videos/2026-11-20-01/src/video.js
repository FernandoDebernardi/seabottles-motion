// =====================================================================
//  GUION 1 · «¿Le contarías un secreto a alguien que nunca vas a conocer?»
//  Una mano escribe, enrolla el papel, la botella se lanza y cruza el mundo; alguien de otro país la lee.
// =====================================================================
const NIGHT_SKY = '#568b95';
const NOTE1 = ['Algo que nunca', 'le dije a nadie…'];
function nightSea(o = {}) {
  fillBg(NIGHT_SKY);
  const img = asset('noche.png');
  if (img) { const k = 1080 / img.naturalWidth; ctx.drawImage(img, -60, o.y ?? -60, 1200, img.naturalHeight * 1200 / img.naturalWidth); }
  // estrellas que titilan sobre el cielo de arcilla
  const R = RNG('tw1'); for (let i = 0; i < 14; i++) { const x = R.r(60, 1020), y = R.r(120, 560), f = 0.5 + 0.5 * Math.sin(TT * 3 + i * 1.3); sparkle(x, y, 6 + 6 * f, '#fff6d6'); }
  clayWaves(1090, 120, ['#7fb3b0', '#9fc7c0', '#6c9e9e', '#a9cfc6'], { amp: 18, sp: 1.4 });
}
const SAND1 = '#e3c56f';
function girlOnDune(t0) {
  personPop('chica-secreto.png', 800, 1735, 300, t0);
  clayMound(1790, SAND1, { amp: 110, cx: 820, wid: 330 });
}
// ---- 1 · GANCHO (0-3.5): noche; la botella cae al mar y salpica; ella se lleva el dedo a los labios
function s_hook() {
  nightSea();
  const sx = 400, sy = 1300;
  if (TT < CU.splash) { const u = TT / CU.splash; sprite('botella.png', lerp(80, sx, u), lerp(760, sy, u * u), 380, { rot: 2.4 + u * 3.4 }); }
  else floatBottle(sx + (TT - CU.splash) * 18, sy, 360);
  splashClay(sx, sy + 20, seg(TT, CU.splash, CU.splash + 0.6));
  girlOnDune(-1);
  DEFER.push(() => clayCard([{ t: '¿Le contarías un secreto' }, { t: 'a alguien que nunca' }, { t: 'vas a conocer?', hi: true }], CX, 420, 58, { rot: -0.015 }));
}
// ---- 2 · ESCRIBE (3.5-7.5): la mano escribe sin nombre; el papel se enrolla y entra en la botella
const B1 = { cx: 330, cy: 1560, w: 560, rot: -0.08 };
function s_write() {
  nightSea();
  clayMound(1500, SAND1, { amp: 60 });
  const inside = TT >= CU.inside;
  sprite(inside ? 'botella-abierta.png' : 'botella-vacia.png', B1.cx, B1.cy, B1.w, { rot: B1.rot });
  const lip = bottleLocal(B1.cx, B1.cy, B1.w, B1.rot, 0.84, 0.16);
  notePaper(NOTE1, 500, 790, CU.write1, CU.write2, CU.roll, CU.fly, CU.inside, lip);
  DEFER.push(() => clayCard([{ t: 'Escríbelo' }, { t: 'sin tu nombre', hi: true }], CX, 330, 64, { rot: -0.015 }));
}
// ---- 3 · LÁNZALO (7.5-10.5): la botella cerrada vuela girando al mar y se aleja flotando
function s_throw() {
  nightSea();
  const land = [560, 1260];
  bottleArc(E0 + 0.1, CU.splash2, [120, 1900], land, 700, 420, 330);
  if (TT >= CU.splash2) floatBottle(land[0] + (TT - CU.splash2) * 60, land[1], 330);
  clayMound(1800, SAND1, { amp: 40 });
  DEFER.push(() => clayCard([{ t: 'Lánzalo' }, { t: 'al mar', hi: true }], CX, 330, 64, { rot: 0.015 }));
}
// ---- 4 · EL MUNDO (10.5-14): el globo gira; la botella lo cruza con una estela de puntos
function s_globe() {
  skyGrad('#1d2a4f', '#33507a', 1920);
  stars('g1', 20, 1900, 60);
  const u = EZ.io(seg(TT, E0 + 0.3, CU.arrive)), cx = 540, cy = 1250, R = 470;
  sprite('globo2.png', cx, cy, 820, { rot: -0.2 + 0.4 * EZ.io(seg(TT, E0, E0 + 3.5)) });
  const pt = (v) => { const a = lerp(Math.PI * 1.1, Math.PI * 1.85, v); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; };
  for (let k = 0; k <= 40; k++) { const [x, y] = pt(k / 40 * u); dot(x, y, 6, 'rgba(255,255,255,0.85)'); }
  const [bx, by] = pt(u), [nx, ny] = pt(Math.min(1, u + 0.02));
  sprite('botella.png', bx, by - 20 + Math.sin(TT * 5) * 6, 240, { rot: Math.atan2(ny - by, nx - bx) - 0.35 });
  if (TT > CU.arrive) { const [x, y] = pt(1); sparkle(x, y + 60, 44 * popS(CU.arrive), '#fff8dc'); }
  DEFER.push(() => clayCard([{ t: 'Viaja sin tu nombre' }, { t: 'a otro país', hi: true }], CX, 340, 64, { rot: -0.015 }));
}
// ---- 5 · LE LLEGA (14-17.2): playa de día en otro país; él lee la nota; la botella queda vacía en la arena
function s_found() {
  skyGrad('#bfe2ea', '#fbe6c4', 1150);
  clouds2(820, 2, 16);
  claySun(840, 1010, 100);
  birds(E0 + 0.2, 720);
  clayWaves(1060, 95, ['#5fa8b0', '#7fc0bf', '#9ed3c9'], { amp: 16, sp: 1.2 });
  clayMound(1420, '#e9cf7d', { amp: 50 });
  sprite('botella-vacia.png', 250, 1600 + Math.sin(TT * 1.5) * 3, 330, { rot: 0.2 });
  { const ck = asset('corcho.png'), bt = asset('botella.png'); if (ck && bt) sprite('corcho.png', 430, 1700, 330 * ck.naturalWidth / bt.naturalWidth, { rot: 1.4 }); }
  personPop('hombre-lee.png', 720, 1820, 400, E0);
  DEFER.push(() => {
    clayCard([{ t: '…y lo lee alguien' }, { t: 'del otro lado del mar', hi: true }], CX, 330, 58, { rot: 0.01 });
    clayCard([{ t: NOTE1[0] }, { t: NOTE1[1] }], CX, 610, 58, { rot: -0.03, s: popS(CU.unroll) });
  });
}
// ---- 6 · CIERRE (17.2-20): la noche del gancho; la invitación y la dirección
function s_close() {
  nightSea();
  floatBottle(480, 1300, 360);
  girlOnDune(-1);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
