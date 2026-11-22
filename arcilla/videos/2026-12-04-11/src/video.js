// =====================================================================
//  GUION 11 · «Elige cómo se ve tu botella»
//  Cambian el papel, la tinta, la etiqueta, el cordel y el sello; decorar no da más alcance.
// =====================================================================
const B11 = { x: 520, y: 1480, w: 600, rot: -0.1 };
const CORD = ['#e0703a', '#3f7fb5', '#d24a6a', '#4d9a5b', '#8a5bb5', '#e2b13a'];
const PAPS = [['#fbf6e8', '#24312a'], ['#fde0e0', '#7a2f3a'], ['#dcefff', '#23407a'], ['#e3f5dc', '#2d5a2f'], ['#fff1c9', '#6a3e12']];
function cord(x, y, w, rot, col) {   // cordel atado al cuello de la botella, con moño
  const [px, py] = bottleLocal(x, y, w, rot, 0.78, 0.22);
  ctx.save(); ctx.translate(px, py); ctx.rotate(rot + 0.75); ctx.shadowColor = 'rgba(40,30,20,0.3)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
  ctx.strokeStyle = col; ctx.lineWidth = w * 0.03; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.08, w * 0.025, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-w * 0.05, -w * 0.05, w * 0.04, w * 0.025, -0.6, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(w * 0.05, -w * 0.05, w * 0.04, w * 0.025, 0.6, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -w * 0.02); ctx.quadraticCurveTo(-w * 0.03, w * 0.06, -w * 0.06, w * 0.11); ctx.moveTo(0, -w * 0.02); ctx.quadraticCurveTo(w * 0.03, w * 0.07, w * 0.05, w * 0.12); ctx.stroke();
  ctx.restore();
}
function decorated(x, y, w, rot, k, o = {}) {   // la botella con su decoración (k = combinación)
  sprite('botella.png', x, y, w, { rot });
  const [sx, sy] = bottleLocal(x, y, w, rot, 0.4, 0.62), [fx, fy] = bottleLocal(x, y, w, rot, 0.58, 0.5), [lx, ly] = bottleLocal(x, y, w, rot, 0.86, 0.13);
  const s1 = o.s1 ?? 1, s2 = o.s2 ?? 1, s3 = o.s3 ?? 1;
  if (s1 > 0.01) sprite(k % 2 ? 'st-pez.png' : 'st-estrella.png', sx, sy, w * 0.2 * s1, { rot: rot - 0.2, shadow: false });
  if (s2 > 0.01) sprite(k % 2 ? 'st-estrella.png' : 'st-pez.png', fx, fy, w * 0.15 * s2, { rot: rot + 0.3, shadow: false });
  cord(x, y, w, rot, CORD[k % CORD.length]);
  if (s3 > 0.01) sprite('sello.png', lx, ly + w * 0.04, w * 0.17 * s3, { rot: 0.3 });
}
// ---- 1 · GANCHO (0-3.5): la botella cambia de decoración al ritmo
function s_hook() {
  beachT();
  const k = Math.floor(TT * 2), pulse = 1 + 0.05 * Math.max(0, 1 - (TT * 2 - k) * 3);
  decorated(B11.x, B11.y, B11.w * pulse, B11.rot + Math.sin(TT * 3) * 0.04, k);
  sparkle(780, 1240, 26 * Math.max(0, 1 - (TT * 2 - k) * 2), '#f0b44a');
  DEFER.push(() => clayCard([{ t: 'Elige cómo se ve' }, { t: 'tu botella', hi: true }], CX, 400, 70, { rot: -0.015 }));
}
// ---- 2 · PAPEL Y TINTA (3.5-7): el papel y la tinta cambian de color
function s_paper() {
  beachT({ sx: 240 });
  personPop('chica.png', 820, 1800, 270, E0);
  const k = Math.floor((TT - E0) * 1.6) % PAPS.length, [pc, ic] = PAPS[k], s = popS(E0 + 0.1), wob = Math.sin(TT * 2) * 0.02;
  ctx.save(); ctx.translate(430, 960); ctx.rotate(-0.04 + wob); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(40,30,20,0.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = pc; ctx.beginPath(); ctx.roundRect(-330, -170, 660, 340, 34); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(76,111,181,0.2)'; ctx.lineWidth = 3; for (const y of [-20, 90]) { ctx.beginPath(); ctx.moveTo(-270, y); ctx.lineTo(270, y); ctx.stroke(); }
  ctx.fillStyle = ic; ctx.font = `68px "Patrick Hand", ${HAND}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Hola, desde', -270, -30); ctx.fillText('el otro lado.', -270, 80);
  ctx.restore();
  sprite('paleta.png', 300, 1640, 380, { rot: -0.05 });
  DEFER.push(() => clayCard([{ t: 'Papel y tinta' }, { t: 'a tu gusto', hi: true }], CX, 380, 66, { rot: 0.015 }));
}
// ---- 3 · ETIQUETA, CORDEL Y SELLO (7-10.5): aparecen uno por uno sobre la botella
function s_deco() {
  fillBg('#fbeede'); const g = ctx.createRadialGradient(540, 1150, 100, 540, 1150, 1100); g.addColorStop(0, '#fff6e6'); g.addColorStop(1, '#f2d9bc'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const k = Math.floor(Math.max(0, TT - E0 - 1.9) * 2.5);
  decorated(540, 1250, 720, -0.12 + Math.sin(TT * 2) * 0.03, k, { s1: popS(E0 + 0.2), s2: popS(E0 + 0.8), s3: popS(E0 + 1.5) });
  [[E0 + 0.2, 370, 1180], [E0 + 0.8, 560, 1100], [E0 + 1.5, 850, 930]].forEach(([t, x, y]) => sparkle(x, y, 30 * Math.max(0, 1 - (TT - t) * 2.5) * (TT > t ? 1 : 0), '#f0b44a'));
  DEFER.push(() => clayCard([{ t: 'Etiqueta, cordel' }, { t: 'y sello', hi: true }], CX, 380, 68, { rot: -0.015 }));
}
// ---- 4 · TODAS IGUAL (10.5-14): decorada o sencilla, navegan a la misma velocidad
function s_same() {
  seaT();
  const x = lerp(760, 1000, (TT - E0) / 3.5);
  for (let i = 0; i < 3; i++) { const xx = x - i * 330, y = 1290 + Math.sin(TT * 2.8 + i) * 14, rot = -0.12 + Math.sin(TT * 2.1 + i) * 0.08;
    if (i === 1) decorated(xx, y, 300, rot, 2); else sprite('botella.png', xx, y, 300, { rot }); }
  seaFront();
  DEFER.push(() => clayCard([{ t: 'Decorar no da' }, { t: 'más alcance', hi: true }], CX, 380, 68, { rot: 0.015 }));
}
// ---- 5 · HAZLA TUYA (14-17): ella la lanza al mar
function s_throw() {
  beachT({ sx: 240 });
  personPop('chica.png', 760, 1800, 270, E0 - 0.3);
  bottleArc(E0 + 0.6, E0 + 1.8, [700, 1500], [300, 1150], 380, 160, 220);
  if (TT < E0 + 0.6) decorated(700, 1520, 170, -0.3, 4);
  if (TT >= E0 + 1.8) floatBottle(300, 1150, 220);
  DEFER.push(() => clayCard([{ t: 'Es solo para ti:' }, { t: 'hazla tuya', hi: true }], CX, 380, 66, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  beachT();
  decorated(520, 1540, 460, -0.08 + Math.sin(TT * 2) * 0.03, 3);
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
