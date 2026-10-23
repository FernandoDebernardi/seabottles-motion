import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Escenario, Variante} from './escenas/Escenario';
import {Mensaje} from './escenas/Mensaje';
import {Cierre} from './escenas/Cierre';
import {PropsBotellaDelDia} from './esquema';
import {asegurarFuentes} from './fuentes';
import {normalizarMar, PALETAS} from './paletas';
import {crearAzar, tiempos} from './semilla';
import {bezierCalmo, fuente} from './tema';

const VARIANTES_DIA: Variante[] = ['faro', 'gaviotas', 'barquito', 'peces'];
const VARIANTES_NOCHE: Variante[] = ['noche', 'faro', 'peces'];

// Resuelve todo lo que depende de la pieza (paleta, variante, tiempos) — lo usa también Root para la duración
export const resolver = (p: PropsBotellaDelDia, fps: number) => {
  const clave = normalizarMar(p.mar_clave);
  const paleta = PALETAS[clave];
  const semilla = p.semilla || p.texto;
  const az = crearAzar(semilla + ':variante');
  const variante: Variante =
    p.variante && p.variante !== 'auto' ? p.variante : az.elegir(paleta.noche ? VARIANTES_NOCHE : VARIANTES_DIA);
  const T = tiempos(p.texto, fps);
  return {paleta, variante, semilla, T, mar: p.mar || paleta.nombre};
};

export const BotellaDelDia: React.FC<PropsBotellaDelDia> = (p) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const vertical = height > width;
  const {paleta, variante, semilla, T, mar} = React.useMemo(() => resolver(p, fps), [p, fps]);

  const haciaAbajo = interpolate(
    frame,
    [T.tarjetaIn - fps * 0.4, T.tarjetaIn + fps * 0.8, T.cierreIn, T.cierreIn + fps],
    [0, 1, 1, 0.85],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...bezierCalmo)},
  );

  // Título de apertura (texto en pantalla desde el primer segundo: tema + país)
  const tituloIn = spring({frame: frame - fps * 0.5, fps, config: {damping: 200, stiffness: 70}});
  const tituloOut = interpolate(frame, [T.cierreIn - fps * 0.3, T.cierreIn + fps * 0.3], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // la línea «desde <país>» del título se retira cuando aparece la tarjeta (ahí ya va la bandera)
  const paisArriba = interpolate(frame, [T.tarjetaIn, T.tarjetaIn + fps * 0.5], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bandera = p.bandera_codigo ? staticFile(`banderas/${p.bandera_codigo}.svg`) : null;
  const origen = p.origen || (p.pais ? `Lanzada desde ${p.pais}` : 'Lanzada desde algún lugar del mundo');

  return (
    <AbsoluteFill>
      {p.musica ? <Audio src={staticFile('audio/mar.m4a')} loop volume={0.55} /> : null}
      <Escenario
        paleta={paleta}
        variante={variante}
        semilla={semilla}
        deco={p.deco}
        banderaCodigo={p.bandera_codigo}
        haciaAbajo={haciaAbajo}
        cierreIn={T.cierreIn}
      />

      {/* título superior */}
      <div
        style={{
          position: 'absolute',
          top: vertical ? height * 0.075 : height * 0.06,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: width * 0.012,
          opacity: tituloIn * tituloOut,
          transform: `translateY(${(1 - tituloIn) * 16}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fuente.display,
            fontWeight: 800,
            fontSize: vertical ? width * 0.05 : width * 0.04,
            letterSpacing: '-0.005em',
            color: paleta.tinta,
            textShadow: paleta.noche ? '0 2px 18px rgba(0,0,0,0.35)' : '0 2px 18px rgba(255,255,255,0.5)',
          }}
        >
          {p.titulo}
        </div>
        {p.pais ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: width * 0.014,
              fontFamily: fuente.cuerpo,
              fontWeight: 600,
              fontSize: vertical ? width * 0.03 : width * 0.024,
              color: paleta.tinta,
              opacity: 0.9 * paisArriba,
            }}
          >
            {bandera ? (
              <Img
                src={bandera}
                style={{width: width * 0.05, height: width * 0.0375, borderRadius: width * 0.007, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'}}
              />
            ) : null}
            <span>desde {p.pais}</span>
          </div>
        ) : null}
      </div>

      <Mensaje
        texto={p.texto}
        mar={mar}
        pais={p.pais}
        banderaCodigo={p.bandera_codigo}
        origen={origen}
        acento={paleta.noche ? '#6d7a68' : paleta.acento}
        desde={T.tarjetaIn}
        revelado={T.revelado}
        hasta={T.tarjetaOut}
      />

      <Cierre cierre={p.cierre} subcierre={p.subcierre} desde={T.cierreIn} oscuro={paleta.noche} acento={paleta.acento} />
    </AbsoluteFill>
  );
};
