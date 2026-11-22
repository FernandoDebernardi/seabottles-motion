// =====================================================================
//  ESCENAS DE PRUEBA — piezas de arcilla de Recraft (assets/*.png) animadas en código
// =====================================================================
const CU = TIMELINE.cues;
const INK = '#24312A', PAPER = '#FBF6E8';
// un sprite centrado en (x, y), de ancho w, con rotación y escala opcionales
function sprite(name, x, y, w, o = {}) {
  const img = asset(name); if (!img) return;
  const h = w * img.naturalHeight / img.naturalWidth;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(o.sx ?? 1, o.sy ?? 1);
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(40,30,20,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12; }
  if (o.src) ctx.drawImage(img, o.src[0], o.src[1], o.src[2], o.src[3], -w / 2, -h / 2 * (o.src[3] / img.naturalHeight) * (img.naturalWidth / o.src[2]) , w, w * o.src[3] / o.src[2]);
  else ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}
// tarjeta de arcilla: crema redondeada con sombra suave; la línea destacada en caja oscura
function clayCard(lines, x, y, size, o = {}) {
  const sc = o.s ?? 1; if (sc <= 0.01) return;
  ctx.save(); ctx.font = `600 ${size}px ${HAND}`;
  const lh = size * 1.3, ws = lines.map((l) => ctx.measureText(l.t).width + (l.hi ? size * 0.6 : 0));
  const w = Math.max(...ws) + size * 1.1, h = lines.length * lh + size * 0.7;
  ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(40,30,20,0.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.55); ctx.fill();
  ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(180,160,120,0.12)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.55); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => {
    const yy = -h / 2 + size * 0.35 + lh * (i + 0.5), tw = ctx.measureText(l.t).width;
    if (l.hi) { ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-tw / 2 - size * 0.3, yy - size * 0.62, tw + size * 0.6, size * 1.22, size * 0.35); ctx.fill(); }
    ctx.fillStyle = l.hi ? PAPER : INK; ctx.fillText(l.t, 0, yy + size * 0.04);
  });
  ctx.restore();
}
function fillBg(c) { ctx.fillStyle = c; ctx.fillRect(-40, -40, W + 80, H + 80); }
function stars(seed, y0, y1, n) { const R = RNG(seed); for (let i = 0; i < n; i++) sparkle(R.r(20, 1060), R.r(y0, y1), R.r(4, 10) * ((B + i) % 3 === 0 ? 1 : 0.6), '#fff3c8'); }


