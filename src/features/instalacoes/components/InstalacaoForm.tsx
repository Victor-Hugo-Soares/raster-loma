import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { instalacaoSchema, type InstalacaoFormData } from '../schemas/instalacao.schema'
import { useCriarInstalacao, useAtualizarInstalacao } from '../hooks/useInstalacaoMutations'
import { listarTecnicos } from '@/infra/supabase/repositories/tecnicos.repository'
import type { InstalacaoComAtraso } from '@/types/domain.types'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { ClipboardCopy, Check } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface InstalacaoFormProps {
  instalacao?: InstalacaoComAtraso
  onSuccess?: () => void
}

const TIPO_SERVICO_LABEL: Record<string, string> = {
  instalacao: 'Instalação',
  substituicao: 'Substituição',
  instalacao_vistoria: 'Instalação + Vistoria',
  vistoria: 'Vistoria',
  retirada: 'Retirada',
  manutencao: 'Manutenção',
}

export default function InstalacaoForm({ instalacao, onSuccess }: InstalacaoFormProps) {
  const isEdit = !!instalacao
  const criar = useCriarInstalacao()
  const atualizar = useAtualizarInstalacao()
  const [copied, setCopied] = useState(false)

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos', 'ativos'],
    queryFn: () => listarTecnicos(true),
  })

  const form = useForm<InstalacaoFormData>({
    resolver: zodResolver(instalacaoSchema),
    defaultValues: {
      nome_cliente: instalacao?.nome_cliente ?? '',
      telefone_cliente: instalacao?.telefone_cliente ?? null,
      endereco_cliente: instalacao?.endereco_cliente ?? null,
      placa: instalacao?.placa ?? '',
      card_externo: instalacao?.card_externo ?? null,
      modelo_veiculo: instalacao?.modelo_veiculo ?? null,
      responsavel: instalacao?.responsavel ?? null,
      data_os: instalacao?.data_os ?? null,
      tipo_servico: (instalacao?.tipo_servico as InstalacaoFormData['tipo_servico']) ?? 'instalacao',
      status: (instalacao?.status as InstalacaoFormData['status']) ?? 'pendente',
      tecnico_id: instalacao?.tecnico_id ?? null,
      data_envio: instalacao?.data_envio ?? null,
      imei: instalacao?.imei ?? null,
      codigo_rastreio: instalacao?.codigo_rastreio ?? null,
      data_instalacao: instalacao?.data_instalacao ?? null,
      local_instalacao: instalacao?.local_instalacao ?? null,
      custo_km: instalacao?.custo_km ?? null,
      custo_instalacao: instalacao?.custo_instalacao ?? null,
      custo_pedagio: instalacao?.custo_pedagio ?? null,
      observacoes: instalacao?.observacoes ?? null,
      prioridade: instalacao?.prioridade ?? false,
      diluido: instalacao?.diluido ?? false,
    },
  })

  const tecnicoId = useWatch({ control: form.control, name: 'tecnico_id' })
  const currentStatus = useWatch({ control: form.control, name: 'status' })

  // Create mode: auto-adjust status when tech is added or removed
  useEffect(() => {
    if (isEdit) return
    if (!tecnicoId) {
      form.setValue('status', 'pendente')
    } else if (currentStatus === 'pendente') {
      form.setValue('status', 'aguardando_instalacao')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tecnicoId, isEdit])

  // Sections visible in edit mode based on current status
  const showEnvioSection = ['enviar_equipamento', 'rastreador_enviado'].includes(currentStatus ?? '')
  const showInstalacaoSection = ['instalado_sem_acesso', 'instalado_ok', 'pago'].includes(currentStatus ?? '')

  async function onSubmit(data: InstalacaoFormData) {
    if (isEdit && instalacao) {
      await atualizar.mutateAsync({ id: instalacao.id, dados: data })
    } else {
      await criar.mutateAsync(data)
    }
    onSuccess?.()
  }

  const isPending = criar.isPending || atualizar.isPending

  function copiarOS() {
    const values = form.getValues()
    const tipo = TIPO_SERVICO_LABEL[values.tipo_servico] ?? values.tipo_servico
    const placa = values.placa ?? instalacao?.placa ?? ''
    const modelo = values.modelo_veiculo || instalacao?.modelo_veiculo || ''
    const placaModelo = modelo ? `${placa} / ${modelo}` : placa

    const os = [
      `Associado: ${values.nome_cliente || instalacao?.nome_cliente || ''}`,
      `Tel: ${values.telefone_cliente || ''}`,
      `Endereço: ${values.endereco_cliente || ''}`,
      `Placa e modelo: ${placaModelo}`,
      `Serviço: ${tipo}`,
    ].join('\n')

    navigator.clipboard.writeText(os).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Dados básicos ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="nome_cliente"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nome do cliente *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo ou razão social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do associado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endereco_cliente"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Endereço do associado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Rua, número, bairro, cidade - UF"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ABC1D23"
                    className="font-mono uppercase"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelo_veiculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo do veículo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: HB20 2022" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="card_externo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card externo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MZ6VWTAA"
                    className="font-mono"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Executivo / Vendedor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do responsável" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_os"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data OS</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo_servico"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tipo de serviço</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="instalacao">Instalação</SelectItem>
                    <SelectItem value="substituicao">Substituição</SelectItem>
                    <SelectItem value="instalacao_vistoria">Instalação + Vistoria</SelectItem>
                    <SelectItem value="vistoria">Vistoria</SelectItem>
                    <SelectItem value="retirada">Retirada</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* ── Técnico e status ─────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Técnico
          </p>

          <FormField
            control={form.control}
            name="tecnico_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Técnico responsável</FormLabel>
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar técnico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sem técnico (pendente)</SelectItem>
                    {tecnicos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                        {t.regiao ? ` · ${t.regiao}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status: sempre visível no edit, ou quando técnico selecionado no create */}
          {(isEdit || !!tecnicoId) && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isEdit && <SelectItem value="pendente">Pendente</SelectItem>}
                      <SelectItem value="aguardando_instalacao">Aguardando instalação</SelectItem>
                      <SelectItem value="enviar_equipamento">Enviar equipamento (remoto)</SelectItem>
                      <SelectItem value="rastreador_enviado">Rastreador enviado</SelectItem>
                      {isEdit && (
                        <>
                          <SelectItem value="instalado_sem_acesso">Instalado (sem acesso APP)</SelectItem>
                          <SelectItem value="instalado_ok">Instalado OK</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* ── Envio de equipamento (remoto) ────────────────────────── */}
        {showEnvioSection && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Envio de equipamento
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data_envio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de envio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imei"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMEI do equipamento</FormLabel>
                      <FormControl>
                        <Input
                          className="font-mono"
                          placeholder="000000000000000"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codigo_rastreio"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Código de rastreio</FormLabel>
                      <FormControl>
                        <Input
                          className="font-mono"
                          placeholder="BR123456789BR"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Dados de instalação (instalado_*) ────────────────────── */}
        {showInstalacaoSection && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Instalação
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data_instalacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de instalação</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="local_instalacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local de instalação</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: painel dianteiro"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imei"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>IMEI</FormLabel>
                      <FormControl>
                        <Input
                          className="font-mono"
                          placeholder="000000000000000"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Custos (somente edit) ─────────────────────────────────── */}
        {isEdit && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Custos
              </p>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="custo_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Km (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custo_instalacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instalação (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custo_pedagio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pedágio (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="diluido"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-md border border-border p-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">Custo diluído</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <Separator />

        {/* ── Extra ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informações adicionais..."
                    rows={2}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 rounded-md border border-border p-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Marcar como prioridade</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-2 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={copiarOS}
          >
            {copied
              ? <><Check className="h-4 w-4 text-emerald-400" /> Copiado!</>
              : <><ClipboardCopy className="h-4 w-4" /> Copiar O.S.</>
            }
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar instalação'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
