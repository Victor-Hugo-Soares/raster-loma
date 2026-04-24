import { cn } from '@/lib/utils'
import type { StatusInstalacao } from '@/types/domain.types'

const STATUS_CONFIG: Record<StatusInstalacao, { label: string; className: string }> = {
  pendente:             { label: 'PENDENTE',          className: 'bg-zinc-600/15 text-zinc-300 border-zinc-500/40' },
  agendado:             { label: 'AGENDADO',          className: 'bg-sky-700/15 text-sky-300 border-sky-600/40' },
  aguardando_instalacao:{ label: 'AGUARDANDO',        className: 'bg-blue-700/15 text-blue-300 border-blue-600/40' },
  enviar_equipamento:   { label: 'ENVIAR EQUIP.',     className: 'bg-amber-700/15 text-amber-300 border-amber-600/40' },
  rastreador_enviado:   { label: 'RASTREADOR ENV.',   className: 'bg-violet-700/15 text-violet-300 border-violet-600/40' },
  instalado_sem_acesso: { label: 'SEM ACESSO APP',    className: 'bg-yellow-700/15 text-yellow-300 border-yellow-600/40' },
  instalado_ok:         { label: 'INSTALADO OK',      className: 'bg-emerald-700/15 text-emerald-300 border-emerald-600/40' },
  pago:                 { label: 'PAGO',              className: 'bg-teal-700/15 text-teal-300 border-teal-600/40' },
}

interface StatusBadgeProps {
  status: StatusInstalacao
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.toUpperCase(),
    className: 'bg-zinc-600/15 text-zinc-300 border-zinc-500/40',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold tracking-widest',
        config.className,
        className
      )}
      style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
    >
      {config.label}
    </span>
  )
}
