import { useMemo } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { calcularNivelAlerta } from '@/shared/utils/alertUtils'
import type { NivelAlerta } from '@/types/domain.types'

export function useDiasPendente(dataOs: string, status: string) {
  return useMemo(() => {
    const PENDENTES = ['pendente', 'aguardando_instalacao', 'enviar_equipamento', 'rastreador_enviado']
    if (!PENDENTES.includes(status)) return { diasPendente: null, nivelAlerta: null }
    const dias = differenceInDays(new Date(), parseISO(dataOs))
    const nivel: NivelAlerta | null = calcularNivelAlerta(dias)
    return { diasPendente: dias, nivelAlerta: nivel }
  }, [dataOs, status])
}
