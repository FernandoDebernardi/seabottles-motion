import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {asegurarFuentes} from './fuentes';
import {color, fuente} from './tema';

// «Seabottles en 26 segundos»: versión hecha con lo que aprendimos de las animaciones virales
// (gancho en el primer segundo, subtítulos de 1–3 palabras con la palabra clave en otro color,
// cortes al beat de 120 bpm, una sola emoción, efectos de sonido por evento, loop al final).
// Solo usa la paleta de Seabottles: nada de las ilustraciones de Recraft. Las botellas que se ven
// son SIMULADAS (textos escritos para la pieza, no de personas reales).

export const DURACION_VIRAL = 26;
// tiempos (s) — musica-viral.mjs usa los mismos
export const TV = {gancho: 0, escribe: 2, enrolla: 5, lanza: 6.5, viaje: 8.5, montaje: 12.5, ceros: 16.5, respuesta: 19.5, cta: 23, fin: 26};

export const C = {
  hondo: '#0F2F2E',
  hondo2: '#1C4A44',
  lima: color.limaBrillante,
  limaV: color.limaVerde,
  verde: color.verdeOscuro,
  verdeP: color.verdeProfundo,
  dorado: color.dorado,
  papel: color.papel,
  papelB: color.papelBorde,
  tinta: color.tinta,
  vidrio: color.vidrio,
  mar1: '#69BCCA',
  mar2: '#3F96AB',
  coral: '#E5484D',
  blanco: color.verdeBlanco,
};
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const io = Easing.bezier(0.65, 0, 0.35, 1); // easeInOutCubic
export const salir = Easing.bezier(0.22, 1, 0.36, 1);

// ---------- piezas ----------
export const popEn = (frame: number, fps: number, desde: number, damping = 11, stiffness = 180) =>
  spring({frame: frame - Math.round(desde * fps), fps, config: {damping, stiffness, mass: 0.7}});

// palabra que «cae» con resorte (subtítulo cinético)
export const Palabra: React.FC<{desde: number; children: React.ReactNode; tam: number; col?: string; sombra?: string}> = ({desde, children, tam, col = C.blanco, sombra}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = popEn(frame, fps, desde, 10, 210);
  if (frame < Math.round(desde * fps)) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: fuente.display,
        fontWeight: 800,
        fontSize: tam,
        lineHeight: 1.02,
        letterSpacing: '-0.025em',
        color: col,
        transform: `translateY(${(1 - p) * tam * 0.5}px) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -6}deg)`,
        opacity: Math.min(1, p * 2),
        textShadow: sombra,
        marginRight: tam * 0.22,
      }}
    >
      {children}
    </span>
  );
};

export const Bandera: React.FC<{c: string; w: number; style?: React.CSSProperties}> = ({c, w, style}) => (
  <Img src={staticFile(`banderas/${c}.svg`)} style={{width: w, height: w * 0.75, borderRadius: w * 0.12, objectFit: 'cover', border: `3px solid ${C.tinta}`, ...style}} />
);

// botella vectorial plana (solo paleta): vidrio celeste, contorno tinta, corcho, rollo adentro
export const BotellaPlana: React.FC<{w: number; rollo: number; corcho: number; style?: React.CSSProperties}> = ({w, rollo, corcho, style}) => {
  const h = w * 2.4;
  return (
    <svg width={w} height={h} viewBox="0 0 100 240" style={{overflow: 'visible', ...style}}>
      <path d="M38 22 L38 62 Q38 74 26 86 Q10 102 10 122 L10 222 Q10 234 22 234 L78 234 Q90 234 90 222 L90 122 Q90 102 74 86 Q62 74 62 62 L62 22 Z" fill={C.vidrio} fillOpacity={0.85} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
      {/* rollo de papel */}
      <g opacity={rollo} transform={`translate(0 ${(1 - rollo) * -120})`}>
        <rect x={30} y={118} width={40} height={96} rx={10} fill={C.papel} stroke={C.tinta} strokeWidth={5} />
        <rect x={30} y={160} width={40} height={10} fill={C.dorado} stroke={C.tinta} strokeWidth={4} />
      </g>
      {/* brillo */}
      <path d="M22 128 L22 206" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
      <path d="M30 96 Q24 102 22 112" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8} fill="none" />
      {/* corcho */}
      <g transform={`translate(0 ${(1 - corcho) * -70}) `}>
        <rect x={34} y={4} width={32} height={30} rx={6} fill={color.corcho} stroke={C.tinta} strokeWidth={5} />
      </g>
    </svg>
  );
};

