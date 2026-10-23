import {z} from 'zod';

// Props de una pieza. Cada animación nueva es un JSON en piezas/ con esta forma.
export const esquemaBotellaDelDia = z.object({
  titulo: z.string().default('La botella del día'),
  texto: z.string().describe('El texto de la botella, tal cual lo escribió la persona'),
  mar_clave: z
    .string()
    .default('pensamientos')
    .describe('pensamientos | vida | amor | actualidad | suenos | recuerdos | secretos'),
  mar: z.string().optional().describe('Nombre visible del mar (si no, se deduce de mar_clave)'),
  pais: z.string().optional().describe('País desde donde se lanzó, p. ej. "Argentina"'),
  bandera_codigo: z
    .string()
    .optional()
    .describe('Código ISO de 2 letras en minúscula (ar, es, mx…) para la bandera'),
  origen: z.string().optional().describe('Línea de origen; si no, se arma con el país'),
  semilla: z.string().optional().describe('Semilla de variación (fecha + id). Si no, el texto'),
  variante: z
    .enum(['auto', 'faro', 'gaviotas', 'barquito', 'peces', 'noche'])
    .default('auto')
    .describe('Composición de la escena; auto = la elige la semilla'),
  deco: z
    .object({
      etiqueta: z.string().optional(),
      cordel: z.string().optional(),
      sello: z.string().optional(),
      tapa: z.string().optional(),
    })
    .optional()
    .describe('Decoración elegida por quien lanzó la botella (campo deco de la base)'),
  musica: z.boolean().default(true).describe('Incluir música ambiente en el MP4'),
  musica_archivo: z
    .string()
    .optional()
    .describe('Ruta en public/ de la música de esta pieza (la genera musica.mjs); si falta, audio/musica.m4a'),
  respuesta: z
    .object({
      texto: z.string(),
      pais: z.string().optional(),
      bandera_codigo: z.string().optional(),
    })
    .optional()
    .describe('Respuesta ILUSTRATIVA escrita por Claude (nunca una real, que es privada); pais = el de quien respondió de verdad, si hubo'),
  clima: z.enum(['despejado', 'lluvia', 'niebla']).default('despejado'),
  momento: z.enum(['dia', 'amanecer', 'atardecer', 'noche']).optional(),
  cierre: z.string().default('seabottles.org'),
  frase_cierre: z
    .string()
    .optional()
    .describe('Frase del cierre; si falta, rota entre las de la casa según la semilla'),
});

export type PropsBotellaDelDia = z.infer<typeof esquemaBotellaDelDia>;

export const FPS = 30;
export const DURACION_SEG = 12; // solo como valor inicial; la duración real sale de tiempos()
