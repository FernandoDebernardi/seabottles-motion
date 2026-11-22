// =====================================================================
//  COMÚN — ayudas compartidas por los videos de arcilla de esta semana
// =====================================================================
// olas de arcilla dibujadas en código: franjas onduladas con sombra hacia atrás y brillo en el borde
function clayWaves(yTop, gap, cols, o = {}) {
  const amp = o.amp ?? 22, k = o.k ?? 0.011, sp = o.sp ?? 1.6, dir = o.dir ?? 1;
  cols.forEach((c, i) => {
    const y0 = yTop + i * gap, ph = i * 1.7 + TT * sp * dir * (i % 2 ? 1 : 0.8);
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,40,0.28)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = -8;
    const g = ctx.createLinearGradient(0, y0 - amp, 0, y0 + gap * 1.4);
    g.addColorStop(0, mixHex(c, '#ffffff', 0.18)); g.addColorStop(0.35, c); g.addColorStop(1, mixHex(c, '#1d2a4f', 0.12));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-60, H + 60);
    for (let x = -60; x <= W + 60; x += 12) ctx.lineTo(x, y0 + amp * Math.sin(x * k + ph) + amp * 0.35 * Math.sin(x * k * 2.3 - ph * 0.7));
    ctx.lineTo(W + 60, H + 60); ctx.closePath(); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
    for (let x = -60; x <= W + 60; x += 12) { const y = y0 + 5 + amp * Math.sin(x * k + ph) + amp * 0.35 * Math.sin(x * k * 2.3 - ph * 0.7); x === -60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  });
}
// un monte de arena (o nieve) de arcilla, de frente
function clayMound(y, col, o = {}) {
  const amp = o.amp ?? 40, x0 = o.x0 ?? -60, x1 = o.x1 ?? W + 60;
  ctx.save(); ctx.shadowColor = 'rgba(40,30,20,0.3)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = -6;
  const g = ctx.createLinearGradient(0, y - amp, 0, y + 300); g.addColorStop(0, mixHex(col, '#ffffff', 0.22)); g.addColorStop(0.3, col); g.addColorStop(1, mixHex(col, '#5a4020', 0.12));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, H + 60);
  for (let x = x0; x <= x1; x += 10) { const u = (x - x0) / (x1 - x0); const gg = o.cx != null ? Math.exp(-(((x - o.cx) / (o.wid ?? 380)) ** 2)) : 0; ctx.lineTo(x, o.cx != null ? y - amp * gg + (1 - gg) * (o.drop ?? 0) : y - amp * Math.sin(u * Math.PI) + 8 * Math.sin(x * 0.02)); }
  ctx.lineTo(x1, H + 60); ctx.closePath(); ctx.fill(); ctx.restore();
}
function skyGrad(a, b, y1 = 1300) { fillBg(b); const g = ctx.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, y1 + 20); }
// sol de arcilla con rayos
function claySun(x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y);
  const n = o.rays ?? 12, rot = TT * 0.25;
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU; ctx.save(); ctx.rotate(a); ctx.shadowColor = 'rgba(120,80,20,0.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
    ctx.fillStyle = o.ray ?? '#e8b23a'; ctx.beginPath(); ctx.roundRect(r * 1.18, -r * 0.09, r * 0.5, r * 0.18, r * 0.09); ctx.fill(); ctx.restore();
  }
  ctx.shadowColor = 'rgba(120,80,20,0.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, o.hi ?? '#ffe08a'); g.addColorStop(1, o.col ?? '#f0bf3c');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore();
}
// nube de arcilla en código (va siempre hacia la derecha)
function clayCloud(x, y, s, col = '#fbf4ea') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.shadowColor = 'rgba(60,50,40,0.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  const g = ctx.createLinearGradient(0, -70, 0, 40); g.addColorStop(0, '#ffffff'); g.addColorStop(1, col); ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(-60, 0, 42, 0, TAU); ctx.arc(0, -28, 58, 0, TAU); ctx.arc(62, -4, 44, 0, TAU); ctx.roundRect(-100, -10, 200, 50, 25); ctx.fill(); ctx.restore();
}
function clouds2(y, n = 2, spd = 14) { for (let i = 0; i < n; i++) clayCloud(mod(140 + i * 560 + TT * spd, W + 400) - 200, y + i * 90, 0.9 - i * 0.15); }
// sprite que aparece con un rebote desde abajo (personas)
function personPop(name, x, yFeet, w, t0, o = {}) {
  const img = asset(name); if (!img) return;
  const h = w * img.naturalHeight / img.naturalWidth, pop = springMove(t0, 0, 1, SPRING.playful), breathe = 1 + 0.012 * Math.sin(TT * 3);
  sprite(name, x, yFeet - h / 2 + (1 - pop) * 260, w, { sy: breathe, sx: o.flip ? -1 : 1 });
}
// el papel en el que se escribe (con la mano verde y el lápiz), se enrolla y vuela a un punto
const MANO2_TIP = [0.02, 0.985];
function notePaper(lines, cx, cy, t1, t2, tRoll, tFly, tEnd, dest, o = {}) {
  if (TT >= tEnd) return;
  const ru = EZ.io(seg(TT, tRoll, tFly));
  if (TT < tFly) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.03 + ru * 0.5); ctx.scale(1 - ru * 0.62, 1 - ru * 0.82);
    ctx.shadowColor = 'rgba(40,30,20,0.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-380, -200, 760, 400, 34); ctx.fill(); ctx.shadowColor = 'transparent';
    const gg = ctx.createLinearGradient(0, -200, 0, 200); gg.addColorStop(0, 'rgba(255,255,255,0.55)'); gg.addColorStop(1, 'rgba(180,160,120,0.15)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(-380, -200, 760, 400, 34); ctx.fill();
    ctx.strokeStyle = 'rgba(76,111,181,0.22)'; ctx.lineWidth = 3; for (const y of [-40, 70]) { ctx.beginPath(); ctx.moveTo(-320, y + 14); ctx.lineTo(320, y + 14); ctx.stroke(); }
    const f1 = ev(t1, 1.1), f2 = ev(t2, 1.0), sz = o.size ?? 84;
    const w1 = writeOn(lines[0], -320, -40, sz, f1), w2 = writeOn(lines[1], -320, 70, sz, f2);
    if (o.after) o.after(w1, w2);
    ctx.restore();
    if (TT < tRoll) {
      const second = TT >= t2, tx = cx - 320 + (second ? w2 * f2 : w1 * f1), ty = cy + (second ? 70 : -40) + 4;
      const mn = asset('mano-verde.png'), mw = 380, mh = mn ? mw * mn.naturalHeight / mn.naturalWidth : 400;
      const away = EZ.i2(seg(TT, t2 + 1.05, tRoll)), jig = away > 0 ? 0 : Math.sin(TT * 20) * 4;
      sprite('mano-verde.png', tx + mw * (0.5 - MANO2_TIP[0]) + away * 500, ty + mh * (0.5 - MANO2_TIP[1]) + jig - away * 200, mw);
    }
  } else {
    const u = EZ.io(seg(TT, tFly, tEnd)), mid = [lerp(cx, dest[0], 0.5) + 80, Math.min(cy, dest[1]) - 220];
    const p = u < 0.6 ? [lerp(cx, mid[0], u / 0.6), lerp(cy, mid[1], u / 0.6)] : [lerp(mid[0], dest[0], (u - 0.6) / 0.4), lerp(mid[1], dest[1], (u - 0.6) / 0.4)];
    sprite('rollo.png', p[0], p[1], 260 * lerp(0.8, 0.6, u), { rot: lerp(0.6, -0.1, u) });
  }
}
// la botella lanzada en arco (de a hacia b), con estela, y la salpicadura al caer
function bottleArc(t0, t1, a, b, hgt, w0, w1) {
  splashClay(b[0], b[1] + 30, seg(TT, t1, t1 + 0.6));
  if (TT < t0 || TT >= t1) return;
  const u = seg(TT, t0, t1);
  for (let i = 1; i < 6; i++) { const v = Math.max(0, u - i * 0.05); dot(lerp(a[0], b[0], v), lerp(a[1], b[1], v) - hgt * 4 * v * (1 - v), 8 - i, 'rgba(255,255,255,0.8)'); }
  sprite('botella.png', lerp(a[0], b[0], u), lerp(a[1], b[1], u) - hgt * 4 * u * (1 - u), lerp(w0, w1, u), { rot: u * 7.5 });
}
function floatBottle(x, y, w, o = {}) { sprite(o.name ?? 'botella.png', x + Math.sin(TT * 0.9 + (o.ph ?? 0)) * 10, y + Math.sin(TT * 2.8 + (o.ph ?? 0)) * 14, w, { rot: (o.rot ?? -0.12) + Math.sin(TT * 2.1 + (o.ph ?? 0)) * 0.08 }); }
// matasellos: ciudad y fecha (nunca el nombre)
function stamp(x, y, s, l1, l2, rot = 0.22) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#c4542e'; ctx.lineWidth = 7; ctx.setLineDash([12, 7]); ctx.beginPath(); ctx.arc(0, 0, 112, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#c4542e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const ls = Array.isArray(l1) ? l1 : [l1]; ctx.font = `600 25px ${HAND}`; ls.forEach((l, i) => ctx.fillText(l, 0, -30 + i * 34 - (ls.length - 1) * 6)); ctx.font = `600 24px ${HAND}`; ctx.fillText(l2, 0, 44);
  ctx.restore();
}
// cierre: «Súmate y lanza tu primera botella» + seabottles.org
function closeCards(tCta, tUrl) {
  clayCard([{ t: 'Súmate y lanza' }, { t: 'tu primera botella' }], CX, 420, 66, { rot: -0.02, s: popS(tCta) });
  clayCard([{ t: 'seabottles.org', hi: true }], CX, 660, 72, { rot: 0.02, s: popS(tUrl) });
}
function mixH(a, b, u) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join(''); }
