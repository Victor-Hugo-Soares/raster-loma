import { AlertTriangle, Clock, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NivelAlerta } from '@/types/domain.types'

const CONFIG: Record<NivelAlerta, { label: string; className: string; icon: React.ElementType }> = {
  amarelo: { label: 'Atenção', className: 'alert-amarelo', icon: Clock },
  laranja: { label: 'Atrasado', className: 'alert-laranja', icon: AlertTriangle },
  vermelho: { label: 'Crítico', className: 'alert-vermelho', icon: AlertTriangle },
  critico: { label: 'CRÍTICO', className: 'alert-critico', icon: Flame },
}

interface AlertaBadgeProps {
  nivel: NivelAlerta
  dias?: number | null
  className?: string
  compact?: boolean
}

export default function AlertaBadge({ nivel, dias, className, compact = false }: AlertaBadgeProps) {
  const config = CONFIG[nivel]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        config.className,
        nivel === 'critico' && 'animate-pulse',
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {!compact && <span>{config.label}</span>}
      {dias != null && (
        <span className="font-mono font-semibold">
          {dias}d
        </span>
      )}
    </span>
  )
}
