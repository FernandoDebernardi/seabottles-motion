  const T = TIMELINE, cu = T.cues;
  to = 's';
  noiseHit(0.5, 0.1, 'bandpass', 800, 3, 0.2, 0.3);
  for (let i = 0; i < 6; i++) noiseHit(cu.write1 + i * 0.18, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  for (let i = 0; i < 5; i++) noiseHit(cu.write2 + i * 0.18, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  sweep(cu.fly, cu.inside, 0.012, 600, 2400, 0.1);
  for (const t of [cu.winter, 10.0, cu.summer]) noiseHit(t, 0.4, 'bandpass', 2800, 6, 0.05, 0, 0.4);
  noiseHit(cu.splash, 0.4, 'lowpass', 1400, 0.8, 0.2, 0.3);
