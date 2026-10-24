import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {crearAzar} from '../semilla';

// Clima del lugar de la botella: lluvia fina, niebla o un cielo cubierto apenas apagado.
// Despejado y viento no dibujan nada aquí (el viento se ve en las nubes, las olas y lo que flota).
export const Clima: React.FC<{tipo: 'despejado' | 'nublado' | 'viento' | 'lluvia' | 'niebla'; semilla: string; noche: boolean}> = ({tipo, semilla, noche}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const gotas = React.useMemo(() => {
    const az = crearAzar(semilla + ':lluvia');
    return Array.from({length: 90}, () => ({x: az.numero(), y: az.numero(), l: az.entre(0.012, 0.03), v: az.entre(0.55, 0.9), o: az.entre(0.25, 0.55)}));
  }, [semilla]);
  if (tipo === 'despejado' || tipo === 'viento') return null;
  if (tipo === 'nublado') {
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', inset: 0, background: noche ? 'rgba(10,20,40,0.12)' : 'rgba(120,130,145,0.14)'}} />
      </AbsoluteFill>
    );
  }
  const t = frame / fps;
  if (tipo === 'niebla') {
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(240,240,235,0.0) 35%, rgba(240,240,235,0.35) 60%, rgba(240,240,235,0.05) 100%)'}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* el cielo se apaga un poco */}
      <div style={{position: 'absolute', inset: 0, background: noche ? 'rgba(10,20,40,0.25)' : 'rgba(90,110,130,0.22)'}} />
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        {gotas.map((g, i) => {
          const y = ((g.y + t * g.v) % 1.1) * height - height * 0.05;
          const x = g.x * width - (y / height) * width * 0.04;
          return <line key={i} x1={x} y1={y} x2={x - width * 0.004} y2={y + g.l * height} stroke="rgba(235,245,255,0.75)" strokeWidth={2} strokeLinecap="round" opacity={g.o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
