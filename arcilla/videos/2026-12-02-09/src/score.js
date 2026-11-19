  const T = TIMELINE, cu = T.cues;
  to = 's';
  noiseHit(0.8, 0.35, 'lowpass', 1400, 0.8, 0.15, -0.4, 0.1);
  noiseHit(1.3, 0.35, 'lowpass', 1400, 0.8, 0.15, 0.4, 0.1);
  for (const t of [3.6, 7.1, 10.6]) sweep(t, t + 0.9, 0.008, 1200, 300, 0);