// ---- pautas: el sol con más rayos, pájaros en el cielo, peces que saltan con la cabeza adelante
const SUNC = [253, 533], RAY = [236, 206, 18, 87], RAY_D = 283;
function moreRays(dy = 0) {   // rayos extra copiados del rayo de arcilla, alrededor del sol del atardecer
  const img = asset('dusk.png'); if (!img) return;
  const k = DK.k, cx = SUNC[0] * k, cy = DK.y0 + SUNC[1] * k + dy, wob = Math.sin(TT * 2) * 0.02;
  for (const deg of [-162, -143, -108, -74, -40, -20]) {
    const a = deg * Math.PI / 180 + wob;
    ctx.save(); ctx.translate(cx + Math.cos(a) * RAY_D * k, cy + Math.sin(a) * RAY_D * k); ctx.rotate(a + Math.PI / 2);
    ctx.drawImage(img, RAY[0], RAY[1], RAY[2], RAY[3], -RAY[2] * k / 2, -RAY[3] * k / 2, RAY[2] * k, RAY[3] * k);
    ctx.restore();
  }
}
function clouds(dy = 0) {   // las dos nubes rosadas van con el viento, hacia la derecha
  const img = asset('dusk.png'); if (!img) return;
  ctx.drawImage(img, 0, 0, 256, DK.cloudY, -20 + TT * 9, DK.y0 + 40 + dy, 540, DK.cloudY * DK.k);
  ctx.save(); ctx.translate(980 + TT * 6, DK.y0 + 30 + dy); ctx.scale(-0.8, 0.8); ctx.drawImage(img, 0, 0, 256, DK.cloudY, 0, 0, 540, DK.cloudY * DK.k); ctx.restore();
}
function bird(x, y, s, phase) { s *= 1.6;   // pájaro de arcilla lejano: dos alas que aletean, vuela hacia la derecha
  const f = Math.sin(TT * 9 + phase);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(40,30,20,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
  ctx.strokeStyle = '#3a4a6b'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-34, -10 - 14 * f); ctx.quadraticCurveTo(-16, -22 - 10 * f, 0, 0); ctx.quadraticCurveTo(16, -22 - 10 * f, 34, -10 - 14 * f); ctx.stroke();
  ctx.restore();
}
function birds(t0, y, n = 3) { for (let i = 0; i < n; i++) { const u = (TT - t0) * 110 + i * 120; bird(-120 + u + i * 30, y + i * 46 + Math.sin(TT * 2 + i) * 8, 0.9 - i * 0.15, i * 1.7); } }
// pez de arcilla que salta en arco de x0 a x1 (cabeza adelante) y salpica al entrar y salir
function clayFish(t0, d, x0, x1, y, hgt, w) {
  const u = (TT - t0) / d;
  splashClay(x0, y, seg(TT, t0, t0 + 0.5)); splashClay(x1, y, seg(TT, t0 + d, t0 + d + 0.5));
  if (u < 0 || u > 1) return;
  const x = lerp(x0, x1, u), yy = y - hgt * 4 * u * (1 - u), dir = x1 >= x0 ? 1 : -1;
  const ang = Math.atan2(-hgt * 4 * (1 - 2 * u), Math.abs(x1 - x0));
  const img = asset('pez.png'); if (!img) return;
  const h = w * img.naturalHeight / img.naturalWidth;
  ctx.save(); ctx.translate(x, yy); ctx.scale(-dir, 1); ctx.rotate(-ang);   // la imagen mira a la izquierda: se espeja
  ctx.shadowColor = 'rgba(40,30,20,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 8;
  ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
}
function splashClay(x, y, u) {
  if (u <= 0 || u >= 1) return;
  const R = RNG('spc', x);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + R.n(1.0), sp = R.r(160, 280), t = u * 0.7, px = x + Math.cos(a) * sp * t, py = y + Math.sin(a) * sp * t + 520 * t * t, r = R.r(9, 15) * (1 - u * 0.5);
    ctx.save(); ctx.shadowColor = 'rgba(40,30,20,0.2)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; ctx.fillStyle = '#eaf6f6'; ctx.beginPath(); ctx.ellipse(px, py, r, r * 1.2, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
}

