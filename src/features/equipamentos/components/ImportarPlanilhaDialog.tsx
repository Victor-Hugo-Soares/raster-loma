import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useCriarEquipamentosEmMassa } from '../hooks/useEquipamentoMutations'

interface LinhaImportada {
  imei: string
  numero_linha: string | null
}

interface ImportarPlanilhaDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

function normalizarColuna(col: string) {
  return col.toLowerCase().trim().replace(/\s+/g, '_')
}

function encontrarColuna(headers: string[], candidatos: string[]): string | undefined {
  const norm = headers.map(normalizarColuna)
  for (const c of candidatos) {
    const idx = norm.findIndex((h) => h.includes(c))
    if (idx !== -1) return headers[idx]
  }
  return undefined
}

export default function ImportarPlanilhaDialog({ open, onOpenChange }: ImportarPlanilhaDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [linhas, setLinhas] = useState<LinhaImportada[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const importar = useCriarEquipamentosEmMassa()

  function resetar() {
    setLinhas([])
    setErro(null)
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function processarArquivo(file: File) {
    setErro(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (rows.length === 0) {
          setErro('Planilha vazia ou sem dados.')
          return
        }

        const headers = Object.keys(rows[0])
        const imeiCol = encontrarColuna(headers, ['imei'])
        const linhaCol = encontrarColuna(headers, ['linha', 'numero_linha', 'numero', 'chip', 'sim'])

        if (!imeiCol) {
          setErro('Coluna IMEI não encontrada. Certifique-se que a planilha tem uma coluna "IMEI".')
          return
        }

        const resultado: LinhaImportada[] = rows
          .map((row) => ({
            imei: String(row[imeiCol]).trim(),
            numero_linha: linhaCol ? String(row[linhaCol]).trim() || null : null,
          }))
          .filter((r) => r.imei && r.imei !== 'undefined')

        if (resultado.length === 0) {
          setErro('Nenhum IMEI válido encontrado na planilha.')
          return
        }

        setLinhas(resultado)
      } catch {
        setErro('Erro ao ler o arquivo. Verifique se é um arquivo Excel (.xlsx) ou CSV válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processarArquivo(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processarArquivo(file)
  }

  async function confirmar() {
    await importar.mutateAsync(
      linhas.map((l) => ({ imei: l.imei, numero_linha: l.numero_linha, modelo: 'N4P' }))
    )
    resetar()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetar(); onOpenChange(o) }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar equipamentos via planilha</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A planilha deve ter pelo menos uma coluna <span className="font-mono text-foreground">IMEI</span>.
            A coluna <span className="font-mono text-foreground">LINHA</span> é opcional.
          </p>

          {/* Drop zone */}
          {!fileName && (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-10 transition-colors hover:border-primary/60 hover:bg-accent/30"
            >
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Clique ou arraste o arquivo aqui</p>
                <p className="mt-0.5 text-xs text-muted-foreground">.xlsx, .xls ou .csv</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {erro}
            </div>
          )}

          {/* Preview */}
          {linhas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-muted-foreground">— {linhas.length} equipamento(s) encontrado(s)</span>
                </div>
                <button onClick={resetar} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">IMEI</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Linha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {linhas.slice(0, 50).map((l, i) => (
                      <tr key={i} className="hover:bg-accent/30">
                        <td className="px-3 py-1.5 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{l.imei}</td>
                        <td className="px-3 py-1.5 text-xs">{l.numero_linha ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {linhas.length > 50 && (
                  <p className="px-3 py-2 text-center text-xs text-muted-foreground">
                    + {linhas.length - 50} não exibidos
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetar(); onOpenChange(false) }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmar}
            disabled={linhas.length === 0 || importar.isPending}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {importar.isPending ? 'Importando...' : `Importar ${linhas.length > 0 ? linhas.length : ''} equipamentos`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
