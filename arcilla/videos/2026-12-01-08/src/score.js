  const T = TIMELINE, cu = T.cues;
  to = 's';
  noiseHit(1.0, 0.3, 'lowpass', 1500, 0.8, 0.15, 0.2, 0.1);
  for (let i = 0; i < 6; i++) noiseHit(cu.bite + i * 0.12, 0.05, 'bandpass', 1800, 6, 0.1, 0.1);
  sweep(10.7, cu.surface, 0.012, 300, 2000, 0);
  noiseHit(cu.surface, 0.4, 'lowpass', 1400, 0.8, 0.2, 0.1);
  noiseHit(14.3, 0.08, 'bandpass', 700, 3, 0.18, 0);
