  const T = TIMELINE, cu = T.cues;
  to = 's';
  for (let i = 0; i < 3; i++) noiseHit(0.25 + i * 0.75, 0.12, 'bandpass', 2600, 4, 0.18, 0);
  for (let i = 0; i < 3; i++) noiseHit(4.3 + i * 0.7, 0.2, 'bandpass', 3200, 5, 0.1, 0.2, 0.3);
  for (let i = 0; i < 3; i++) noiseHit(14.7 + i * 0.35 + 0.3, 0.1, 'bandpass', 1800, 3, 0.15, 0);
