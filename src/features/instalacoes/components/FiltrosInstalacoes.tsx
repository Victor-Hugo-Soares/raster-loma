import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { listarTecnicos } from '@/infra/supabase/repositories/tecnicos.repository'
import type { FiltrosInstalacao } from '@/infra/supabase/repositories/instalacoes.repository'

interface FiltrosInstalacoesProps {
  filtros: FiltrosInstalacao
  onChange: (f: FiltrosInstalacao) => void
}

export default function FiltrosInstalacoes({ filtros, onChange }: FiltrosInstalacoesProps) {
  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos', 'ativos'],
    queryFn: () => listarTecnicos(true),
  })

  const hasFilters =
    filtros.busca || filtros.status || filtros.tecnico_id || filtros.nivel_alerta

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Busca */}
      <div className="relative min-w-[240px]">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente, placa, card..."
          className="pl-8 h-8 text-xs"
          value={filtros.busca ?? ''}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value || undefined, page: 0 })}
        />
      </div>

      {/* Status */}
      <Select
        value={filtros.status ?? 'todos'}
        onValueChange={(v) =>
          onChange({ ...filtros, status: v === 'todos' ? undefined : (v as FiltrosInstalacao['status']), page: 0 })
        }
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="aguardando_instalacao">Aguardando instalação</SelectItem>
          <SelectItem value="enviar_equipamento">Enviar equipamento</SelectItem>
          <SelectItem value="rastreador_enviado">Rastreador enviado</SelectItem>
          <SelectItem value="instalado_sem_acesso">Sem acesso APP</SelectItem>
          <SelectItem value="instalado_ok">Instalado OK</SelectItem>
          <SelectItem value="pago">Pago</SelectItem>
        </SelectContent>
      </Select>

      {/* Nível de alerta */}
      <Select
        value={filtros.nivel_alerta ?? 'todos'}
        onValueChange={(v) =>
          onChange({ ...filtros, nivel_alerta: v === 'todos' ? undefined : v, page: 0 })
        }
      >
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue placeholder="Alerta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os alertas</SelectItem>
          <SelectItem value="amarelo">⚠ Atenção (5d+)</SelectItem>
          <SelectItem value="laranja">🟠 Atrasado (7d+)</SelectItem>
          <SelectItem value="vermelho">🔴 Crítico (10d+)</SelectItem>
          <SelectItem value="critico">🔥 CRÍTICO (15d+)</SelectItem>
        </SelectContent>
      </Select>

      {/* Técnico */}
      <Select
        value={filtros.tecnico_id ?? 'todos'}
        onValueChange={(v) =>
          onChange({ ...filtros, tecnico_id: v === 'todos' ? undefined : v, page: 0 })
        }
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Técnico" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os técnicos</SelectItem>
          {tecnicos.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Limpar filtros */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => onChange({ page: 0 })}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  )
}
