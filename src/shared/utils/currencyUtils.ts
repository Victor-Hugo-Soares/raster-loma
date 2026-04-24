export function formatarMoeda(valor: number | null): string {
  if (valor === null || valor === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function parseMoeda(valor: string): number {
  return parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0
}
