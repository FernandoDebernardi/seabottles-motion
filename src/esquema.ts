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
    .enum(['auto', 'faro', 'gaviotas', 'barquito', 'cartero', 'luna'])
    .default('auto')
    .describe('Composición de la escena; auto = la elige la semilla'),
  momento: z.enum(['dia', 'amanecer', 'atardecer', 'noche']).optional(),
  cierre: z.string().default('seabottles.org'),
  subcierre: z.string().default('Escribe lo que sientes. Alguien, en otro país, lo leerá.'),
  capas: z
    .object({
      botella: z.string().default('capas/botella.png'),
      olas: z.string().default('capas/olas.png'),
    })
    .default({botella: 'capas/botella.png', olas: 'capas/olas.png'}),
});

export type PropsBotellaDelDia = z.infer<typeof esquemaBotellaDelDia>;

export const FPS = 30;
export const DURACION_SEG = 12; // solo como valor inicial; la duración real sale de tiempos()
