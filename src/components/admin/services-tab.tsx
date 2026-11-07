'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Scissors, Plus, Pencil, Loader2, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api, SectionTitle, PlaceholderWarn } from './ui'
import { formatBRL } from '@/lib/format'
import { minToHHMM, formatDuration } from '@/lib/time'
import { cn } from '@/lib/utils'

type Service = {
  id: string
  name: string
  description: string
  durationMin: number
  priceOnConsult: boolean
  basePrice: number
  smallPrice: number | null
  mediumPrice: number | null
  largePrice: number | null
  catPrice: number | null
  species: string
  imageUrl: string | null
  active: boolean
  isExample: boolean
  sortOrder: number
}

type FormState = {
  name: string
  description: string
  durationMin: string
  priceOnConsult: boolean
  basePrice: string
  smallPrice: string
  mediumPrice: string
  largePrice: string
  catPrice: string
  species: string
  imageUrl: string
  active: boolean
}

const EMPTY: FormState = {
  name: '',
  description: '',
  durationMin: '60',
  priceOnConsult: false,
  basePrice: '',
  smallPrice: '',
  mediumPrice: '',
  largePrice: '',
  catPrice: '',
  species: 'AMBOS',
  imageUrl: '',
  active: true,
}

function money(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

function ImageUploader({
  url,
  onChange,
  label,
}: {
  url: string
  onChange: (url: string) => void
  label: string
}) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro no upload')
      onChange(data.url)
      toast({ title: 'Imagem enviada!' })
    } catch (err) {
      toast({
        title: 'Falha no upload',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
          {url ? (
            <img src={url} alt="Pré-visualização" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-slate-300">
              <ImagePlusIcon />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="cursor-pointer">
            <span className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Enviando…
                </>
              ) : (
                'Escolher imagem'
              )}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) upload(f)
                e.target.value = ''
              }}
            />
          </label>
          {url && (
            <button
              type="button"
              className="text-left text-xs font-bold text-red-500 hover:underline"
              onClick={() => onChange('')}
            >
              Remover imagem
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ImagePlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

export function ServicesTab() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const load = useCallback(() => {
    api<{ services: Service[] }>('/api/admin/services')
      .then((d) => setServices(d.services))
      .catch(() => setServices([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setDialogOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description,
      durationMin: String(s.durationMin),
      priceOnConsult: s.priceOnConsult,
      basePrice: s.basePrice ? String(s.basePrice) : '',
      smallPrice: s.smallPrice != null ? String(s.smallPrice) : '',
      mediumPrice: s.mediumPrice != null ? String(s.mediumPrice) : '',
      largePrice: s.largePrice != null ? String(s.largePrice) : '',
      catPrice: s.catPrice != null ? String(s.catPrice) : '',
      species: s.species,
      imageUrl: s.imageUrl || '',
      active: s.active,
    })
    setDialogOpen(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        durationMin: Number(form.durationMin),
        priceOnConsult: form.priceOnConsult,
        basePrice: money(form.basePrice) ?? 0,
        smallPrice: money(form.smallPrice),
        mediumPrice: money(form.mediumPrice),
        largePrice: money(form.largePrice),
        catPrice: money(form.catPrice),
        species: form.species,
        imageUrl: form.imageUrl || null,
        active: form.active,
      }
      if (editing) {
        await api(`/api/admin/services/${editing.id}`, { method: 'PATCH', json: payload })
        toast({ title: 'Serviço atualizado!', description: 'As alterações já estão no site.' })
      } else {
        await api('/api/admin/services', { json: payload })
        toast({ title: 'Serviço criado!', description: 'Ele já aparece na página inicial.' })
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (s: Service) => {
    try {
      await api(`/api/admin/services/${s.id}`, { method: 'PATCH', json: { active: !s.active } })
      toast({
        title: !s.active ? 'Serviço ativado' : 'Serviço desativado',
        description: !s.active
          ? 'Ele voltou a aparecer no site e no agendamento.'
          : 'Ele não aparece mais no site nem no agendamento.',
      })
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      const res = await api<{ deactivated?: boolean; message?: string }>(
        `/api/admin/services/${deleting.id}`,
        { method: 'DELETE' }
      )
      toast({
        title: res.deactivated ? 'Serviço desativado' : 'Serviço excluído',
        description: res.message,
      })
      setDeleting(null)
      load()
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Serviços"
        subtitle="Tudo que você editar aqui aparece automaticamente no site e no agendamento."
      >
        <Button onClick={openNew} className="rounded-full bg-ink hover:bg-ink-deep">
          <Plus className="mr-1.5 h-4 w-4" /> Novo serviço
        </Button>
      </SectionTitle>

      {services?.some((s) => s.isExample) && (
        <PlaceholderWarn>
          Os serviços marcados com “exemplo” foram criados automaticamente com valores provisórios
          — edite os preços ou remova-os antes de usar comercialmente.
        </PlaceholderWarn>
      )}

      {services === null && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {services?.map((s) => (
          <div
            key={s.id}
            className={cn(
              'flex gap-4 rounded-2xl border bg-white p-4 shadow-sm',
              s.active ? 'border-slate-100' : 'border-slate-100 opacity-60'
            )}
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {s.imageUrl ? (
                <Image src={s.imageUrl} alt={s.name} fill sizes="96px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-slate-300">
                  <Scissors className="h-7 w-7" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-bold text-slate-800">
                    {s.name}
                    {s.isExample && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-700">
                        exemplo
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.description}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase',
                    s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {s.active ? 'ativo' : 'inativo'}
                </span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3 text-stone-400" /> {formatDuration(s.durationMin)}
                </span>
                <span className="text-ink">
                  {s.priceOnConsult
                    ? 'Sob consulta'
                    : s.basePrice > 0
                      ? `A partir de ${formatBRL(s.basePrice)}`
                      : '—'}
                </span>
                <span>
                  {s.species === 'AMBOS' ? 'Cães e gatos' : s.species === 'CAES' ? 'Só cães' : 'Só gatos'}
                </span>
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-full px-3 text-xs font-bold"
                  onClick={() => openEdit(s)}
                >
                  <Pencil className="mr-1 h-3 w-3" /> Editar
                </Button>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={s.active}
                    onCheckedChange={() => toggleActive(s)}
                    aria-label={`Ativar/desativar ${s.name}`}
                  />
                  <span className="text-[11px] font-bold text-slate-400">
                    {s.active ? 'No ar' : 'Oculto'}
                  </span>
                </div>
                <button
                  onClick={() => setDeleting(s)}
                  className="ml-auto text-xs font-bold text-red-400 transition hover:text-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto custom-scrollbar max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="">
              {editing ? 'Editar serviço' : 'Novo serviço'}
            </DialogTitle>
            <DialogDescription>
              Configure nome, duração, preços por porte e a foto que aparece no site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sv-name">Nome *</Label>
              <Input
                id="sv-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Banho e Tosa Completo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv-desc">Descrição</Label>
              <Textarea
                id="sv-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Explique o que está incluído no serviço…"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sv-dur">Duração (min) *</Label>
                <Input
                  id="sv-dur"
                  type="number"
                  min={10}
                  step={5}
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Destinado a *</Label>
                <Select
                  value={form.species}
                  onValueChange={(v) => setForm({ ...form, species: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMBOS">Cães e gatos</SelectItem>
                    <SelectItem value="CAES">Somente cães</SelectItem>
                    <SelectItem value="GATOS">Somente gatos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="sv-consult">Preço sob consulta</Label>
                <Switch
                  id="sv-consult"
                  checked={form.priceOnConsult}
                  onCheckedChange={(v) => setForm({ ...form, priceOnConsult: v })}
                />
              </div>
              {!form.priceOnConsult && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="sv-base" className="text-xs">Preço base *</Label>
                      <Input
                        id="sv-base"
                        inputMode="decimal"
                        value={form.basePrice}
                        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                        placeholder="50,00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sv-cat" className="text-xs">Preço gatos</Label>
                      <Input
                        id="sv-cat"
                        inputMode="decimal"
                        value={form.catPrice}
                        onChange={(e) => setForm({ ...form, catPrice: e.target.value })}
                        placeholder="55,00"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Preços por porte (cães)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="sv-small" className="text-xs">Pequeno</Label>
                      <Input
                        id="sv-small"
                        inputMode="decimal"
                        value={form.smallPrice}
                        onChange={(e) => setForm({ ...form, smallPrice: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sv-medium" className="text-xs">Médio</Label>
                      <Input
                        id="sv-medium"
                        inputMode="decimal"
                        value={form.mediumPrice}
                        onChange={(e) => setForm({ ...form, mediumPrice: e.target.value })}
                        placeholder="60"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sv-large" className="text-xs">Grande</Label>
                      <Input
                        id="sv-large"
                        inputMode="decimal"
                        value={form.largePrice}
                        onChange={(e) => setForm({ ...form, largePrice: e.target.value })}
                        placeholder="75"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ImageUploader
              label="Foto do serviço (aparece no site)"
              url={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <Label htmlFor="sv-active">Serviço ativo</Label>
                <p className="text-xs text-slate-400">Serviços inativos não aparecem no site.</p>
              </div>
              <Switch
                id="sv-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-ink hover:bg-ink-deep"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Salvar alterações' : 'Criar serviço'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Se este serviço tiver agendamentos no histórico, ele será apenas desativado para
              preservar os registros. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deletingBusy}
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              {deletingBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
