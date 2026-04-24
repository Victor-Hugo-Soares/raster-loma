import type { NivelAlerta } from '@/types/domain.types'

export function calcularNivelAlerta(diasPendente: number): NivelAlerta | null {
  if (diasPendente >= 15) return 'critico'
  if (diasPendente >= 10) return 'vermelho'
  if (diasPendente >= 7) return 'laranja'
  if (diasPendente >= 5) return 'amarelo'
  return null
}

export const CORES_ALERTA: Record<NivelAlerta, string> = {
  amarelo: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  laranja: 'bg-orange-100 text-orange-800 border-orange-300',
  vermelho: 'bg-red-100 text-red-800 border-red-300',
  critico: 'bg-red-600 text-white border-red-700',
}

export const LABELS_ALERTA: Record<NivelAlerta, string> = {
  amarelo: 'Atenção',
  laranja: 'Atrasado',
  vermelho: 'Crítico',
  critico: 'CRÍTICO',
}
