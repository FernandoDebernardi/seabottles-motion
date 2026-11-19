// =====================================================================
//  GUION 5 · «Nadie sabe quién eres. Ni siquiera nosotros»
//  El nombre se tacha; la botella viaja sin remitente; al llegar, el sello muestra solo ciudad y fecha.
// =====================================================================
const NOTE5 = ['Hoy aprendí a nadar', 'a los 60 años.'];
// mar al atardecer con el faro en la roca de la derecha y su luz que barre
function lightSea(night = 0) {
  skyGrad(mixHex('#f2b8a8', '#1f2d55', night), mixHex('#fbe0c0', '#3a5482', night), 1300);
  if (night > 0.3) stars('ls5', 40, 1000, 50);
  if (night < 0.5) { claySun(300, 1130, 120, { col: '#f0a64a', hi: '#ffd27a' }); clouds2(760, 2, 12); }
  else { ctx.save(); ctx.shadowColor = 'rgba(255,240,200,0.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#f6ecc8'; ctx.beginPath(); ctx.arc(260, 760, 70, 0, TAU); ctx.fill(); ctx.restore(); }
  // el haz del faro
  const lx = 860, ly = 900, a = Math.sin(TT * 1.3) * 0.9 + Math.PI;
  ctx.save(); ctx.globalAlpha = 0.18 + 0.2 * night; const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, 900); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, 'rgba(255,243,176,0)'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a - 0.12) * 1200, ly + Math.sin(a - 0.12) * 1200); ctx.lineTo(lx + Math.cos(a + 0.12) * 1200, ly + Math.sin(a + 0.12) * 1200); ctx.fill(); ctx.restore();
  sprite('faro.png', 860, 1090, 230);
  clayWaves(1170, 110, ['#5f8fa8', '#7aa8b8', '#98c0c4', '#6a9cb0'].map((c) => mixH(c, '#1d2a4f', night * 0.5)), { amp: 18, sp: 1.2 });
}
// papel con el nombre que se tacha
function namePaper(cx, cy, s, tScr) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.04); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(40,30,20,0.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-330, -110, 660, 220, 30); ctx.fill(); ctx.shadowColor = 'transparent';
  const w = writeOn('Me llamo Lucía', -270, 30, 96, 1);
  // tachón a mano: zigzag que avanza sobre «Lucía»
  const f = EZ.io(seg(TT, tScr, tScr + 1.2)), x0 = -270 + w * 0.56, x1 = -270 + w + 10;
  ctx.strokeStyle = '#2b3f6b'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  const n = 9; for (let i = 0; i <= n * f; i++) { const x = lerp(x0, x1, i / n), y = (i % 2 ? -42 : 18); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
  return [cx - 270 * s + lerp(x0 + 270, x1 + 270, f) * s, cy + (Math.round(f * 9) % 2 ? -42 : 18) * s];
}
// ---- 1 · GANCHO (0-3.5): el nombre se tacha con lápiz
function s_hook() {
  lightSea(0);
  const [px, py] = namePaper(540, 820, 1, -0.3);
  if (TT < 1.2) { const mn = asset('mano-verde.png'), mw = 340, mh = mn ? mw * mn.naturalHeight / mn.naturalWidth : 400; sprite('mano-verde.png', px + mw * (0.5 - MANO2_TIP[0]), py + mh * (0.5 - MANO2_TIP[1]), mw); }
  else { const u = EZ.i2(seg(TT, 1.2, 1.7)); const mn = asset('mano-verde.png'), mw = 340, mh = mn ? mw * mn.naturalHeight / mn.naturalWidth : 400; if (u < 1) sprite('mano-verde.png', 760 + mw * 0.48 + u * 500, 830 - mh * 0.48 - u * 300, mw); }
  floatBottle(380, 1420, 380);
  DEFER.push(() => clayCard([{ t: 'Nadie sabe quién eres.' }, { t: 'Ni siquiera nosotros.', hi: true }], CX, 400, 64, { rot: -0.015 }));
}
// ---- 2 · ESCRIBE (3.5-7.5): lo que escribes viaja sin nombre y sin foto
function s_write() {
  lightSea(0);
  floatBottle(380, 1420, 380, { name: TT >= CU.inside ? 'botella.png' : 'botella-abierta.png' });
  const lip = bottleLocal(380, 1420, 380, -0.12, 0.84, 0.16);
  notePaper(NOTE5, 520, 800, CU.write1, CU.write2, CU.roll, CU.fly, CU.inside, lip, { size: 80 });
  DEFER.push(() => clayCard([{ t: 'Sin nombre' }, { t: 'y sin foto', hi: true }], CX, 330, 66, { rot: 0.015 }));
}
// ---- 3 · VIAJA (7.5-11): de noche, la botella pasa frente al faro
function s_night() {
  const nk = EZ.io(seg(TT, E0, E0 + 1.5));
  lightSea(nk);
  floatBottle(lerp(160, 700, EZ.io(seg(TT, E0, E0 + 3.5))), 1400, 380);
  if (nk > 0) { ctx.fillStyle = `rgba(20,28,64,${0.3 * nk})`; ctx.fillRect(0, 1150, W, H); }
  DEFER.push(() => clayCard([{ t: 'Viaja por el mar' }, { t: 'sin remitente', hi: true }], CX, 340, 66, { rot: -0.015 }));
}
// ---- 4 · LE LLEGA (11-14.5): de día, en otra costa; ella la lee
function s_found() {
  skyGrad('#c6e4ea', '#fdebc8', 1150);
  clouds2(560, 2, 16); claySun(830, 980, 100); birds(E0 + 0.2, 760);
  clayWaves(1040, 95, ['#5fa8b0', '#7fc0bf', '#9ed3c9'], { amp: 16, sp: 1.2 });
  clayMound(1430, '#e9cf7d', { amp: 50 });
  sprite('botella-vacia.png', 260, 1620 + Math.sin(TT * 1.5) * 3, 320, { rot: 0.2 });
  personPop('senora.png', 700, 1800, 380, E0);
  clayMound(1800, '#e9cf7d', { amp: 70, cx: 700, wid: 300 });
  DEFER.push(() => clayCard([{ t: 'Le llega a alguien' }, { t: 'de otro país', hi: true }], CX, 340, 66, { rot: 0.015 }));
}
// ---- 5 · EL SELLO (14.5-17): la nota, el sello con ciudad y fecha; el nombre no está
function s_stamp() {
  fillBg('#e9cf7d'); const g = ctx.createRadialGradient(540, 900, 100, 540, 900, 1200); g.addColorStop(0, '#f6e2a6'); g.addColorStop(1, '#d9b863'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const R = RNG('sand5'); for (let i = 0; i < 90; i++) dot(R.r(0, 1080), R.r(0, 1920), R.r(2, 5), 'rgba(160,120,50,0.25)');
  sprite('botella-vacia.png', 300, 1560, 420, { rot: 0.25 });
  const k = 1 + 0.03 * EZ.io(seg(TT, E0, E0 + 2.5));
  ctx.save(); ctx.translate(540, 820); ctx.scale(k, k); ctx.translate(-540, -820);
  ctx.save(); ctx.translate(540, 820); ctx.rotate(0.03); ctx.shadowColor = 'rgba(40,30,20,0.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-400, -230, 800, 460, 34); ctx.fill(); ctx.shadowColor = 'transparent';
  writeOn(NOTE5[0], -340, -40, 80, 1); writeOn(NOTE5[1], -340, 70, 80, 1); ctx.restore();
  // el sello cae y golpea
  const sl = seg(TT, CU.stamp - 0.25, CU.stamp), s = TT < CU.stamp ? lerp(1.5, 1, EZ.i2(sl)) : 1 + 0.08 * Math.exp(-(TT - CU.stamp) * 10) * Math.sin((TT - CU.stamp) * 40);
  if (TT >= CU.stamp - 0.25) { ctx.save(); ctx.globalAlpha = TT < CU.stamp ? 0.5 + 0.5 * EZ.i2(sl) : 1; stamp(730, 930, s * 1.2, ['VALPARAÍSO', 'CHILE'], 'hace 8 días', 0.18); ctx.restore(); }
  ctx.restore();
  DEFER.push(() => clayCard([{ t: 'Solo ve tu ciudad' }, { t: 'y tu país', hi: true }], CX, 330, 66, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  lightSea(0);
  floatBottle(400, 1420, 380);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
