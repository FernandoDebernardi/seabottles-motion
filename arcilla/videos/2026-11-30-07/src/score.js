  const T = TIMELINE, cu = T.cues;
  to = 's';
  for (let i = 0; i < 5; i++) noiseHit(3.5 + i * 1.4, 0.25, 'bandpass', 2400 + i * 300, 5, 0.07, 0, 0.3);
  for (let j = 0; j < 3; j++) noiseHit(11.0 + j * 0.8 + 1.2, 0.15, 'bandpass', 3000, 4, 0.1, 0.2, 0.3);