// ---- 1 · GANCHO: el atardecer de arcilla; las olas ondulan, la botella flota entre ellas, las nubes van con el viento
const DK = { k: 1080 / 512, y0: 26, cloudY: 172, waveY: 512, frontY: 683 };
function duskRows(fromY, toY, name = 'dusk.png') {   // las olas, por franjas finas que ondulan
  const img = asset(name); if (!img) return;
  for (let sy = fromY; sy < toY; sy += 3) {
    const dx = -24 + 12 * Math.sin(TT * 2.2 + sy * 0.045) + 6 * Math.sin(TT * 1.3 + sy * 0.11);
    ctx.drawImage(img, 0, sy, 512, 3.4, dx, DK.y0 + sy * DK.k, 1080 * 1.05, 3.4 * DK.k);
  }
}
function sHookWorld() {
  fillBg('#f6cdb6');
  const g = ctx.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, '#f3c0b5'); g.addColorStop(1, '#fbe1c4'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1300);
  const img = asset('dusk.png');
  if (img) {
    // sol y rayos (quietos), nubes que se mueven hacia la derecha
    moreRays();
    ctx.drawImage(img, 0, DK.cloudY, 512, DK.waveY - DK.cloudY, 0, DK.y0 + DK.cloudY * DK.k, 1080, (DK.waveY - DK.cloudY) * DK.k);
    clouds();
  }
  birds(E0 + 0.3, 600);
  duskRows(DK.waveY, 898);
  clayFish(E0 + 1.6, 0.9, 200, 420, 1620, 280, 210);
  // la botella flota: cabecea y se inclina; la ola de adelante (su borde curvo) la tapa abajo
  const by = 1430 + Math.sin(TT * 2.8) * 16, rot = -0.12 + Math.sin(TT * 2.1) * 0.08;
  if (typeof SHORT !== 'undefined' && E0 === 0 && TT < CU.hookSplash) {
    const u = TT / CU.hookSplash, x = lerp(120, 540, u), y = lerp(900, 1400, u * u);
    sprite('botella.png', x, y, 400, { rot: 2.6 + u * 3.2 });
  } else sprite('botella.png', 540 + Math.sin(TT * 0.9) * 20, by, 400, { rot });
  if (typeof SHORT !== 'undefined' && E0 === 0) splashClay(540, 1430, seg(TT, CU.hookSplash, CU.hookSplash + 0.6));
  duskRows(630, 898, 'dusk-front.png');
  }
function sHook() {
  sHookWorld();
  DEFER.push(() => clayCard([{ t: '¿Qué le dirías a alguien' }, { t: 'del otro lado del mundo?', hi: true }], CX, 400, 58, { rot: -0.015 }));
}

// ---- 2 · TESOROS: en su playa al atardecer (vista de frente), la misma botella sobre la arena;
//      sale el corcho, caen caracola, estrella y farol por el cuello, y vuelve el corcho
const SAND = '#ddc06c';
const BOT = { lip: [0.84, 0.16], cork: [0.9035, 0.113] };
function bottleLocal(cx, cy, w, rot, fx, fy) {   // un punto de la imagen de la botella (fracciones) en pantalla
  const img = asset('botella.png'), h = img ? w * img.naturalHeight / img.naturalWidth : w;
  const lx = (fx - 0.5) * w, ly = (fy - 0.5) * h, c = Math.cos(rot), sn = Math.sin(rot);
  return [cx + lx * c - ly * sn, cy + lx * sn + ly * c];
}
// su playa al atardecer, de frente (escenas 2 y 3)
function herBeach() {
  fillBg('#f6cdb6');
  const g = ctx.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, '#f3c0b5'); g.addColorStop(1, '#fbe1c4'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1300);
  const img = asset('dusk.png');
  if (img) {
    moreRays(-200);
    ctx.drawImage(img, 0, DK.cloudY, 512, DK.waveY - DK.cloudY, 0, DK.y0 + DK.cloudY * DK.k - 200, 1080, (DK.waveY - DK.cloudY) * DK.k);
    clouds();
  }
  birds(E0 + 0.5, 470);
  ctx.save(); ctx.translate(0, -200); duskRows(DK.waveY, 898); ctx.restore();
  clayFish(E0 + 2.2, 0.8, 740, 960, 1260, 220, 160);
  const am = asset('amanecer.png');
  if (am) {
    const sx = am.naturalWidth * 0.4, sy = am.naturalHeight * 0.5, sw = am.naturalWidth * 0.57, sh = am.naturalHeight * 0.27, dw = 1500, dh = dw * sh / sw;
    ctx.fillStyle = SAND; ctx.fillRect(-20, 1200 + dh * 0.6, W + 40, H);
    ctx.drawImage(am, sx, sy, sw, sh, -210, 1200, dw, dh);
  }
}
const HB = { cx: 520, cy: 1360, bw: 700, rot: -0.08, corkRest: [880, 1660, 1.3] };
function corkOnSand() { const ck = asset('corcho.png'), bt = asset('botella.png'); if (ck && bt) sprite('corcho.png', HB.corkRest[0], HB.corkRest[1], HB.bw * ck.naturalWidth / bt.naturalWidth, { rot: HB.corkRest[2] }); }

