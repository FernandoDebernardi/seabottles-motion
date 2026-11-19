  const T = TIMELINE, cu = T.cues;
  to = 's';
  noiseHit(0.6, 0.1, 'bandpass', 900, 3, 0.18, 0.2);
  for (let i = 0; i < 6; i++) noiseHit(cu.write1 + i * 0.18, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  for (let i = 0; i < 5; i++) noiseHit(cu.write2 + i * 0.18, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  sweep(cu.fly, cu.inside, 0.012, 600, 2400, 0.1);
  for (let k = 0; k < 3; k++) noiseHit(7.3 + k * 1.25 + 0.55, 0.1, 'bandpass', 900, 3, 0.15, 0.2);
