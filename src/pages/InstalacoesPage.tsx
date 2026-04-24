import { Wrench } from 'lucide-react'
import InstalacoesList from '@/features/instalacoes/components/InstalacoesList'
import { useRealtimeInstalacoes } from '@/shared/hooks/useRealtime'

export default function InstalacoesPage() {
  useRealtimeInstalacoes()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-bold">Instalações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as ordens de serviço
          </p>
        </div>
      </div>
      <InstalacoesList />
    </div>
  )
}
