import { z } from 'zod'

export const cicloSchema = z.object({
  ciclo: z.enum(['dia_10', 'dia_20']),
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2020).max(2100),
  data_fechamento: z.string().min(1, 'Data obrigatória'),
})

export type CicloFormData = z.infer<typeof cicloSchema>
