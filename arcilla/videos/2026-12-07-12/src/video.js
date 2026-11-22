// =====================================================================
//  GUION 12 · «Algunos mensajes no duran para siempre»
//  Tres botellas se alejan a distinta velocidad y al final se hunden suavemente.
// =====================================================================
function underwater() {
  fillBg('#2f7f99'); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fd0d4'); g.addColorStop(0.45, '#4f9bb0'); g.addColorStop(1, '#245f7a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) { const x = 120 + i * 220 + Math.sin(TT * 0.8 + i) * 30; ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 140, 1500); ctx.lineTo(x + 40, 1500); ctx.closePath(); ctx.fill(); } ctx.restore();
  clayMound(1700, '#d9bf7e', { amp: 40 });
}
// ---- 1 · GANCHO (0-3.5): la botella navega y empieza a hundirse
function s_hook() {
  seaT({ sx: 820 });
  const sink = EZ.io(seg(TT, 1.4, 3.5));
  floatBottle(lerp(380, 640, TT / 3.5), 1300 + sink * 180, 380, { rot: -0.12 - sink * 0.5 });
  if (TT > 1.4) bubbles(lerp(380, 640, TT / 3.5) + 60, 1300 + sink * 180, 1.4, 5);
  seaFront();
  DEFER.push(() => clayCard([{ t: 'Algunos mensajes' }, { t: 'no duran para siempre', hi: true }], CX, 400, 62, { rot: -0.015 }));
}
// ---- 2 · UNOS DÍAS (3.5-7): pasan días y noches, como un time-lapse
function s_days() {
  const u = (TT - E0) / 3.5, ph = (u * 2.5) % 1, night = Math.max(0, Math.sin(ph * TAU - Math.PI / 2) * 0.5 + 0.5);
  skyGrad(mixH('#bfe3ee', '#1d2a4f', night), mixH('#fdeccb', '#3b4a7a', night), 1250);
  if (night > 0.5) { ctx.save(); ctx.globalAlpha = (night - 0.5) * 2; stars('d', 80, 1000, 30); ctx.restore(); }
  const a = ph * TAU; claySun(540 + Math.cos(a - Math.PI / 2) * 420, 1150 + Math.sin(a - Math.PI / 2) * 520, 80);
  moon(540 + Math.cos(a + Math.PI / 2) * 420, 1150 + Math.sin(a + Math.PI / 2) * 520, 60);
  clayWaves(1160, 110, ['#4f9bb0', '#6fb4bd'], { amp: 16, sp: 1.2 });
  floatBottle(lerp(240, 840, u), 1320, 340);
  seaFront();
  DEFER.push(() => clayCard([{ t: 'Cada botella navega' }, { t: 'unos días', hi: true }], CX, 380, 64, { rot: 0.015 }));
}
// ---- 3 · CADA UNA A SU RITMO (7-10.5): tres botellas, tres velocidades
function s_three() {
  seaT({ sx: 820 });
  const u = TT - E0;
  floatBottle(330 + u * 200, 1200, 200, { ph: 0 });
  floatBottle(200 + u * 120, 1290, 270, { ph: 1.3 });
  floatBottle(560 + u * 50, 1370, 340, { ph: 2.4 });
  seaFront();
  DEFER.push(() => clayCard([{ t: 'Cada una' }, { t: 'a su ritmo', hi: true }], CX, 380, 68, { rot: -0.015 }));
}
// ---- 4 · SE HUNDE (10.5-14): bajo el agua, la botella baja despacio entre peces y una tortuga
function s_sink() {
  underwater();
  sprite('alga.png', 230, 1560, 300, { shadow: false });
  swimR('tortuga.png', E0 - 0.5, 4.5, -300, 1300, 820, 420, 0.5);
  swimR('pez-rayas.png', E0, 4, -150, 1200, 1250, 170, 1.7);
  const v = EZ.o2(seg(TT, E0, E0 + 3.4)), y = lerp(250, 1520, v);
  sprite('botella.png', 680 + Math.sin(TT * 1.6) * 30, y, 300, { rot: lerp(-0.4, 0.9, v) + Math.sin(TT * 1.8) * 0.12 });
  bubbles(700, y - 60, E0, 6);
  DEFER.push(() => clayCard([{ t: 'Después se hunde' }, { t: 'suavemente', hi: true }], CX, 360, 66, { rot: 0.015 }));
}
// ---- 5 · EN EL FONDO (14-17): queda en calma junto al alga
function s_rest() {
  underwater();
  sprite('alga.png', 230, 1560, 300, { shadow: false });
  sprite('botella.png', 690, 1600, 300, { rot: 0.9 + Math.sin(TT * 1.2) * 0.02 });
  swimR('pez-rayas.png', E0 - 1, 4.5, -150, 1200, 1150, 160, 0.3);
  bubbles(760, 1520, E0, 4);
  DEFER.push(() => clayCard([{ t: 'Por eso, escribe' }, { t: 'lo que sientes hoy', hi: true }], CX, 360, 64, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  seaT({ sx: 820 });
  floatBottle(520, 1320, 420);
  seaFront();
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