// ---- 2 · ESCRIBE: la nota se escribe en un papel, se enrolla y entra en la botella
const MANO_TIP = [0.007, 0.733];
const NOTE_TXT = ['Hoy vi el mar', 'por primera vez.'];
function sWrite() {
  herBeach();
  const done = TT >= CU.inside;
  sprite(done ? 'botella-abierta.png' : 'botella-vacia.png', HB.cx, HB.cy, HB.bw, { rot: HB.rot });
  corkOnSand();
  // el papel: se escribe y después se enrolla
  const ru = EZ.io(seg(TT, CU.roll, CU.flyIn));
  if (TT < CU.flyIn) {
    ctx.save(); ctx.translate(500, 760); ctx.rotate(-0.03 + ru * 0.5); ctx.scale(1 - ru * 0.62, 1 - ru * 0.82);
    ctx.shadowColor = 'rgba(40,30,20,0.28)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-370, -200, 740, 400, 34); ctx.fill(); ctx.shadowColor = 'transparent';
    const gg = ctx.createLinearGradient(0, -200, 0, 200); gg.addColorStop(0, 'rgba(255,255,255,0.55)'); gg.addColorStop(1, 'rgba(180,160,120,0.15)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(-370, -200, 740, 400, 34); ctx.fill();
    ctx.strokeStyle = 'rgba(76,111,181,0.22)'; ctx.lineWidth = 3; for (const y of [-40, 70]) { ctx.beginPath(); ctx.moveTo(-310, y + 14); ctx.lineTo(310, y + 14); ctx.stroke(); }
    const f1 = ev(CU.write1, 1.1), f2 = ev(CU.write2, 1.0);
    const w1 = writeOn(NOTE_TXT[0], -300, -40, 92, f1);
    const w2 = writeOn(NOTE_TXT[1], -300, 70, 92, f2);
    ctx.restore();
    // el lápiz sigue la punta de la escritura y después se va
    if (TT < CU.roll) {
      const second = TT >= CU.write2, tx = 500 - 300 + (second ? w2 * f2 : w1 * f1), ty = 760 + (second ? 70 : -40) + 4;
      // una mano (piel real, puño de manga rosa) sostiene el lápiz y escribe
      const mn = asset('mano.png'), mw = 430, mh = mn ? mw * mn.naturalHeight / mn.naturalWidth : 420;
      const away = EZ.i2(seg(TT, CU.write2 + 1.05, CU.roll));
      const jig = away > 0 ? 0 : Math.sin(TT * 20) * 4;
      sprite('mano.png', tx + mw * (0.5 - MANO_TIP[0]) + away * 500, ty + mh * (0.5 - MANO_TIP[1]) + jig + away * 300, mw);
    }
  } else if (!done) {
    // el rollo vuela hasta el cuello y entra
    const u = EZ.io(seg(TT, CU.flyIn, CU.inside));
    const lip = bottleLocal(HB.cx, HB.cy, HB.bw, HB.rot, ...BOT.lip), end = bottleLocal(HB.cx, HB.cy, HB.bw, HB.rot, 0.443, 0.493);
    const mid = [lip[0] + 60, lip[1] - 260];
    const p = u < 0.6 ? [lerp(500, mid[0], u / 0.6), lerp(760, mid[1], u / 0.6)] : [lerp(mid[0], end[0], (u - 0.6) / 0.4), lerp(mid[1], end[1], (u - 0.6) / 0.4)];
    const rl = asset('rollo.png'), bt = asset('botella.png'), rw = rl && bt ? HB.bw * rl.naturalWidth / bt.naturalWidth : 300;
    sprite('rollo.png', p[0], p[1], rw * lerp(0.75, 1, u), { rot: lerp(0.6, HB.rot, u) });
  }
  DEFER.push(() => clayCard([{ t: '1 · Escribe', hi: true }, { t: 'sin decir quién eres' }], CX, 330, 62, { rot: -0.015 }));
}

// ---- 3 · TESOROS: caen caracola, estrella y farol por el cuello; el corcho salta de la arena a su lugar
function sTreasure() {
  herBeach();
  const { cx, cy, bw, rot } = HB;
  const closed = TT >= CU.corkHome + 0.5;
  sprite(closed ? 'botella.png' : 'botella-abierta.png', cx, cy, bw, { rot });
  const lip = bottleLocal(cx, cy, bw, rot, ...BOT.lip);
  const items = [['caracola.png', 120, [0.42, 0.62]], ['estrella.png', 140, [0.30, 0.74]], ['farol.png', 104, [0.55, 0.70]]];
  items.forEach(([n, w, inside], i) => {
    const t = CU.t1 + i * (typeof SHORT !== 'undefined' ? 0.5 : 0.55);
    if (TT >= t + 0.5) { const [x, y] = bottleLocal(cx, cy, bw, rot, ...inside); ctx.save(); ctx.globalAlpha = 0.8; sprite(n, x, y, w * 0.75, { shadow: false }); ctx.restore(); }
    else if (TT >= t - 0.4) {
      const u = EZ.i2(seg(TT, t, t + 0.5)), k = Math.min(1, popS(t - 0.4));
      const x = lerp(lip[0] + (i - 1) * 170, lip[0], Math.min(1, u * 1.4)), y = lerp(640, lip[1], Math.min(1, u * 1.4));
      sprite(n, x, y, w * 1.4 * k * (1 - 0.6 * u));
    }
  });
  // el corcho: de la arena, en un salto, hasta el cuello
  if (!closed) {
    const ck = asset('corcho.png'), bt = asset('botella.png'), cw = ck && bt ? bw * ck.naturalWidth / bt.naturalWidth : 60;
    const home = bottleLocal(cx, cy, bw, rot, ...BOT.cork), u = EZ.io(seg(TT, CU.corkHome, CU.corkHome + 0.5));
    const x = lerp(HB.corkRest[0], home[0], u), y = lerp(HB.corkRest[1], home[1], u) - 300 * Math.sin(u * Math.PI);
    sprite('corcho.png', x, y, cw, { rot: lerp(HB.corkRest[2], rot, u) + u * TAU });
  }
  DEFER.push(() => clayCard([{ t: '2 · Suma hasta' }, { t: 'tres tesoros', hi: true }], CX, 360, 64, { rot: 0.015 }));
}

// ---- 3 · EL MUNDO: el globo gira, amanece detrás, la botella lo cruza con una estela de puntos
function sGlobe() {
  fillBg('#1d2a4f');
  stars('gst', 20, 1900, 70);
  const u = EZ.io(seg(TT, CU.travel, CU.arrive)), cx = 540, cy = 1230, R = 455;
  // el sol de arcilla sube por detrás, a la derecha
  const am = asset('amanecer.png');
  if (am) { const su = EZ.o2(seg(TT, E0, E0 + 2.4)); ctx.drawImage(am, 0, 0, 512, 430, 520, lerp(1150, 650, su), 520, 437); }
  sprite('globo-limpio.png', cx, cy, 800, { rot: -0.18 + 0.36 * EZ.io(seg(TT, E0, E0 + 3)) });
  // estela y botella, en un arco por encima del globo, de izquierda a derecha
  const pt = (v) => { const a = lerp(Math.PI * 1.12, Math.PI * 1.80, v); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; };
  for (let k = 0; k <= 36; k++) { const v = k / 36 * u, [x, y] = pt(v); dot(x, y, 6, 'rgba(255,255,255,0.85)'); }
  const [bx, by] = pt(u), [nx, ny] = pt(Math.min(1, u + 0.02));
  sprite('botella.png', bx, by - 20 + Math.sin(TT * 5) * 6, 230, { rot: Math.atan2(ny - by, nx - bx) - 0.35 });
  if (TT > CU.arrive) { const k = popS(CU.arrive); const [x, y] = pt(1); sparkle(x, y + 60, 40 * k, '#fff8dc'); }
  DEFER.push(() => clayCard([{ t: 'La corriente' }, { t: 'cruza el mundo', hi: true }], CX, 340, 64, { rot: -0.015 }));
}

// ---- 4 · LE LLEGA: playa al amanecer; el señor lee la nota, la botella en la arena, los tesoros caen al pie de la carta
function sFound() {
  fillBg('#fbeec2');
  const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#fde6b8'); g.addColorStop(1, '#f9d3c8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1200);
  const am = asset('amanecer.png');
  if (am) {
    const k = 1080 / am.naturalWidth; ctx.drawImage(am, 0, 9, 1080, am.naturalHeight * k);
    ctx.fillStyle = '#e2c25f'; ctx.beginPath(); ctx.moveTo(-20, 1560); ctx.quadraticCurveTo(540, 1500, 1100, 1560); ctx.lineTo(1100, 1940); ctx.lineTo(-20, 1940); ctx.fill();   // él está en la arena, no en el agua
  }
  sprite('botella-vacia.png', 250, 1610 + Math.sin(TT * 1.5) * 3, 300, { rot: 0.2 });
  { const ck = asset('corcho.png'), bt = asset('botella.png'); if (ck && bt) sprite('corcho.png', 420, 1700, 300 * ck.naturalWidth / bt.naturalWidth, { rot: 1.4 }); }
  const pop = springMove(E0, 0, 1, SPRING.playful), breathe = 1 + 0.012 * Math.sin(TT * 3);
  birds(E0 + 0.2, 720);
  sprite('abuelo.png', 690, 1420 + (1 - pop) * 300, 520, { sy: breathe });
  DEFER.push(() => {
    clayCard([{ t: '…y le llega a alguien' }, { t: 'del otro lado del mundo', hi: true }], CX, 330, 56, { rot: 0.01 });
    const ps = popS(CU.unroll);
    if (ps > 0) {
      clayCard([{ t: 'Hoy vi el mar' }, { t: 'por primera vez.' }], CX, 620, 60, { rot: -0.03, s: ps });
      // el matasellos: ciudad y fecha de origen
      ctx.save(); ctx.translate(CX + 300, 520); ctx.rotate(0.25); ctx.scale(ps, ps);
      ctx.strokeStyle = '#c4542e'; ctx.lineWidth = 5; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c4542e'; ctx.textAlign = 'center'; ctx.font = `600 18px ${HAND}`; ctx.fillText('BUENOS AIRES', 0, -4); ctx.font = `600 17px ${HAND}`; ctx.fillText('hace 9 días', 0, 20);
      ctx.restore();
    }
    // los tesoros caen al pie de la carta
    [['caracola.png', 120], ['estrella.png', 140], ['farol.png', 100]].forEach(([n, w], i) => {
      const t = CU.fall + i * 0.3; if (TT < t) return;
      const fu = EZ.o2(seg(TT, t, t + 0.35));
      sprite(n, 390 + i * 115, lerp(700, 830, fu), w * Math.min(1, popS(t)));
    });
  });
}

// escritura a mano que aparece de izquierda a derecha (letra manuscrita)
function writeOn(str, x, y, size, frac) {
  ctx.save(); ctx.font = `${size}px "Patrick Hand", cursive`; ctx.fillStyle = '#2b3f6b'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const w = ctx.measureText(str).width;
  if (frac > 0) { if (frac < 1) { ctx.beginPath(); ctx.rect(x - 4, y - size * 1.2, w * frac + 4, size * 1.7); ctx.clip(); } ctx.fillText(str, x, y); }
  ctx.restore(); return w;
}

// ======================= ESCENAS DEL VIDEO COMPLETO =======================
// ---- 4 · LÁNZALA (12-15): su mano entra por abajo, la lanza girando, cae al mar, salpica y sale a flote
function sThrow() {
  herBeach();
  const sx = 760, sy = 1130, rel = CU.release, splash = CU.splash;
  const flying = TT >= rel && TT < splash, u = seg(TT, rel, splash);
  if (TT >= splash) { const f = Math.min(1, popS(CU.float)); if (f > 0) sprite('botella.png', sx + Math.sin(TT * 1.1) * 10, sy + Math.sin(TT * 2.8) * 12, 300 * f, { rot: -0.15 + Math.sin(TT * 2.1) * 0.08 }); }
  splashClay(sx, sy + 40, seg(TT, splash, splash + 0.6));
  if (flying) {
    const x = lerp(260, sx, u), y = lerp(1500, sy, u) - 900 * 4 * u * (1 - u) * 0.9;
    for (let i = 1; i < 6; i++) { const v = Math.max(0, u - i * 0.05); dot(lerp(260, sx, v), lerp(1500, sy, v) - 810 * 4 * v * (1 - v), 8 - i, 'rgba(255,255,255,0.8)'); }
    sprite('botella.png', x, y, lerp(420, 300, u), { rot: u * 7.5 });
  }
  // la mano: entra, sostiene la botella, la suelta y queda abierta
  const hin = EZ.o2(seg(TT, CU.handIn, CU.handIn + 0.3)), swing = EZ.io(seg(TT, CU.handIn + 0.2, rel)), out = EZ.i2(seg(TT, rel + 0.6, rel + 1.0));
  const hx = lerp(-120, 220, hin) + swing * 60 - out * 300, hy = lerp(2050, 1600, hin) - swing * 120 + out * 300;
  if (TT < rel) sprite('botella.png', hx + 90, hy - 170, 420, { rot: -0.6 + swing * 0.4 });
  if (TT < rel + 1.0) sprite('mano-lanza.png', hx, hy, 460, { rot: -0.5 + swing * 0.6 });
  DEFER.push(() => clayCard([{ t: '3 · Lánzala', hi: true }, { t: 'al mar' }], CX, 330, 64, { rot: -0.015 }));
}

// ---- 5 · LA CORRIENTE (15-19): de atardecer a noche; el sol se hunde, salen la luna y las estrellas
function sSea() {
  const nk = EZ.io(seg(TT, CU.sunset + 0.4, CU.night + 0.4));   // 0 = atardecer, 1 = noche
  fillBg(mixHex('#f3c0b5', '#1d2a4f', nk));
  const g = ctx.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, mixHex('#f3c0b5', '#141c40', nk)); g.addColorStop(1, mixHex('#fbe1c4', '#2c3f78', nk)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1300);
  if (nk > 0.3) stars('sestars', 40, 1000, Math.round(60 * (nk - 0.3) / 0.7));
  const mp = popS(CU.night); if (mp > 0) { ctx.save(); ctx.shadowColor = 'rgba(255,240,200,0.5)'; ctx.shadowBlur = 40; ctx.fillStyle = '#f6ecc8'; ctx.beginPath(); ctx.arc(820, lerp(900, 640, EZ.o2(seg(TT, CU.night, CU.night + 1.5))), 70 * Math.min(1, mp), 0, TAU); ctx.fill(); ctx.restore(); }
  const img = asset('dusk.png'), sink = EZ.i2(seg(TT, CU.sunset, CU.night)) * 1150;
  if (img) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1500); ctx.clip(); ctx.translate(0, sink); moreRays();
    ctx.drawImage(img, 0, DK.cloudY, 512, 640 - DK.cloudY, 0, DK.y0 + DK.cloudY * DK.k, 1080, (640 - DK.cloudY) * DK.k); ctx.restore();
    if (nk < 0.8) clouds();
  }
  if (nk < 0.5) birds(E0 + 0.1, 600);
  duskRows(DK.waveY, 898, 'dusk-waves.png');
  if (nk < 0.4) clayFish(E0 + 0.6, 0.85, 760, 560, 1620, 260, 190);
  const bx = lerp(260, 760, EZ.io(seg(TT, E0, E0 + 4)));
  sprite('botella.png', bx + Math.sin(TT * 0.9) * 10, 1430 + Math.sin(TT * 2.8) * 16, 400, { rot: -0.12 + Math.sin(TT * 2.1) * 0.08 });
  duskRows(630, 898, 'dusk-front.png');
  if (nk > 0) { ctx.fillStyle = `rgba(20,28,64,${0.42 * nk})`; ctx.fillRect(0, 0, W, H); }
  if (typeof SHORT !== 'undefined') { DEFER.push(() => clayCard([{ t: 'Pasan días' }, { t: 'y noches…', hi: true }], CX, 340, 64, { rot: -0.015 })); return; }
  DEFER.push(() => nk < 0.5
    ? clayCard([{ t: 'La corriente', hi: true }, { t: 'se la lleva…' }], CX, 340, 64, { rot: 0.015 })
    : clayCard([{ t: 'Pasan días' }, { t: 'y noches…', hi: true }], CX, 340, 64, { rot: -0.015 }));
}

