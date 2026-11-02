import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {asegurarFuentes} from './fuentes';
import {fuente} from './tema';
import {Bandera, Barrido, BotellaPlana, C, clamp, Fondo, io, Palabra, popEn, salir} from './Viral';
import tiempos from './tiempos.json';
import {Bicho, MarConFauna} from './tiktok/Fauna';

// Los dos videos para FIJAR en el perfil de TikTok (series de identidad del informe de TikTok):
//  · «Seabottles en 15 segundos» (#6): cómo funciona, de punta a punta.
//  · «Manifiesto» (#16, 12 s): lo que no hay y lo que sí.
// Estilo de la versión viral (tipografía cinética al beat, solo la paleta) y zona segura de
// TikTok según el informe: texto entre y≈260 e y≈1240, ancho ≤ 780 px, sin tocar la columna de
// botones de la derecha.

// tiempos (s) en src/tiempos.json — musica-fijados.mjs lee el mismo archivo
export const T15 = {gancho: 0, ...tiempos.quince};
export const TM = {gancho: 0, ...tiempos.manifiesto};

// columna segura
const useCol = () => {
  const {width: W, height: H} = useVideoConfig();
  return {W, H, x: W * 0.12, ancho: W * 0.76, cx: W * 0.5};
};

const Linea: React.FC<{top: number; children: React.ReactNode; centro?: boolean}> = ({top, children, centro = true}) => {
  const {H, x, ancho} = useCol();
  return <div style={{position: 'absolute', left: x, width: ancho, top: H * top, textAlign: centro ? 'center' : 'left'}}>{children}</div>;
};

const Pastilla: React.FC<{desde: number; texto: string; fondo: string; tinta: string; tam: number}> = ({desde, texto, fondo, tinta, tam}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < desde * fps) return null;
  const p = popEn(frame, fps, desde, 10, 220);
  return (
    <span style={{display: 'inline-block', fontFamily: fuente.display, fontWeight: 800, fontSize: tam, color: tinta, background: fondo, padding: `${tam * 0.25}px ${tam * 0.6}px`, borderRadius: 999, border: `5px solid ${C.tinta}`, boxShadow: `6px 6px 0 ${C.tinta}`, transform: `scale(${p}) rotate(${(1 - p) * -8}deg)`, margin: tam * 0.12}}>
      {texto}
    </span>
  );
};

// el mar con fauna 2D del tercio de abajo (ver src/tiktok/Fauna.tsx); entra desde abajo al empezar
// la escena, salvo en el gancho (s0 = 0) y en el empalme del loop (s0 = fin), que deben ser idénticos
const MarDe: React.FC<{t: number; s0: number; dur: number; y: number; elenco: Bicho[]; botella?: boolean; botellaDesde?: number; fijo?: boolean}> = ({t, s0, dur, y, elenco, botella, botellaDesde, fijo}) => {
  const {W, H} = useCol();
  const sube = fijo ? 1 : interpolate(t, [s0, s0 + 0.35], [0, 1], {...clamp, easing: salir});
  return <MarConFauna W={W} H={H} t={t} s0={s0} dur={dur} y0={H * y} elenco={elenco} botella={botella} botellaDesde={botellaDesde} sube={sube} izquierda={fijo ? true : undefined} />;
};

const sacudida = (t: number, golpes: number[]) => {
  let s = 0;
  for (const g of golpes) if (t >= g) s = Math.max(s, interpolate(t, [g, g + 0.22], [1, 0], clamp));
  return {x: noise2D('x', t * 30, 0) * 9 * s, y: noise2D('y', 0, t * 30) * 9 * s};
};

