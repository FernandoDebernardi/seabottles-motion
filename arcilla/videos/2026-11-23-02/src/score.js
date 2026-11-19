  const T = TIMELINE, cu = T.cues;
  to = 's';
  for (const t of [0.4, 0.8, 1.1, 1.5, 1.8, 2.1, 2.5]) noiseHit(t, 0.3, 'lowpass', 1300, 0.8, 0.12, (t * 7 % 2) - 1, 0.1);
  for (let i = 0; i < 5; i++) noiseHit(3.8 + i * 0.5, 0.25, 'bandpass', 900 + i * 120, 4, 0.06, 0.2, 0.3);
  noiseHit(cu.open, 0.08, 'bandpass', 700, 3, 0.2, 0);
