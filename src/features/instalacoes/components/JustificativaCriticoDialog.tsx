import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface JustificativaCriticoDialogProps {
  open: boolean
  diasAtraso: number | null
  onConfirm: (justificativa: string) => void
  onCancel: () => void
  isPending?: boolean
}

const MIN_CHARS = 10

export default function JustificativaCriticoDialog({
  open,
  diasAtraso,
  onConfirm,
  onCancel,
  isPending = false,
}: JustificativaCriticoDialogProps) {
  const [texto, setTexto] = useState('')
  const valido = texto.trim().length >= MIN_CHARS

  function handleConfirm() {
    if (!valido) return
    onConfirm(texto.trim())
    setTexto('')
  }

  function handleCancel() {
    setTexto('')
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <DialogTitle>Instalação em status crítico</DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            Esta instalação está pendente há{' '}
            <span className="font-semibold text-red-400">{diasAtraso ?? '15+'} dias</span>.
            Para alterar o status, registre uma justificativa obrigatória.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="justificativa">
            Justificativa <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="justificativa"
            placeholder="Ex: Técnico aguardando peça de reposição, reagendado para 05/05..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            className="resize-none"
            autoFocus
          />
          <p className="text-xs text-muted-foreground text-right">
            {texto.trim().length}/{MIN_CHARS} caracteres mínimos
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!valido || isPending}>
            {isPending ? 'Salvando...' : 'Confirmar e alterar status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
