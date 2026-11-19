  const T = TIMELINE, cu = T.cues;
  to = 's';
  for (let i = 0; i < 6; i++) noiseHit(0.05 + i * 0.18, 0.08, 'bandpass', 3600, 2, 0.14, 0.2);
  for (let i = 0; i < 6; i++) noiseHit(cu.write1 + i * 0.2, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  for (let i = 0; i < 5; i++) noiseHit(cu.write2 + i * 0.2, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  sweep(cu.fly, cu.inside, 0.012, 600, 2400, 0.1);
  noiseHit(cu.stamp, 0.18, 'lowpass', 500, 1, 0.35, 0);