// ================= #6 · Seabottles en 15 segundos =================
export const EnQuince: React.FC<{musica_archivo?: string}> = ({musica_archivo}) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {W, H, cx} = useCol();
  const t = frame / fps;
  const en = (a: number, b: number) => t >= a && t < b;
  const g = W * 0.15;
  const m = W * 0.1;
  const sh = sacudida(t, [T15.escribe, T15.corriente, T15.cta]);
  const sombra = `5px 5px 0 ${C.tinta}`;

  return (
    <AbsoluteFill style={{background: C.hondo, overflow: 'hidden'}}>
      {musica_archivo ? <Audio src={staticFile(musica_archivo)} /> : null}
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        {/* 0–2 · gancho (legible en el cuadro 0: es la portada en el perfil) */}
        {en(0, T15.escribe) ? (
          <>
            <Fondo col={C.hondo} col2={C.hondo2} />
            <MarDe t={t} s0={0} dur={T15.escribe} y={0.68} elenco={['ballena', 'gaviota']} fijo />
            <Linea top={0.16}>
              <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: g, lineHeight: 1.02, letterSpacing: '-0.025em', color: C.blanco}}>Una red social</div>
              <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: g * 1.12, lineHeight: 1.05, letterSpacing: '-0.025em', color: C.lima, transform: `scale(${1.12 - 0.12 * popEn(frame, fps, 0, 12, 200)})`}}>sin likes.</div>
            </Linea>
            <Linea top={0.47}>
              {/* gancho completo desde el cuadro 0: solo golpea al beat */}
              <Palabra fijo desde={0.9} tam={m} col={C.dorado}>Así</Palabra>
              <Palabra fijo desde={1.2} tam={m} col={C.dorado}>funciona:</Palabra>
            </Linea>
          </>
        ) : null}

        {/* 2–5 · escribes sin decir quién eres */}
        {en(T15.escribe, T15.mar) ? (
          <>
            <Fondo col={C.lima} />
            <MarDe t={t} s0={T15.escribe} dur={T15.mar - T15.escribe} y={0.71} elenco={['peces']} />
            {(() => {
              const p = popEn(frame, fps, T15.escribe + 0.1, 12, 170);
              const texto = 'Hoy por fin dije que no.';
              const vis = Math.floor(interpolate(t, [T15.escribe + 0.5, T15.escribe + 1.5], [0, texto.length], clamp));
              const sello = popEn(frame, fps, T15.escribe + 1.8, 9, 260);
              return (
                <>
                  <Linea top={0.13}>
                    <Palabra desde={T15.escribe} tam={m} col={C.tinta}>Escribes</Palabra>
                    <br />
                    <Palabra desde={T15.escribe + 0.3} tam={m} col={C.tinta}>sin decir</Palabra>
                    <Palabra desde={T15.escribe + 0.55} tam={m} col={C.lima} resalte={C.tinta}>quién eres.</Palabra>
                  </Linea>
                  <div style={{position: 'absolute', left: cx - W * 0.33, top: H * 0.38, width: W * 0.66, transform: `translateY(${(1 - p) * H * 0.3}px) rotate(${-6 + 4 * p}deg)`}}>
                    <div style={{background: C.papel, border: `5px solid ${C.tinta}`, borderRadius: W * 0.035, padding: `${W * 0.045}px ${W * 0.05}px`, boxShadow: `${W * 0.02}px ${W * 0.02}px 0 ${C.tinta}`}}>
                      <div style={{fontFamily: fuente.cuerpo, fontWeight: 800, fontSize: W * 0.028, letterSpacing: '.1em', textTransform: 'uppercase', color: C.verdeP, marginBottom: W * 0.02}}>Tu botella</div>
                      <div style={{fontFamily: fuente.display, fontWeight: 700, fontSize: W * 0.068, lineHeight: 1.15, color: C.tinta, minHeight: W * 0.16}}>
                        {texto.slice(0, vis)}
                        {vis < texto.length ? <span style={{color: C.coral, opacity: Math.floor(frame / 6) % 2 ? 1 : 0.2}}>|</span> : null}
                      </div>
                    </div>
                    {t >= T15.escribe + 1.8 ? (
                      <div style={{position: 'absolute', right: -W * 0.02, bottom: -W * 0.06, padding: `${W * 0.012}px ${W * 0.03}px`, border: `6px solid ${C.coral}`, borderRadius: W * 0.02, color: C.coral, background: C.papel, fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.055, textTransform: 'uppercase', transform: `rotate(${-10 + (1 - sello) * 20}deg) scale(${2.2 - 1.2 * sello})`, opacity: Math.min(1, sello * 3)}}>Sin firma</div>
                    ) : null}
                  </div>
                </>
              );
            })()}
          </>
        ) : null}

        {/* 5–8 · eliges un mar */}
        {en(T15.mar, T15.corriente) ? (
          <>
            <Fondo col={C.papel} />
            <Linea top={0.12}>
              <Palabra desde={T15.mar} tam={m} col={C.tinta}>Eliges</Palabra>
              <Palabra desde={T15.mar + 0.25} tam={m} col={C.dorado} resalte={C.tinta}>un mar.</Palabra>
            </Linea>
            <Linea top={0.27}>
              {[
                ['Vida', C.lima, C.tinta],
                ['Amor', C.coral, C.blanco],
                ['Secretos', C.hondo, C.lima],
                ['Sueños', '#3B4C8C', C.blanco],
                ['Recuerdos', C.dorado, C.tinta],
                ['Pensamientos', C.vidrio, C.tinta],
                ['Actualidad', C.mar2, C.blanco],
              ].map(([n, f, ti], i) => (
                <Pastilla key={n} desde={T15.mar + 0.5 + i * 0.25} texto={n} fondo={f} tinta={ti} tam={W * 0.05} />
              ))}
            </Linea>
            {/* la botella sale a flote, acostada y medio hundida */}
            <MarDe t={t} s0={T15.mar} dur={T15.corriente - T15.mar} y={0.66} elenco={['tortuga']} botella botellaDesde={0.3} />
          </>
        ) : null}

        {/* 8–11 · la corriente */}
        {en(T15.corriente, T15.acciones) ? (
          <>
            <Fondo col={C.hondo} col2={C.hondo2} />
            {(() => {
              const R = W * 0.3;
              const gx = cx, gy = H * 0.5;
              const s = popEn(frame, fps, T15.corriente, 14, 150);
              const origen: [number, number] = [gx - R * 0.3, gy + R * 0.55];
              const destinos: Array<{c: string; p: [number, number]; d: number}> = [
                {c: 'es', p: [gx + R * 0.55, gy - R * 0.45], d: 0.5},
                {c: 'mx', p: [gx - R * 0.7, gy - R * 0.35], d: 0.75},
                {c: 'co', p: [gx + R * 0.05, gy - R * 0.05], d: 1.0},
              ];
              return (
                <>
                  <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: `${gx}px ${gy}px`}}>
                    <circle cx={gx} cy={gy} r={R} fill={C.mar2} stroke={C.blanco} strokeWidth={6} />
                    {Array.from({length: 6}, (_, k) => (
                      <ellipse key={k} cx={gx} cy={gy} rx={Math.abs(Math.cos(t * 0.8 + (k * Math.PI) / 6)) * R} ry={R} fill="none" stroke={C.blanco} strokeOpacity={0.3} strokeWidth={3} strokeDasharray="4 10" />
                    ))}
                    {destinos.map((d) => {
                      const k = interpolate(t, [T15.corriente + d.d, T15.corriente + d.d + 0.7], [0, 1], {...clamp, easing: io});
                      const mx = (origen[0] + d.p[0]) / 2, my = Math.min(origen[1], d.p[1]) - R * 0.5;
                      const pts = Array.from({length: 31}, (_, i) => {
                        const u = (i / 30) * k;
                        return [(1 - u) ** 2 * origen[0] + 2 * (1 - u) * u * mx + u * u * d.p[0], (1 - u) ** 2 * origen[1] + 2 * (1 - u) * u * my + u * u * d.p[1]].join(',');
                      });
                      return k > 0 ? <polyline key={d.c} points={pts.join(' ')} fill="none" stroke={C.dorado} strokeWidth={12} strokeLinecap="round" strokeDasharray="2 24" /> : null;
                    })}
                  </svg>
                  <Bandera c="ar" w={W * 0.1} style={{position: 'absolute', left: origen[0] - W * 0.05, top: origen[1] + W * 0.02}} />
                  {destinos.map((d) => {
                    const p = popEn(frame, fps, T15.corriente + d.d + 0.7, 9, 240);
                    return t >= T15.corriente + d.d + 0.7 ? <Bandera key={d.c} c={d.c} w={W * 0.1} style={{position: 'absolute', left: d.p[0] - W * 0.05, top: d.p[1] - W * 0.11, transform: `scale(${p})`}} /> : null;
                  })}
                  <Linea top={0.12}>
                    <Palabra desde={T15.corriente + 0.1} tam={m}>La corriente</Palabra>
                    <br />
                    <Palabra desde={T15.corriente + 0.6} tam={m}>la lleva a</Palabra>
                    <Palabra desde={T15.corriente + 0.9} tam={m} col={C.lima}>pocas personas</Palabra>
                  </Linea>
                  <Linea top={0.75}>
                    <Palabra desde={T15.corriente + 1.8} tam={W * 0.065} col={C.dorado}>de cualquier país.</Palabra>
                  </Linea>
                </>
              );
            })()}
          </>
        ) : null}

        {/* 11–13.5 · qué puede hacer quien la encuentra */}
        {en(T15.acciones, T15.cta) ? (
          <>
            <Fondo col={C.vidrio} col2={C.mar1} />
            <MarDe t={t} s0={T15.acciones} dur={T15.cta - T15.acciones} y={0.72} elenco={['delfines']} />
            <Linea top={0.12}>
              <Palabra desde={T15.acciones} tam={W * 0.085} col={C.tinta}>Quien la encuentra</Palabra>
              <Palabra desde={T15.acciones + 0.3} tam={W * 0.085} col={C.tinta}>puede:</Palabra>
            </Linea>
            <Linea top={0.33}>
              {[
                ['Resonar', C.dorado, C.tinta],
                ['Responder', C.lima, C.tinta],
                ['Pasar la botella', C.papel, C.tinta],
              ].map(([n, f, ti], i) => (
                <div key={n}>
                  <Pastilla desde={T15.acciones + 0.6 + i * 0.5} texto={n} fondo={f} tinta={ti} tam={W * 0.075} />
                </div>
              ))}
            </Linea>
            <Linea top={0.64}>
              <Palabra desde={T15.acciones + 1.9} tam={W * 0.065} col={C.tinta}>Sin nombres. Sin números.</Palabra>
            </Linea>
          </>
        ) : null}

        {/* 13.5–15 · cierre + empalme */}
        {en(T15.cta, T15.fin + 1) ? (
          <>
            <Fondo col={C.lima} />
            <MarDe t={t} s0={T15.cta} dur={T15.fin - T15.cta} y={0.7} elenco={['pulpo']} botella />
            <Linea top={0.18}>
              <Palabra desde={T15.cta} tam={m} col={C.tinta}>Escribe tu</Palabra>
              <br />
              <Palabra desde={T15.cta + 0.25} tam={m * 1.15} col={C.lima} resalte={C.tinta}>primera botella.</Palabra>
            </Linea>
            <Linea top={0.47}>
              <Pastilla desde={T15.cta + 0.5} texto="seabottles.org" fondo={C.tinta} tinta={C.lima} tam={W * 0.07} />
            </Linea>
            {(() => {
              const k = interpolate(t, [T15.fin - 0.3, T15.fin - 0.05], [0, 1], {...clamp, easing: io});
              if (k <= 0) return null;
              return (
                <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.hondo} 0%, ${C.hondo2} 100%)`, clipPath: `circle(${k * 120}% at 50% 40%)`}}>
                  <MarDe t={t} s0={T15.fin} dur={T15.escribe} y={0.68} elenco={['ballena', 'gaviota']} fijo />
                  <Linea top={0.16}>
                    <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: g, lineHeight: 1.02, letterSpacing: '-0.025em', color: C.blanco, opacity: k}}>Una red social</div>
                    <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: g * 1.12, lineHeight: 1.05, letterSpacing: '-0.025em', color: C.lima, opacity: k}}>sin likes.</div>
                  </Linea>
                </AbsoluteFill>
              );
            })()}
          </>
        ) : null}

        <Barrido en={T15.escribe} col={C.dorado} />
        <Barrido en={T15.corriente} col={C.lima} />
        <Barrido en={T15.cta} col={C.tinta} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= #16 · Manifiesto =================
export const Manifiesto: React.FC<{musica_archivo?: string}> = ({musica_archivo}) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {W, H, cx} = useCol();
  const t = frame / fps;
  const en = (a: number, b: number) => t >= a && t < b;
  const g = W * 0.118;
  const sh = sacudida(t, [0.75, 1.5, TM.solo, TM.cta]);
  const sombra = `6px 6px 0 ${C.tinta}`;

  // tres golpes: cada línea entra y tacha lo que las otras redes cuentan
  const Golpe: React.FC<{d: number; tachado: string; col: string}> = ({d, tachado, col}) => {
    // las tres líneas ya están en el cuadro 0 (portada y loop); al beat solo se tacha cada palabra
    const raya = interpolate(t, [d + 0.25, d + 0.45], [0, 1], {...clamp, easing: salir});
    const golpe = t >= d + 0.25 ? Math.exp(-(t - d - 0.25) * 9) : 0;
    return (
      <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: g, lineHeight: 1.08, letterSpacing: '-0.025em', color: C.blanco, transform: `scale(${1 + 0.06 * golpe})`, transformOrigin: 'left center', whiteSpace: 'nowrap'}}>
        Sin{' '}
        <span style={{position: 'relative', color: col}}>
          {tachado}
          <span style={{position: 'absolute', left: -6, top: '52%', height: g * 0.12, width: `calc(${raya * 100}% + ${raya * 12}px)`, background: C.coral, borderRadius: 6, transform: 'rotate(-3deg)', opacity: raya > 0 ? 1 : 0}} />
        </span>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: C.hondo, overflow: 'hidden'}}>
      {musica_archivo ? <Audio src={staticFile(musica_archivo)} /> : null}
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        {en(0, TM.solo) ? (
          <>
            <Fondo col={C.hondo} col2={C.hondo2} />
            <MarDe t={t} s0={0} dur={TM.solo} y={0.68} elenco={['medusa', 'gaviota']} fijo />
            <div style={{position: 'absolute', left: W * 0.12, top: H * 0.135, fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.06, color: C.dorado}}>Una red social…</div>
            <div style={{position: 'absolute', left: W * 0.12, top: H * 0.2}}>
              {/* la primera línea ya está en el cuadro 0 */}
              <Golpe d={0} tachado="likes." col={C.lima} />
              <Golpe d={0.75} tachado="seguidores." col={C.vidrio} />
              <Golpe d={1.5} tachado="apuro." col={C.dorado} />
            </div>
          </>
        ) : null}

        {en(TM.solo, TM.corriente) ? (
          <>
            <Fondo col={C.lima} />
            <Linea top={0.2}>
              <Palabra desde={TM.solo} tam={W * 0.17} col={C.tinta}>Solo</Palabra>
              <br />
              <Palabra desde={TM.solo + 0.4} tam={W * 0.17} col={C.lima} resalte={C.tinta}>escribes.</Palabra>
            </Linea>
            {(() => {
              const texto = 'Lo que no le dices a nadie.';
              const vis = Math.floor(interpolate(t, TM.tipeo, [0, texto.length], clamp));
              const p = popEn(frame, fps, TM.solo + 0.75, 12, 180);
              // caja de tamaño fijo (dos renglones): antes era un span en línea y al cortar el renglón
              // «nadie.» quedaba en una caja aparte encimada
              return (
                <Linea top={0.52}>
                  <div style={{display: 'inline-block', width: W * 0.7, minHeight: W * 0.27, textAlign: 'left', fontFamily: fuente.display, fontWeight: 700, fontSize: W * 0.085, lineHeight: 1.15, color: C.tinta, background: C.papel, border: `5px solid ${C.tinta}`, borderRadius: W * 0.03, padding: `${W * 0.03}px ${W * 0.045}px`, boxShadow: `8px 8px 0 ${C.tinta}`, opacity: t > TM.solo + 0.75 ? 1 : 0, transform: `scale(${0.8 + 0.2 * p}) rotate(${-2 + 2 * p}deg)`}}>
                    {texto.slice(0, vis)}
                    {vis < texto.length ? <span style={{color: C.coral, opacity: Math.floor(frame / 6) % 2 ? 1 : 0.2}}>|</span> : null}
                  </div>
                </Linea>
              );
            })()}
          </>
        ) : null}

        {en(TM.corriente, TM.cta) ? (
          <>
            <Fondo col={C.mar1} col2={C.mar2} />
            {(() => {
              const v = interpolate(t, [TM.corriente + 0.1, TM.corriente + 1.0], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1)});
              const x = interpolate(v, [0, 1], [-W * 0.1, cx]);
              const y = H * 0.76 - Math.sin(v * Math.PI) * H * 0.42; // cae en la línea del agua
              const caida = interpolate(t, [TM.corriente + 1.0, TM.corriente + 1.7], [0, 1], clamp);
                            return (
                <>
                  <MarDe t={t} s0={TM.corriente} dur={TM.cta - TM.corriente} y={0.66} elenco={['ballena']} fijo botella botellaDesde={1.0} />
                  {v < 1 ? (
                    <div style={{position: 'absolute', left: x - W * 0.08, top: y - W * 0.19, transform: `rotate(${v * 450}deg)`}}>
                      <BotellaPlana w={W * 0.16} rollo={1} corcho={1} />
                    </div>
                  ) : null}
                  {caida > 0 && caida < 1
                    ? [0, 1, 2].map((k) => {
                        const gg = interpolate(caida, [k * 0.12, 1], [0, 1], {...clamp, easing: salir});
                        return <div key={k} style={{position: 'absolute', left: cx - W * 0.35 * gg, top: H * 0.76 - W * 0.07 * gg, width: W * 0.7 * gg, height: W * 0.14 * gg, borderRadius: '50%', border: `${8 - k * 2}px solid ${C.blanco}`, opacity: 1 - gg}} />;
                      })
                    : null}
                  <Linea top={0.13}>
                    <Palabra desde={TM.corriente + 0.1} tam={W * 0.11} col={C.tinta}>La corriente</Palabra>
                    <br />
                    <Palabra desde={TM.corriente + 1.0} tam={W * 0.13} col={C.lima} resalte={C.tinta}>hace el resto.</Palabra>
                  </Linea>
                </>
              );
            })()}
          </>
        ) : null}

        {en(TM.cta, TM.fin + 1) ? (
          <>
            <Fondo col={C.papel} />
            <MarDe t={t} s0={TM.cta} dur={TM.fin - TM.cta} y={0.68} elenco={['peces', 'velero']} botella />
            <Linea top={0.17}>
              <Palabra desde={TM.cta} tam={W * 0.1} col={C.tinta}>Alguien, lejos,</Palabra>
              <br />
              <Palabra desde={TM.cta + 0.35} tam={W * 0.13} col={C.dorado} resalte={C.tinta}>lo leerá.</Palabra>
            </Linea>
            <Linea top={0.46}>
              <Pastilla desde={TM.cta + 0.8} texto="seabottles.org" fondo={C.tinta} tinta={C.lima} tam={W * 0.07} />
            </Linea>
            {(() => {
              const k = interpolate(t, [TM.fin - 0.3, TM.fin - 0.05], [0, 1], {...clamp, easing: io});
              if (k <= 0) return null;
              // empalme: vuelve exactamente al primer cuadro (las tres líneas sin tachar)
              return (
                <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.hondo} 0%, ${C.hondo2} 100%)`, clipPath: `circle(${k * 120}% at 30% 25%)`}}>
                  <MarDe t={t} s0={TM.fin} dur={TM.solo} y={0.68} elenco={['medusa', 'gaviota']} fijo />
                  <div style={{position: 'absolute', left: W * 0.12, top: H * 0.135, fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.06, color: C.dorado}}>Una red social…</div>
                  <div style={{position: 'absolute', left: W * 0.12, top: H * 0.2}}>
                    {[['likes.', C.lima], ['seguidores.', C.vidrio], ['apuro.', C.dorado]].map(([x, c]) => (
                      <div key={x} style={{fontFamily: fuente.display, fontWeight: 800, fontSize: g, lineHeight: 1.08, letterSpacing: '-0.025em', color: C.blanco, whiteSpace: 'nowrap'}}>
                        Sin <span style={{color: c}}>{x}</span>
                      </div>
                    ))}
                  </div>
                </AbsoluteFill>
              );
            })()}
          </>
        ) : null}

        <Barrido en={TM.solo} col={C.dorado} />
        <Barrido en={TM.corriente} col={C.tinta} />
        <Barrido en={TM.cta} col={C.lima} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const _unused = {spring};
