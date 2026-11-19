// =====================================================================
//  GUION 4 · «Escríbele a un desconocido… que recién la lea dentro de un año»
//  La botella espera un año (el reloj de arena y los días que pasan) y llega a otra playa lejana.
// =====================================================================
const NOTE4 = ['Ojalá hoy sea', 'un buen día para ti.'];
const SAND4 = '#e6c873';
function beach4(o = {}) {
  skyGrad(o.sky0 ?? '#bfe3ee', o.sky1 ?? '#fdeccb', 1250);
  if (o.sun !== false) claySun(820, 940, 95);
  clouds2(620, 2, 14);
  clayWaves(1080, 100, ['#4f9bb0', '#6fb4bd', '#8fcac6'], { amp: 16, sp: 1.2 });
  clayMound(1430, SAND4, { amp: 50 });
}
// el reloj de arena: gira 180° en (t0, t0 + d)
function hourglass(x, y, w, t0, d = 0.7) {
  const u = EZ.io(seg(TT, t0, t0 + d));
  sprite('reloj.png', x, y, w, { rot: u * Math.PI + (TT >= t0 + d ? 0 : 0) });
}
// ---- 1 · GANCHO (0-3.5): el reloj de arena se da vuelta; la botella espera a su lado
function s_hook() {
  beach4();
  hourglass(760, 1450, 300, -0.25, 0.9);
  sprite('botella.png', 330, 1560, 420, { rot: -0.1 });
  for (let i = 0; i < 6; i++) { const a = TT * 2 + i; sparkle(760 + Math.cos(a) * 200, 1450 + Math.sin(a) * 230, 10 + 6 * Math.sin(TT * 4 + i), '#fff6d6'); }
  DEFER.push(() => clayCard([{ t: 'Escríbele a un desconocido…' }, { t: 'que la lea dentro de un año', hi: true }], CX, 420, 54, { rot: -0.015 }));
}
// ---- 2 · ESCRIBE (3.5-7)
function s_write() {
  beach4();
  hourglass(820, 1460, 240, 99);
  const inside = TT >= CU.inside;
  sprite(inside ? 'botella-abierta.png' : 'botella-vacia.png', 360, 1560, 480, { rot: -0.08 });
  notePaper(NOTE4, 500, 790, CU.write1, CU.write2, CU.roll, CU.fly, CU.inside, bottleLocal(360, 1560, 480, -0.08, 0.84, 0.16), { size: 76 });
  DEFER.push(() => clayCard([{ t: 'Escribe hoy' }, { t: 'a alguien que no conoces', hi: true }], CX, 330, 60, { rot: 0.015 }));
}
// ---- 3 · ESPERA (7-11): pasan los días y las noches; el reloj se da vuelta una y otra vez
function s_wait() {
  const day = 0.5 + 0.5 * Math.cos((TT - E0) * Math.PI * 1.6);   // 1 = día, 0 = noche
  skyGrad(mixH('#1d2a4f', '#bfe3ee', day), mixH('#34507e', '#fdeccb', day), 1250);
  if (day < 0.5) stars('w4', 40, 1000, 40);
  const ang = (TT - E0) * Math.PI * 1.6;
  const sx = 540 + Math.cos(ang + Math.PI / 2) * -380, sy = 1150 - Math.abs(Math.cos(ang / 2)) * 420;
  if (day > 0.4) claySun(sx, sy, 80); else { ctx.save(); ctx.shadowColor = 'rgba(255,240,200,0.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#f6ecc8'; ctx.beginPath(); ctx.arc(sx, sy, 60, 0, TAU); ctx.fill(); ctx.restore(); }
  clayWaves(1080, 100, ['#4f9bb0', '#6fb4bd', '#8fcac6'].map((c) => mixH('#1d2a4f', c, 0.35 + 0.65 * day)), { amp: 16, sp: 1.2 });
  clayMound(1430, mixH('#5a5a6e', SAND4, 0.4 + 0.6 * day), { amp: 50 });
  { let rot = 0; for (let k = 0; k < 3; k++) rot += EZ.io(seg(TT, E0 + 0.3 + k * 1.25, E0 + 0.9 + k * 1.25)) * Math.PI; sprite('reloj.png', 800, 1450, 260, { rot }); }
  sprite('botella.png', 340, 1560, 420, { rot: -0.1 });
  DEFER.push(() => clayCard([{ t: 'Tu botella espera' }, { t: 'un año entero', hi: true }], CX, 340, 66, { rot: -0.015 }));
}
// ---- 4 · ZARPA (11-14): cruza el mundo hacia una playa lejana
function s_globe() {
  skyGrad('#1d2a4f', '#33507a', 1920); stars('g4', 20, 1900, 60);
  const u = EZ.io(seg(TT, E0 + 0.3, E0 + 2.6)), cx = 540, cy = 1250, R = 470;
  sprite('globo2.png', cx, cy, 820, { rot: 0.2 - 0.4 * EZ.io(seg(TT, E0, E0 + 3)) });
  const pt = (v) => { const a = lerp(Math.PI * 1.85, Math.PI * 1.1, v); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; };
  for (let k = 0; k <= 40; k++) { const [x, y] = pt(k / 40 * u); dot(x, y, 6, 'rgba(255,255,255,0.85)'); }
  const [bx, by] = pt(u), [nx, ny] = pt(Math.min(1, u + 0.02));
  sprite('botella.png', bx, by - 20 + Math.sin(TT * 5) * 6, 240, { rot: Math.atan2(ny - by, nx - bx) + 0.35, sx: -1 });
  DEFER.push(() => clayCard([{ t: 'Después zarpa' }, { t: 'hacia una playa lejana', hi: true }], CX, 340, 62, { rot: 0.015 }));
}
// ---- 5 · LE LLEGA (14-17)
function s_found() {
  beach4({ sky0: '#f8cfb5', sky1: '#fde6c2' });
  birds(E0 + 0.2, 760);
  sprite('botella-vacia.png', 260, 1620, 300, { rot: 0.2 });
  personPop('viejo.png', 720, 1790, 380, E0);
  clayMound(1850, SAND4, { amp: 60, cx: 720, wid: 260, drop: 200 });
  DEFER.push(() => {
    clayCard([{ t: '…y le llega a alguien' }, { t: 'que no sabe quién eres', hi: true }], CX, 330, 58, { rot: 0.015 });
    clayCard([{ t: NOTE4[0] }, { t: NOTE4[1] }], CX, 600, 54, { rot: -0.03, s: popS(E0 + 0.5) });
  });
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  beach4();
  hourglass(780, 1450, 260, 99);
  floatBottle(380, 1250, 340);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
