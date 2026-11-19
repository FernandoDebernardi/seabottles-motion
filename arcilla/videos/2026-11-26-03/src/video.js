// =====================================================================
//  GUION 3 · «¿Qué le dirías a tu yo de dentro de un año?»
//  La botella espera en un muelle mientras pasan las estaciones y al año zarpa hacia quien la escribió.
// =====================================================================
const NOTE3 = ['¿Ya aprendiste', 'a tocar la guitarra?'];
const SEASONS = {
  oto: { sky: ['#f6c9a8', '#fbe4c6'], tree: 'hue-rotate(205deg) saturate(2.2) brightness(1.05)', sea: ['#5f8fa8', '#7aa8b8', '#98c0c4', '#6a9cb0'], sand: '#e3c26c' },
  inv: { sky: ['#cfe0ec', '#eef3f6'], tree: 'saturate(0.15) brightness(1.35)', sea: ['#6e93a8', '#88a9ba', '#a3bfca', '#7c9fb1'], sand: '#f2f6f8' },
  pri: { sky: ['#cde9e0', '#fbeedd'], tree: 'hue-rotate(-55deg) saturate(1.2)', sea: ['#4f9bb0', '#6fb4bd', '#8fcac6', '#5aa5b5'], sand: '#e6cc78' },
  ver: { sky: ['#a9dcef', '#fdf0cf'], tree: 'hue-rotate(-45deg) saturate(1.6)', sea: ['#3f93b0', '#5fb0c0', '#82c9c8', '#4aa0b5'], sand: '#ecd27f' },
};
function pier(x0, y) {
  // postes que entran al agua
  for (let x = x0 + 40; x < W + 60; x += 170) {
    ctx.save(); ctx.shadowColor = 'rgba(40,30,20,0.3)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    const g = ctx.createLinearGradient(x - 22, 0, x + 22, 0); g.addColorStop(0, '#8a5a32'); g.addColorStop(0.4, '#b07a48'); g.addColorStop(1, '#7a4c28');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - 22, y - 10, 44, 260, 18); ctx.fill(); ctx.restore();
  }
  // tablones
  ctx.save(); ctx.shadowColor = 'rgba(40,30,20,0.32)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
  const g = ctx.createLinearGradient(0, y - 30, 0, y + 30); g.addColorStop(0, '#d39a62'); g.addColorStop(1, '#a8703f');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x0, y - 30, W - x0 + 80, 60, 22); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(90,55,25,0.35)'; ctx.lineWidth = 3; for (let x = x0 + 90; x < W + 60; x += 90) { ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x, y + 26); ctx.stroke(); }
  ctx.restore();
}
function seasonWorld(key, o = {}) {
  const S = SEASONS[key];
  skyGrad(S.sky[0], S.sky[1], 1300);
  if (key === 'ver') claySun(820, 760, 110);
  else if (key !== 'inv') claySun(840, 840, 90, { col: '#f0b44a' });
  clouds2(560, 2, 14);
  if (key !== 'inv') birds(E0 + 0.3, 700);
  pier(380, 1250);
  if (o.bottle !== false) sprite('botella.png', 900, 1150 + Math.sin(TT * 2) * 3, 300, { rot: -0.1 });
  clayWaves(1320, 110, S.sea, { amp: 16, sp: 1.2 });
  clayMound(1330, S.sand, { amp: 140, cx: 60, wid: 420, drop: 700 });
  // el árbol de la orilla cambia con la estación
  sprite('arbol.png', 190, 1000, 360); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1000 - 240 + 0.64 * 480); ctx.clip(); ctx.filter = S.tree; sprite('arbol.png', 190, 1000, 360, { shadow: false }); ctx.restore();
  const R = RNG('fx' + key);
  if (key === 'oto') for (let i = 0; i < 18; i++) { const x = mod(R.r(0, 1080) + TT * R.r(80, 160), 1180) - 50, y = mod(R.r(600, 1300) + TT * 60, 1200) + 500, a = TT * 3 + i; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#d9772f' : '#e8a23a'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 8, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  if (key === 'inv') for (let i = 0; i < 60; i++) { const x = mod(R.r(0, 1080) + Math.sin(TT + i) * 30, 1080), y = mod(R.r(0, 1920) + TT * R.r(60, 140), 1920); dot(x, y, R.r(4, 9), 'rgba(255,255,255,0.9)'); }
  if (key === 'pri') for (let i = 0; i < 16; i++) { const a = R.r(0, TAU), r = R.r(20, 150); dot(190 + Math.cos(a) * r, 880 + Math.sin(a) * r * 0.8, R.r(8, 13) * Math.min(1, popS(E0 + 0.2 + i * 0.05)), '#f4a6b8'); }
}
// ---- 1 · GANCHO (0-3.5): el muelle en otoño; las hojas vuelan; la botella cae al muelle y rebota
function s_hook() {
  seasonWorld('oto', { bottle: false });
  const y = TT < 0.5 ? lerp(700, 1150, (TT / 0.5) ** 2) : 1150 - 60 * Math.abs(Math.sin((TT - 0.5) * 6)) * Math.exp(-(TT - 0.5) * 3);
  sprite('botella.png', 900, y, 300, { rot: TT < 0.5 ? -1 + TT * 2 : -0.1 });
  DEFER.push(() => clayCard([{ t: '¿Qué le dirías a tu yo' }, { t: 'de dentro de un año?', hi: true }], CX, 400, 64, { rot: -0.015 }));
}
// ---- 2 · ESCRIBE (3.5-7): una carta para ti, al futuro
function s_write() {
  seasonWorld('oto', { bottle: false });
  sprite(TT >= CU.inside ? 'botella-abierta.png' : 'botella-vacia.png', 880, 1150, 330, { rot: -0.1 });
  const lip = bottleLocal(880, 1150, 330, -0.1, 0.84, 0.16);
  notePaper(NOTE3, 520, 780, CU.write1, CU.write2, CU.roll, CU.fly, CU.inside, lip, { size: 72 });
  DEFER.push(() => clayCard([{ t: 'Escríbete' }, { t: 'una carta al futuro', hi: true }], CX, 330, 64, { rot: 0.015 }));
}
// ---- 3 y 4 · LAS ESTACIONES (7-13): la botella espera en el muelle
function s_wait1() {
  const key = TT < CU.winter ? 'oto' : 'inv'; seasonWorld(key);
  DEFER.push(() => clayCard([{ t: 'La botella espera…' }, { t: key === 'oto' ? 'otoño' : 'invierno', hi: true }], CX, 340, 66, { rot: -0.015 }));
}
function s_wait2() {
  const key = TT < CU.summer ? 'pri' : 'ver'; seasonWorld(key);
  DEFER.push(() => clayCard([{ t: 'La botella espera…' }, { t: key === 'pri' ? 'primavera' : 'verano', hi: true }], CX, 340, 66, { rot: 0.015 }));
}
// ---- 5 · ZARPA (13-15.5): al año, rueda al agua y se va
function s_sail() {
  seasonWorld('ver', { bottle: false });
  const r = seg(TT, E0 + 0.2, CU.splash);
  if (TT < CU.splash) sprite('botella.png', lerp(900, 1010, r), 1150 + 300 * r * r, 300, { rot: -0.1 + r * 3 });
  else floatBottle(lerp(1000, 560, EZ.io(seg(TT, CU.splash, E0 + 2.5))), 1430, 330);
  splashClay(1000, 1400, seg(TT, CU.splash, CU.splash + 0.6));
  DEFER.push(() => clayCard([{ t: 'Y al año, zarpa' }, { t: 'de vuelta a ti', hi: true }], CX, 340, 66, { rot: -0.015 }));
}
// ---- 6 · TE LLEGA (15.5-17.2): ella lee lo que se escribió hace un año
function s_found() {
  const S = SEASONS.ver; skyGrad(S.sky[0], S.sky[1], 1200); claySun(840, 980, 100); clouds2(560, 2, 14); birds(E0, 720);
  clayWaves(1060, 95, S.sea.slice(0, 3), { amp: 16, sp: 1.2 });
  clayMound(1420, S.sand, { amp: 50 });
  sprite('botella-vacia.png', 260, 1620, 300, { rot: 0.2 });
  personPop('chica-lentes.png', 700, 1800, 400, E0);
  clayMound(1790, S.sand, { amp: 70, cx: 700, wid: 300, drop: 200 });
  DEFER.push(() => {
    clayCard([{ t: '…y te llega' }, { t: 'un año después', hi: true }], CX, 330, 66, { rot: 0.015 });
    clayCard([{ t: NOTE3[0] }, { t: NOTE3[1] }], CX, 600, 52, { rot: -0.03, s: popS(E0 + 0.5) });
  });
}
// ---- 7 · CIERRE (17.2-20)
function s_close() {
  seasonWorld('ver', { bottle: false });
  floatBottle(600, 1440, 340);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
