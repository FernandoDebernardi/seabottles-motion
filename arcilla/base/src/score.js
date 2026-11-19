  const T = TIMELINE, cu = T.cues;
  to = 's';
  noiseHit(cu.corkHome + 0.45, 0.08, 'bandpass', 700, 3, 0.2, 0);
  for (let i = 0; i < 6; i++) noiseHit(cu.write1 + i * 0.22, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  for (let i = 0; i < 4; i++) noiseHit(cu.write2 + i * 0.22, 0.06, 'bandpass', 4200, 2, 0.12, 0.2);
  for (let i = 0; i < 3; i++) noiseHit(cu.t1 + i * 0.55 + 0.4, 0.12, 'bandpass', 2600, 4, 0.18, 0);
  noiseHit(cu.splash, 0.4, 'lowpass', 1400, 0.8, 0.2, 0.1);
  sweep(cu.release, cu.splash - 0.05, 0.015, 500, 2600, -0.2);
  noiseHit(cu.toss2, 0.4, 'lowpass', 1400, 0.8, 0.15, 0.1);
