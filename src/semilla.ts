// Generador determinista a partir de una semilla (fecha + id de botella):
// la misma pieza siempre rinde igual, y cada día sale distinta.
export const crearAzar = (semilla: string) => {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i++) {
    h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let estado = h >>> 0;
  const siguiente = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    numero: siguiente,
    entre: (a: number, b: number) => a + siguiente() * (b - a),
    elegir: <T,>(arr: readonly T[]): T => arr[Math.floor(siguiente() * arr.length)],
    mezclar: <T,>(arr: readonly T[]): T[] => {
      const copia = [...arr];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(siguiente() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    },
  };
};

// Tiempos para TikTok (informe del 1/11/2026): la primera frase ya se lee en el cuadro 0, el resto
// aparece a ~4,5 palabras por segundo, la lectura quieta es más corta y el total queda en 12–25 s.
export const primeraFrase = (texto: string) => {
  const ws = texto.replace(/\s+/g, ' ').trim().split(' ');
  let n = 0;
  for (let i = 0; i < ws.length; i++) {
    n = i + 1;
    if (/[.?!…]$/.test(ws[i]) || n >= 12) break;
  }
  return Math.min(n, ws.length);
};
export const tiemposTikTok = (texto: string, fps: number, respuesta?: string) => {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  const chars = limpio.length;
  const n0 = primeraFrase(limpio);
  const resto = limpio.split(' ').slice(n0).join(' ').length;
  const revelado = Math.max(0.6, resto / 25);
  const lectura = Math.min(7, Math.max(2.5, chars / 20 + 0.8));
  const rChars = respuesta ? respuesta.replace(/\s+/g, ' ').trim().length : 0;
  const rRevelado = rChars ? Math.min(2.5, Math.max(0.8, rChars / 35)) : 0;
  const rLectura = rChars ? Math.max(2, rChars / 20) + 0.6 : 0;
  const s = (x: number) => Math.round(x * fps);
  const tarjetaOut = 0.25 + revelado + lectura;
  const respuestaIn = tarjetaOut + 0.4;
  const respuestaOut = rChars ? respuestaIn + 1.0 + rRevelado + rLectura : tarjetaOut;
  const cierreIn = respuestaOut + 0.4;
  const total = cierreIn + 2.6;
  return {
    apertura: 0, tarjetaIn: 0, revelado: s(revelado), tarjetaOut: s(tarjetaOut), respuestaIn: s(respuestaIn),
    respuestaRevelado: s(rRevelado), respuestaOut: s(respuestaOut), cierreIn: s(cierreIn), total: s(total), segundos: total, inicialVisibles: n0,
  };
};

// Tiempos de lectura (segundos). Fer, 23/10/2026: a 11 letras por segundo la tarjeta
// se quedaba quieta 20 s antes de la respuesta; ahora ~17 letras por segundo (lectura
// normal en pantalla) y la lectura quieta nunca pasa de 11 s: quien quiere releer, pausa.
export const tiempos = (texto: string, fps: number, respuesta?: string) => {
  const chars = texto.replace(/\s+/g, ' ').trim().length;
  // Fer, 26/10/2026: con 2,4 s de botella sola, 8 de cada 10 personas pasaban de largo antes
  // de los 3 segundos. Ahora la tarjeta entra casi enseguida y la primera palabra se lee antes
  // del primer segundo; el título ya está en pantalla desde el primer cuadro.
  const apertura = 0.5;
  const revelado = Math.min(4, Math.max(1.4, chars / 40)); // el texto aparece por palabras
  const lectura = Math.min(11, Math.max(3, chars / 17 + 1)); // tiempo quieto para leer
  const rChars = respuesta ? respuesta.replace(/\s+/g, ' ').trim().length : 0;
  const rRevelado = rChars ? Math.min(3, Math.max(1, rChars / 40)) : 0;
  const rLectura = rChars ? Math.max(2.2, rChars / 17 + 0.8) + 1.2 : 0; // + el viaje que se dibuja
  const cierre = 3.0;
  const s = (x: number) => Math.round(x * fps);
  const tarjetaOut = apertura + revelado + lectura;
  const respuestaIn = tarjetaOut + 0.5;
  const respuestaOut = rChars ? respuestaIn + rRevelado + rLectura : tarjetaOut;
  const cierreIn = respuestaOut + 0.6;
  const total = cierreIn + cierre;
  return {
    apertura: s(apertura),
    tarjetaIn: s(apertura),
    revelado: s(revelado),
    tarjetaOut: s(tarjetaOut),
    respuestaIn: s(respuestaIn),
    respuestaRevelado: s(rRevelado),
    respuestaOut: s(respuestaOut),
    cierreIn: s(cierreIn),
    total: s(total),
    segundos: total,
  };
};