// tarjeta de papel (botella simulada)
export const Tarjeta: React.FC<{texto: string; mar: string; acento: string; pais: string; bandera: string; w: number; visibles?: number; caret?: boolean; style?: React.CSSProperties}> = ({texto, mar, acento, pais, bandera, w, visibles, caret, style}) => {
  const frame = useCurrentFrame();
  const n = visibles === undefined ? texto.length : Math.floor(visibles);
  return (
    <div style={{width: w, background: C.papel, border: `5px solid ${C.tinta}`, borderRadius: w * 0.05, padding: `${w * 0.06}px ${w * 0.07}px`, boxShadow: `${w * 0.025}px ${w * 0.025}px 0 ${C.tinta}`, ...style}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: w * 0.04}}>
        <div style={{fontFamily: fuente.cuerpo, fontWeight: 800, fontSize: w * 0.04, letterSpacing: '.1em', textTransform: 'uppercase', color: acento}}>{mar}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: w * 0.02, fontFamily: fuente.cuerpo, fontWeight: 700, fontSize: w * 0.04, color: C.tinta}}>
          <Bandera c={bandera} w={w * 0.07} />
          {pais}
        </div>
      </div>
      <div style={{fontFamily: fuente.display, fontWeight: 700, fontSize: w * 0.092, lineHeight: 1.16, letterSpacing: '-0.01em', color: C.tinta, minHeight: w * 0.2}}>
        {texto.slice(0, n)}
        {caret && n < texto.length ? <span style={{opacity: Math.floor(frame / 6) % 2 ? 1 : 0.2, color: acento}}>|</span> : null}
      </div>
    </div>
  );
};

// fondo que cambia en cada corte
export const Fondo: React.FC<{col: string; col2?: string}> = ({col, col2}) => <AbsoluteFill style={{background: col2 ? `linear-gradient(180deg, ${col} 0%, ${col2} 100%)` : col}} />;

// barrido de transición: una franja de color que cruza en el corte
export const Barrido: React.FC<{en: number; col: string}> = ({en, col}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const p = interpolate(frame, [Math.round((en - 0.2) * fps), Math.round((en + 0.2) * fps)], [0, 1], {...clamp, easing: io});
  if (p <= 0 || p >= 1) return null;
  return <div style={{position: 'absolute', left: 0, width: W, height: H * 1.3, top: interpolate(p, [0, 1], [H, -H * 1.3]), background: col, transform: 'skewY(-8deg)'}} />;
};

const BOTELLAS = [
  {texto: '¿Qué canción te salvó un día?', mar: 'Mar de los recuerdos', acento: C.dorado, pais: 'México', bandera: 'mx', fondo: C.dorado},
  {texto: 'Hoy me animé a pedir ayuda.', mar: 'Mar de la vida', acento: C.verdeP, pais: 'Chile', bandera: 'cl', fondo: C.lima},
  {texto: 'Extraño la voz de mi abuela.', mar: 'Mar de los recuerdos', acento: C.dorado, pais: 'España', bandera: 'es', fondo: C.mar1},
  {texto: '¿A ti también te pesa el domingo?', mar: 'Mar de los pensamientos', acento: C.mar2, pais: 'Colombia', bandera: 'co', fondo: C.papel},
  {texto: 'Mañana renuncio. Creo.', mar: 'Mar de los secretos', acento: C.hondo2, pais: 'Argentina', bandera: 'ar', fondo: C.coral},
  {texto: 'Soñé que volaba sobre mi barrio.', mar: 'Mar de los sueños', acento: '#3B4C8C', pais: 'Perú', bandera: 'pe', fondo: C.vidrio},
  {texto: '¿Cuál fue tu mejor error?', mar: 'Mar de la vida', acento: C.verdeP, pais: 'Uruguay', bandera: 'uy', fondo: C.limaV},
  {texto: 'Gracias, desconocido de ayer.', mar: 'Mar del amor', acento: C.coral, pais: 'Ecuador', bandera: 'ec', fondo: C.dorado},
];

