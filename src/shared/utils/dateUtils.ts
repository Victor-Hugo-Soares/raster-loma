import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarData(data: string | null): string {
  if (!data) return '—'
  try {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return data
  }
}

export function calcularDiasPendente(dataOs: string): number {
  return differenceInDays(new Date(), parseISO(dataOs))
}

export function formatarDataHora(data: string | null): string {
  if (!data) return '—'
  try {
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return data
  }
}