// ---- 8 · LA CADENA (27-30): él escribe la suya y la lanza: el mar va de mano en mano
function sChain() {
  fillBg('#fbeec2');
  const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#fde6b8'); g.addColorStop(1, '#f9d3c8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1200);
  const am = asset('amanecer.png');
  if (am) {
    const k = 1080 / am.naturalWidth; ctx.drawImage(am, 0, 9, 1080, am.naturalHeight * k);
    ctx.fillStyle = '#e2c25f'; ctx.beginPath(); ctx.moveTo(-20, 1560); ctx.quadraticCurveTo(540, 1500, 1100, 1560); ctx.lineTo(1100, 1940); ctx.lineTo(-20, 1940); ctx.fill();
  }
  sprite('botella-vacia.png', 250, 1610, 300, { rot: 0.2 });
  birds(E0 + 0.3, 720);
  sprite('abuelo.png', 690, 1420, 520, { sy: 1 + 0.012 * Math.sin(TT * 3) });
  // su botella nueva sale de sus manos hacia el mar, girando
  const u = seg(TT, CU.toss, CU.toss2);
  if (TT < CU.toss) sprite('botella.png', 700, 1290 - popS(E0 + 0.2) * 20, 210 * Math.min(1, popS(E0 + 0.2)), { rot: -0.3 });
  else if (TT < CU.toss2) { const x = lerp(700, 1000, u), y = lerp(1290, 1180, u) - 520 * 4 * u * (1 - u); sprite('botella.png', x, y, lerp(210, 120, u), { rot: -0.3 + u * 6.5 }); }
  splashClay(1000, 1200, seg(TT, CU.toss2, CU.toss2 + 0.6));
  DEFER.push(() => clayCard([{ t: 'Y él también' }, { t: 'lanza la suya', hi: true }], CX, 340, 64, { rot: 0.015 }));
}

// ---- 9 · CIERRE (30-34): el atardecer del gancho; la invitación y la dirección
function sClose() {
  sHookWorld();
  DEFER.push(() => {
    clayCard([{ t: 'Súmate y lanza' }, { t: 'tu primera botella' }], CX, 400, 66, { rot: -0.02, s: popS(CU.cta) });
    clayCard([{ t: 'seabottles.org', hi: true }], CX, 640, 70, { rot: 0.02, s: popS(CU.url) });
  });
}
