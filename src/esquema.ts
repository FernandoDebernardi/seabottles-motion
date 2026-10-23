import {z} from 'zod';

// Props de una pieza. Cada animación nueva es un JSON en piezas/ con esta forma.
export const esquemaBotellaDelDia = z.object({
  titulo: z.string().default('La botella del día'),
  texto: z.string().describe('El texto de la botella, tal cual lo escribió la persona'),
  mar: z.string().optional().describe('Mar al que fue lanzada, p. ej. "Mar de los recuerdos"'),
  origen: z.string().optional().describe('Dato breve, p. ej. "Llegó desde Uruguay"'),
  momento: z.enum(['dia', 'amanecer', 'atardecer', 'noche']).default('atardecer'),
  cierre: z.string().default('seabottles.org'),
  subcierre: z.string().default('Mensajes en una botella para desconocidos'),
  capas: z
    .object({
      botella: z.string().default('capas/botella.png'),
      olas: z.string().default('capas/olas.png'),
    })
    .default({botella: 'capas/botella.png', olas: 'capas/olas.png'}),
});

export type PropsBotellaDelDia = z.infer<typeof esquemaBotellaDelDia>;

export const FPS = 30;
export const DURACION_SEG = 12;
