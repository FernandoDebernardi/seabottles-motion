  const T = TIMELINE, cu = T.cues;
  to = 's';
  for (const d of [0.0, 0.25, 0.5, 0.15, 0.4, 0.6]) noiseHit(0.45 + d, 0.35, 'lowpass', 1300, 0.8, 0.13, d * 2 - 0.6, 0.1);
  sweep(3.6, 6.8, 0.01, 300, 900, 0);
  noiseHit(10.9, 0.12, 'bandpass', 900, 4, 0.12, 0.2, 0.2);
