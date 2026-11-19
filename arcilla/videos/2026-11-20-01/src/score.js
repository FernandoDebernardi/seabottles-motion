  const T = TIMELINE, cu = T.cues;
  to = 's';
  noiseHit(cu.splash, 0.4, 'lowpass', 1400, 0.8, 0.2, 0.1);
  for (let i = 0; i < 6; i++) noiseHit(cu.write1 + i * 0.2, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  for (let i = 0; i < 5; i++) noiseHit(cu.write2 + i * 0.2, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  sweep(cu.fly, cu.inside, 0.012, 600, 2400, 0.1);
  sweep(T.cuts[1] + 0.1, cu.splash2 - 0.05, 0.015, 500, 2600, -0.2);
  noiseHit(cu.splash2, 0.4, 'lowpass', 1400, 0.8, 0.2, 0.1);
  noiseHit(cu.arrive, 0.25, 'bandpass', 3000, 3, 0.1, 0.3);