export const Viral: React.FC<{musica_archivo?: string}> = ({musica_archivo}) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  const en = (a: number, b: number) => t >= a && t < b;
  const cx = W * 0.5; // centro de la columna segura (a la derecha van los íconos de TikTok)
  const gran = W * 0.2;
  const usePop = (desde: number, damping = 11, stiffness = 180) => popEn(frame, fps, desde, damping, stiffness);

  // sacudida de cámara al caer la botella y en los golpes fuertes
  const golpes = [TV.escribe, TV.lanza + 1.15, TV.ceros, TV.cta];
  let shake = 0;
  for (const g of golpes) if (t >= g) shake = Math.max(shake, interpolate(t, [g, g + 0.25], [1, 0], clamp));
  const sx = noise2D('sx', t * 30, 0) * 10 * shake;
  const sy = noise2D('sy', 0, t * 30) * 10 * shake;

  return (
    <AbsoluteFill style={{background: C.hondo, overflow: 'hidden'}}>
      {musica_archivo ? <Audio src={staticFile(musica_archivo)} /> : null}
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        {/* ===== 1. GANCHO: «Nunca le dije esto a nadie.» ===== */}
        {en(0, TV.escribe) ? (
          <>
            <Fondo col={C.hondo} col2={C.hondo2} />
            <div style={{position: 'absolute', left: W * 0.12, width: W * 0.8, top: H * 0.17}}>
              {/* la primera palabra ya está en el cuadro 0 (portada de TikTok) */}
              <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: gran, lineHeight: 1.02, letterSpacing: '-0.025em', color: C.blanco, transform: `scale(${1.08 - 0.08 * usePop(0, 14, 200)})`, transformOrigin: 'left center'}}>Nunca</div>
              <div>
                <Palabra desde={0.45} tam={gran}>le dije</Palabra>
              </div>
              <div>
                <Palabra desde={0.9} tam={gran} col={C.dorado}>esto</Palabra>
              </div>
              <div>
                <Palabra desde={1.35} tam={gran}>
                  a <span style={{color: C.lima}}>nadie.</span>
                </Palabra>
              </div>
            </div>
          </>
        ) : null}

        {/* ===== 2. ESCRIBE (botella simulada) ===== */}
        {en(TV.escribe, TV.enrolla + 0.4) ? (
          <>
            <Fondo col={C.lima} />
            {(() => {
              const texto = 'A veces finjo que estoy bien para que nadie se preocupe.';
              const entra = usePop(TV.escribe, 12, 160);
              const vis = interpolate(t, [TV.escribe + 0.25, TV.escribe + 1.9], [0, texto.length], clamp);
              const sello = usePop(TV.escribe + 2.15, 9, 260);
              const enrolla = interpolate(t, [TV.enrolla, TV.enrolla + 0.4], [0, 1], {...clamp, easing: io});
              return (
                <>
                  <div style={{position: 'absolute', left: cx - W * 0.4, top: H * 0.17, width: W * 0.8, transform: `translateY(${(1 - entra) * H * 0.4}px) rotate(${-7 + entra * 5}deg) scaleY(${1 - enrolla * 0.92}) scaleX(${1 - enrolla * 0.5})`, transformOrigin: '50% 30%'}}>
                    <Tarjeta texto={texto} mar="Mar de los secretos" acento={C.hondo2} pais="Argentina" bandera="ar" w={W * 0.8} visibles={vis} caret />
                    {sello > 0.01 && t >= TV.escribe + 2.15 ? (
                      <div style={{position: 'absolute', right: -W * 0.03, bottom: -W * 0.07, padding: `${W * 0.015}px ${W * 0.035}px`, border: `6px solid ${C.coral}`, borderRadius: W * 0.02, color: C.coral, fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.06, letterSpacing: '.04em', textTransform: 'uppercase', background: C.papel, transform: `rotate(${-12 + (1 - sello) * 20}deg) scale(${2.2 - 1.2 * sello})`, opacity: Math.min(1, sello * 3)}}>
                        Sin firma
                      </div>
                    ) : null}
                  </div>
                  <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.56, textAlign: 'center'}}>
                    <Palabra desde={TV.escribe + 0.3} tam={W * 0.1} col={C.tinta}>Lo</Palabra>
                    <Palabra desde={TV.escribe + 0.6} tam={W * 0.1} col={C.tinta}>escribí</Palabra>
                    <br />
                    <Palabra desde={TV.escribe + 1.1} tam={W * 0.1} col={C.blanco} sombra={`4px 4px 0 ${C.tinta}`}>sin nombre.</Palabra>
                  </div>
                </>
              );
            })()}
          </>
        ) : null}

        {/* ===== 3. A LA BOTELLA ===== */}
        {en(TV.enrolla + 0.4, TV.lanza) ? (
          <>
            <Fondo col={C.papel} />
            {(() => {
              const b = usePop(TV.enrolla + 0.4, 12, 170);
              const rollo = interpolate(t, [TV.enrolla + 0.45, TV.enrolla + 0.85], [0, 1], {...clamp, easing: io});
              const corcho = interpolate(t, [TV.enrolla + 0.9, TV.enrolla + 1.1], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
              const squash = interpolate(t, [TV.enrolla + 1.1, TV.enrolla + 1.18, TV.enrolla + 1.35], [0, 1, 0], clamp);
              return (
                <>
                  <div style={{position: 'absolute', left: cx - W * 0.16, top: H * 0.3, transform: `scale(${(0.5 + 0.5 * b) * (1 + squash * 0.08)}, ${(0.5 + 0.5 * b) * (1 - squash * 0.1)})`, transformOrigin: '50% 100%'}}>
                    <BotellaPlana w={W * 0.32} rollo={rollo} corcho={corcho} />
                  </div>
                  <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.12, textAlign: 'center'}}>
                    <Palabra desde={TV.enrolla + 0.45} tam={W * 0.1} col={C.tinta}>Adentro</Palabra>
                    <Palabra desde={TV.enrolla + 0.75} tam={W * 0.1} col={C.tinta}>de una</Palabra>
                    <br />
                    <Palabra desde={TV.enrolla + 1.05} tam={W * 0.13} col={C.dorado} sombra={`4px 4px 0 ${C.tinta}`}>botella.</Palabra>
                  </div>
                </>
              );
            })()}
          </>
        ) : null}

        {/* ===== 4. AL MAR ===== */}
        {en(TV.lanza, TV.viaje) ? (
          <>
            <Fondo col={C.mar1} col2={C.mar2} />
            {(() => {
              const v = interpolate(t, [TV.lanza + 0.15, TV.lanza + 1.15], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1)});
              const x = interpolate(v, [0, 1], [-W * 0.1, cx]);
              const y = H * 0.62 - Math.sin(v * Math.PI) * H * 0.42 - (1 - v) * H * 0.05;
              const rot = v * 540;
              const caida = interpolate(t, [TV.lanza + 1.15, TV.lanza + 1.9], [0, 1], clamp);
              const lineas = v > 0.05 && v < 0.98;
              return (
                <>
                  {/* olas planas */}
                  {[0, 1, 2].map((k) => (
                    <svg key={k} width={W * 1.4} height={H * 0.4} style={{position: 'absolute', left: -W * 0.2 + Math.sin(t * 2 + k) * 30, top: H * (0.66 + k * 0.08)}}>
                      <path d={`M0 60 ${Array.from({length: 12}, (_, i) => `Q ${i * 130 + 65} ${k % 2 ? 0 : 120} ${(i + 1) * 130} 60`).join(' ')} L ${W * 1.4} ${H * 0.4} L 0 ${H * 0.4} Z`} fill={[C.mar1, C.mar2, '#2C7488'][k]} stroke={C.tinta} strokeWidth={5} />
                    </svg>
                  ))}
                  {lineas
                    ? [0, 1, 2, 3].map((k) => (
                        <div key={k} style={{position: 'absolute', left: x - W * (0.25 + k * 0.05), top: y + W * (0.05 + k * 0.06), width: W * (0.18 + k * 0.03), height: 8, borderRadius: 8, background: C.blanco, opacity: 0.8 - k * 0.15}} />
                      ))
                    : null}
                  {caida < 1 ? (
                    <div style={{position: 'absolute', left: x - W * 0.08, top: y - W * 0.19 + caida * H * 0.08, transform: `rotate(${rot}deg) scale(${1 - caida * 0.4})`, opacity: 1 - caida}}>
                      <BotellaPlana w={W * 0.16} rollo={1} corcho={1} />
                    </div>
                  ) : null}
                  {/* salpicadura */}
                  {caida > 0
                    ? [0, 1, 2].map((k) => {
                        const g = interpolate(caida, [k * 0.12, 1], [0, 1], {...clamp, easing: salir});
                        return <div key={k} style={{position: 'absolute', left: cx - W * 0.4 * g, top: H * 0.7 - W * 0.08 * g, width: W * 0.8 * g, height: W * 0.16 * g, borderRadius: '50%', border: `${8 - k * 2}px solid ${C.blanco}`, opacity: 1 - g}} />;
                      })
                    : null}
                  {caida > 0 && caida < 0.8
                    ? Array.from({length: 12}, (_, k) => {
                        const a = -Math.PI * (0.1 + (k / 11) * 0.8);
                        const q = caida / 0.8;
                        return <div key={`d${k}`} style={{position: 'absolute', left: cx + Math.cos(a) * W * 0.3 * q, top: H * 0.69 + Math.sin(a) * W * 0.35 * q + q * q * W * 0.3, width: W * 0.035, height: W * 0.035, borderRadius: '50%', background: C.blanco, border: `3px solid ${C.tinta}`, opacity: 1 - q}} />;
                      })
                    : null}
                  <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.1, textAlign: 'center'}}>
                    <Palabra desde={TV.lanza + 0.1} tam={W * 0.1} col={C.tinta}>Y la tiré</Palabra>
                    <br />
                    <Palabra desde={TV.lanza + 1.15} tam={W * 0.2} col={C.blanco} sombra={`6px 6px 0 ${C.tinta}`}>al mar.</Palabra>
                  </div>
                </>
              );
            })()}
          </>
        ) : null}

        {/* ===== 5. LA CORRIENTE ELIGE ===== */}
        {en(TV.viaje, TV.montaje) ? (
          <>
            <Fondo col={C.hondo} col2={C.hondo2} />
            {(() => {
              const R = W * 0.36;
              const gx = cx, gy = H * 0.5;
              const giro = t * 0.6;
              const camino = interpolate(t, [TV.viaje + 0.4, TV.viaje + 3.0], [0, 1], {...clamp, easing: io});
              const g = usePop(TV.viaje, 14, 140);
              // punto sobre una curva cuadrática de AR (abajo izq) a ES (arriba der)
              const P0 = [gx - R * 0.35, gy + R * 0.55], P1 = [gx - R * 0.2, gy - R * 0.9], P2 = [gx + R * 0.45, gy - R * 0.45];
              const bez = (u: number) => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
              const pts = Array.from({length: 41}, (_, i) => bez((i / 40) * camino));
              const [hx, hy] = bez(camino);
              const llega = usePop(TV.viaje + 3.0, 9, 240);
              return (
                <>
                  <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `scale(${0.6 + 0.4 * g})`, transformOrigin: `${gx}px ${gy}px`}}>
                    <circle cx={gx} cy={gy} r={R} fill={C.mar2} stroke={C.blanco} strokeWidth={6} />
                    {[-60, -30, 0, 30, 60].map((lat) => {
                      const yy = gy - R * Math.sin((lat * Math.PI) / 180);
                      const rx = R * Math.cos((lat * Math.PI) / 180);
                      return <ellipse key={lat} cx={gx} cy={yy} rx={rx} ry={rx * 0.12} fill="none" stroke={C.blanco} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="4 10" />;
                    })}
                    {Array.from({length: 6}, (_, k) => {
                      const fase = giro + (k * Math.PI) / 6;
                      return <ellipse key={k} cx={gx} cy={gy} rx={Math.abs(Math.cos(fase)) * R} ry={R} fill="none" stroke={C.blanco} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="4 10" />;
                    })}
                    <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.dorado} strokeWidth={16} strokeLinecap="round" strokeDasharray="2 30" />
                    {camino > 0 ? <circle cx={hx} cy={hy} r={26} fill={C.dorado} stroke={C.tinta} strokeWidth={5} /> : null}
                    {camino > 0 ? <circle cx={hx} cy={hy} r={18 + (t * 60) % 40} fill="none" stroke={C.dorado} strokeOpacity={1 - ((t * 60) % 40) / 40} strokeWidth={4} /> : null}
                  </svg>
                  <Bandera c="ar" w={W * 0.11} style={{position: 'absolute', left: P0[0] - W * 0.055, top: P0[1] + W * 0.03}} />
                  {llega > 0.01 && t >= TV.viaje + 3.0 ? <Bandera c="es" w={W * 0.11} style={{position: 'absolute', left: P2[0] - W * 0.055, top: P2[1] - W * 0.13, transform: `scale(${llega})`}} /> : null}
                  <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.085, textAlign: 'center'}}>
                    <Palabra desde={TV.viaje + 0.2} tam={W * 0.1}>La corriente</Palabra>
                    <br />
                    <Palabra desde={TV.viaje + 0.9} tam={W * 0.12} col={C.lima}>elige</Palabra>
                    <Palabra desde={TV.viaje + 1.4} tam={W * 0.1}>quién</Palabra>
                    <br />
                    <Palabra desde={TV.viaje + 1.8} tam={W * 0.1}>la lee.</Palabra>
                  </div>
                </>
              );
            })()}
          </>
        ) : null}

        {/* ===== 6. MONTAJE: botellas de otras personas (simuladas), una por beat ===== */}
        {en(TV.montaje, TV.ceros) ? (
          (() => {
            const i = Math.min(BOTELLAS.length - 1, Math.floor((t - TV.montaje) / 0.5));
            const b = BOTELLAS[i];
            const local = t - TV.montaje - i * 0.5;
            const p = spring({frame: Math.round(local * fps), fps, config: {damping: 12, stiffness: 260, mass: 0.6}});
            const lado = i % 2 ? 1 : -1;
            return (
              <>
                <Fondo col={b.fondo} />
                <div style={{position: 'absolute', left: cx - W * 0.4, top: H * 0.3, transform: `translateX(${(1 - p) * lado * W * 0.6}px) rotate(${lado * (4 - 2 * p)}deg) scale(${0.9 + 0.1 * p + local * 0.06})`}}>
                  <Tarjeta {...b} w={W * 0.8} />
                </div>
                <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.1, textAlign: 'center'}}>
                  <span style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.085, color: C.tinta, background: C.blanco, padding: `${W * 0.01}px ${W * 0.03}px`, border: `5px solid ${C.tinta}`, borderRadius: W * 0.02}}>
                    Del otro lado, <span style={{color: C.coral}}>alguien</span> escribe.
                  </span>
                </div>
              </>
            );
          })()
        ) : null}

        {/* ===== 7. CERO: sin likes, sin seguidores, sin nombres ===== */}
        {en(TV.ceros, TV.respuesta) ? (
          <>
            <Fondo col={C.verde} />
            {['likes', 'seguidores', 'nombres'].map((x, i) => {
              const d = TV.ceros + 0.15 + i * 0.6;
              const p = usePop(d, 10, 220);
              const rueda = interpolate(t, [d, d + 0.45], [1, 0], {...clamp, easing: salir});
              const n = Math.floor(rueda * (9999 - i * 1234) * Math.abs(Math.sin(frame * 1.7 + i)));
              if (t < d) return null;
              return (
                <div key={x} style={{position: 'absolute', left: W * 0.12, top: H * (0.1 + i * 0.15), display: 'flex', alignItems: 'baseline', gap: W * 0.035, transform: `translateX(${(1 - p) * -W * 0.5}px)`}}>
                  <span style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.28, lineHeight: 1, color: C.lima, fontVariantNumeric: 'tabular-nums', minWidth: W * 0.17}}>{rueda > 0.02 ? n : 0}</span>
                  <span style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.12, color: C.blanco}}>{x}</span>
                </div>
              );
            })}
            <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.58, textAlign: 'center'}}>
              <Palabra desde={TV.ceros + 2.0} tam={W * 0.12} col={C.dorado}>Solo palabras.</Palabra>
            </div>
          </>
        ) : null}

        {/* ===== 8. LA RESPUESTA (ilustrativa) ===== */}
        {en(TV.respuesta, TV.cta) ? (
          <>
            <Fondo col={C.vidrio} col2={C.mar1} />
            {(() => {
              const p = usePop(TV.respuesta + 0.1, 12, 150);
              const linea = interpolate(t, [TV.respuesta + 0.3, TV.respuesta + 1.1], [0, 1], {...clamp, easing: io});
              const texto = 'Yo también lo hago. Aquí no hace falta fingir: te leí.';
              const vis = interpolate(t, [TV.respuesta + 0.9, TV.respuesta + 2.3], [0, texto.length], clamp);
              return (
                <>
                  <div style={{position: 'absolute', left: cx - W * 0.3, top: H * 0.17, width: W * 0.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Bandera c="ar" w={W * 0.11} />
                    <svg width={W * 0.34} height={20}>
                      <line x1={0} y1={10} x2={W * 0.34 * linea} y2={10} stroke={C.tinta} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 20" />
                    </svg>
                    <Bandera c="es" w={W * 0.11} style={{transform: `scale(${linea > 0.95 ? 1 : 0.6})`, opacity: linea > 0.3 ? 1 : 0.3}} />
                  </div>
                  <div style={{position: 'absolute', left: cx - W * 0.4, top: H * 0.25, transform: `translateY(${(1 - p) * H * 0.5}px) rotate(${3 - 4 * p}deg)`}}>
                    <div style={{fontFamily: fuente.cuerpo, fontWeight: 800, fontSize: W * 0.032, letterSpacing: '.08em', textTransform: 'uppercase', color: C.tinta, marginBottom: W * 0.02, textAlign: 'center'}}>Así podría responderte alguien desde España</div>
                    <Tarjeta texto={texto} mar="Respuesta" acento={C.coral} pais="España" bandera="es" w={W * 0.8} visibles={vis} caret />
                  </div>
                  <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.58, textAlign: 'center'}}>
                    <Palabra desde={TV.respuesta + 2.4} tam={W * 0.1} col={C.tinta}>Y no sabes</Palabra>
                    <br />
                    <Palabra desde={TV.respuesta + 2.8} tam={W * 0.1} col={C.blanco} sombra={`4px 4px 0 ${C.tinta}`}>quién es.</Palabra>
                  </div>
                </>
              );
            })()}
          </>
        ) : null}

        {/* ===== 9. CTA + empalme con el principio ===== */}
        {en(TV.cta, TV.fin + 1) ? (
          <>
            <Fondo col={C.lima} />
            {(() => {
              const pill = usePop(TV.cta + 1.3, 11, 200);
              const pulso = 1 + 0.04 * Math.max(0, Math.sin(((t - TV.cta) / 0.5) * Math.PI * 2));
              return (
                <>
                  <div style={{position: 'absolute', left: W * 0.09, width: W * 0.82, top: H * 0.2, textAlign: 'center'}}>
                    <Palabra desde={TV.cta + 0.05} tam={W * 0.12} col={C.tinta}>¿Qué le</Palabra>
                    <br />
                    <Palabra desde={TV.cta + 0.4} tam={W * 0.12} col={C.tinta}>dirías a un</Palabra>
                    <br />
                    <Palabra desde={TV.cta + 0.8} tam={W * 0.12} col={C.blanco} sombra={`6px 6px 0 ${C.tinta}`}>desconocido?</Palabra>
                  </div>
                  {t >= TV.cta + 1.3 ? (
                    <div style={{position: 'absolute', left: cx - W * 0.3, width: W * 0.6, top: H * 0.56, textAlign: 'center', transform: `scale(${pill * pulso})`}}>
                      <span style={{display: 'inline-block', fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.075, color: C.lima, background: C.tinta, padding: `${W * 0.025}px ${W * 0.06}px`, borderRadius: 999}}>seabottles.org</span>
                    </div>
                  ) : null}
                  {t >= TV.cta + 1.3 ? (
                    <div style={{position: 'absolute', left: cx - W * 0.09, top: H * 0.66, transform: `rotate(${Math.sin(t * 3) * 8}deg)`, transformOrigin: '50% 90%'}}>
                      <BotellaPlana w={W * 0.18} rollo={1} corcho={1} />
                    </div>
                  ) : null}
                </>
              );
            })()}
            {/* empalme: el último medio segundo vuelve al color y a la palabra del primer cuadro */}
            {(() => {
              const k = interpolate(t, [TV.fin - 0.45, TV.fin - 0.1], [0, 1], {...clamp, easing: io});
              if (k <= 0) return null;
              return (
                <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.hondo} 0%, ${C.hondo2} 100%)`, clipPath: `circle(${k * 120}% at 50% 50%)`}}>
                  <div style={{position: 'absolute', left: W * 0.12, top: H * 0.17, fontFamily: fuente.display, fontWeight: 800, fontSize: gran, lineHeight: 1.02, letterSpacing: '-0.025em', color: C.blanco, transform: 'scale(1.08)', transformOrigin: 'left center', opacity: k}}>Nunca</div>
                </AbsoluteFill>
              );
            })()}
          </>
        ) : null}

        {/* barridos en los cortes grandes */}
        <Barrido en={TV.escribe} col={C.dorado} />
        <Barrido en={TV.viaje} col={C.lima} />
        <Barrido en={TV.ceros} col={C.dorado} />
        <Barrido en={TV.cta} col={C.tinta} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
