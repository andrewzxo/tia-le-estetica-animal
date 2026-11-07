'use client'

import { useCallback, useEffect, useState } from 'react'
import { MessageSquareQuote, Plus, Loader2, Trash2, Star } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { api, SectionTitle, PlaceholderWarn } from './ui'

type Testimonial = {
  id: string
  customerName: string
  petName: string
  text: string
  rating: number
  visible: boolean
  isExample: boolean
}

export function TestimonialsTab() {
  const { toast } = useToast()
  const [items, setItems] = useState<Testimonial[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ customerName: '', petName: '', text: '', rating: 5 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api<{ testimonials: Testimonial[] }>('/api/admin/testimonials')
      .then((d) => setItems(d.testimonials))
      .catch(() => setItems([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/admin/testimonials', { json: form })
      toast({ title: 'Depoimento adicionado!' })
      setDialogOpen(false)
      setForm({ customerName: '', petName: '', text: '', rating: 5 })
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

  const patch = async (id: string, data: Record<string, unknown>) => {
    try {
      await api(`/api/admin/testimonials/${id}`, { method: 'PATCH', json: data })
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const remove = async (t: Testimonial) => {
    try {
      await api(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' })
      toast({ title: 'Depoimento removido' })
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Depoimentos"
        subtitle="Avaliações que aparecem na página inicial para passar confiança aos novos clientes."
      >
        <Button onClick={() => setDialogOpen(true)} className="rounded-full bg-ink hover:bg-ink-deep">
          <Plus className="mr-1.5 h-4 w-4" /> Novo depoimento
        </Button>
      </SectionTitle>

      {items?.some((t) => t.isExample) && (
        <PlaceholderWarn>
          Os depoimentos marcados com “exemplo” são fictícios, criados apenas para demonstração —
          substitua por avaliações reais dos seus clientes.
        </PlaceholderWarn>
      )}

      {items === null && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items?.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-800">
                  {t.customerName}
                  {t.petName && (
                    <span className="text-xs font-semibold text-slate-400"> • {t.petName}</span>
                  )}
                </p>
                <div className="mt-1 flex gap-0.5" aria-label={`${t.rating} estrelas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < t.rating
                          ? 'h-3.5 w-3.5 fill-amber-400 text-amber-400'
                          : 'h-3.5 w-3.5 text-slate-200'
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {t.isExample && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-700">
                    exemplo
                  </span>
                )}
                <Switch
                  checked={t.visible}
                  onCheckedChange={(v) => patch(t.id, { visible: v })}
                  aria-label="Mostrar no site"
                />
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">“{t.text}”</p>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600"
                onClick={() => remove(t)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
              </Button>
            </div>
          </div>
        ))}
      </div>

      {items?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Nenhum depoimento cadastrado ainda.
        </p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="">Novo depoimento</DialogTitle>
            <DialogDescription>
              Copie uma avaliação real recebida pelo WhatsApp ou presencial.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ts-name">Cliente *</Label>
                <Input
                  id="ts-name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Ex.: Mariana S."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ts-pet">Pet</Label>
                <Input
                  id="ts-pet"
                  value={form.petName}
                  onChange={(e) => setForm({ ...form, petName: e.target.value })}
                  placeholder="Ex.: Bolinha"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ts-text">Depoimento *</Label>
              <Textarea
                id="ts-text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={3}
                placeholder="Escreva o que o cliente disse…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estrelas</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} estrelas`}
                    aria-pressed={form.rating === n}
                  >
                    <Star
                      className={
                        n <= form.rating
                          ? 'h-6 w-6 fill-amber-400 text-amber-400'
                          : 'h-6 w-6 text-slate-200'
                      }
                    />
                  </button>
                ))}
              </div>
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
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
