// =====================================================================
//  GUION 15 · «¿No sabes qué escribir?»
//  Un faro se enciende y proyecta una frase para empezar.
// =====================================================================
const FRASE = ['Hoy aprendí que…'];
function duskSea(o = {}) {
  skyGrad('#2b3566', '#e9a48a', 1250); stars('f', 60, 700, 26);
  clayWaves(1180, 110, ['#3c6f8f', '#4f88a0'], { amp: 14, sp: 1.1 });
}
function lighthouse(x, yBase, w, on) {   // el faro sobre sus rocas, con el haz que gira
  const img = asset('faro.png'); if (!img) return; const h = w * img.naturalHeight / img.naturalWidth, lampY = yBase - h * 0.83;
  if (on > 0) { const a = Math.PI + 0.35 * Math.sin(TT * 1.4); ctx.save(); ctx.globalAlpha = 0.45 * on; const g = ctx.createRadialGradient(x, lampY, 10, x, lampY, 900); g.addColorStop(0, '#fff6c8'); g.addColorStop(1, 'rgba(255,246,200,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x, lampY); ctx.lineTo(x + Math.cos(a - 0.16) * 1100, lampY + Math.sin(a - 0.16) * 1100); ctx.lineTo(x + Math.cos(a + 0.16) * 1100, lampY + Math.sin(a + 0.16) * 1100); ctx.closePath(); ctx.fill(); ctx.restore(); }
  sprite('faro.png', x, yBase - h / 2, w);
  if (on > 0) { ctx.save(); ctx.globalAlpha = on; ctx.shadowColor = '#fff3b0'; ctx.shadowBlur = 50; ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(x, lampY, w * 0.09, 0, TAU); ctx.fill(); ctx.restore(); }
}
// ---- 1 · GANCHO (0-3.5): él mira la hoja en blanco y se rasca la cabeza
function s_hook() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(820, 960, 90); clouds2(640, 2, 14);
  clayWaves(1080, 100, ['#5f9fb0', '#7ab8be', '#98ccc8'], { amp: 16, sp: 1.2 }); clayMound(1420, SANDT, { amp: 50 });
  personPop('chico-piensa.png', 560, 1840, 330, -1);
  for (let i = 0; i < 3; i++) { const t = (TT + i * 0.6) % 1.8; dot(430 + i * 130, 1080 - t * 90, 14 * Math.max(0, 1 - t / 1.8), '#ffffff'); }
  DEFER.push(() => clayCard([{ t: '¿No sabes' }, { t: 'qué escribir?', hi: true }], CX, 400, 72, { rot: -0.015 }));
}
// ---- 2 · EL FARO (3.5-7): cae la tarde y se enciende el faro
function s_light() {
  duskSea();
  lighthouse(800, 1330, 300, EZ.o2(seg(TT, E0 + 0.6, E0 + 1.6)));
  seaFront();
  DEFER.push(() => clayCard([{ t: 'Cada día, la app' }, { t: 'te sugiere una frase', hi: true }], CX, 380, 62, { rot: 0.015 }));
}
// ---- 3 · LA FRASE (7-10.5): el haz proyecta una frase para empezar
function s_phrase() {
  duskSea();
  lighthouse(800, 1330, 300, 1);
  seaFront();
  DEFER.push(() => {
    clayCard([{ t: 'para empezar' }], CX, 360, 64, { rot: -0.015 });
    clayCard([{ t: FRASE[0] }], CX, 700, 76, { rot: 0.02, s: popS(E0 + 0.4) });
    sparkle(820, 620, 30 * Math.max(0, 1 - (TT - E0 - 0.4) * 2), '#fff3b0');
  });
}
// ---- 4 · LA LANZA (10.5-14): con la frase completa, la botella sale al mar
function s_throw() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(240, 960, 90); clouds2(640, 2, 14);
  clayWaves(1080, 100, ['#5f9fb0', '#7ab8be', '#98ccc8'], { amp: 16, sp: 1.2 }); clayMound(1420, SANDT, { amp: 50 });
  personPop('chico-piensa.png', 760, 1840, 300, E0 - 1);
  if (TT < E0 + 0.8) sprite('botella.png', 600, 1600, 200, { rot: 0.2 });
  bottleArc(E0 + 0.8, E0 + 2.0, [600, 1600], [300, 1150], 320, 200, 220);
  if (TT >= E0 + 2.0) floatBottle(300, 1150, 220);
  DEFER.push(() => clayCard([{ t: 'La completas' }, { t: 'a tu manera', hi: true }], CX, 380, 66, { rot: 0.015 }));
}
// ---- 5 · NAVEGA (14-17): la botella pasa bajo la luz del faro
function s_sail() {
  duskSea();
  lighthouse(860, 1330, 260, 1);
  floatBottle(lerp(160, 620, EZ.io(seg(TT, E0, E0 + 3))), 1330, 320);
  seaFront();
  DEFER.push(() => clayCard([{ t: 'y sale a navegar' }, { t: 'sin tu nombre', hi: true }], CX, 380, 66, { rot: -0.015 }));
}
// ---- 6 · CIERRE (17-20)
function s_close() {
  skyGrad('#bfe3ee', '#fdeccb', 1250); claySun(820, 960, 90); clouds2(640, 2, 14);
  clayWaves(1080, 100, ['#5f9fb0', '#7ab8be', '#98ccc8'], { amp: 16, sp: 1.2 }); clayMound(1420, SANDT, { amp: 50 });
  sprite('botella.png', 520, 1560, 460, { rot: -0.08 });
  DEFER.push(() => closeCards(CU.cta, CU.url));
}
