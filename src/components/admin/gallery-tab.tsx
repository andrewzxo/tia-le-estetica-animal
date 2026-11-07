'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Images, Plus, Loader2, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { cn } from '@/lib/utils'

type GalleryItem = {
  id: string
  kind: string
  imageUrl: string | null
  beforeUrl: string | null
  afterUrl: string | null
  caption: string
  visible: boolean
  isExample: boolean
  sortOrder: number
}

function UploadBox({
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
      <label
        className={cn(
          'group flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition',
          url ? 'border-solid border-stone-300' : 'border-slate-200 hover:border-stone-400 hover:bg-stone-100/40'
        )}
      >
        {uploading ? (
          <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </span>
        ) : url ? (
          <div className="relative h-full w-full">
            <img src={url} alt={label} className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
              Clique para trocar
            </span>
          </div>
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs font-bold text-slate-400">
            <Images className="h-6 w-6 text-slate-300" />
            Clique para enviar
          </span>
        )}
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
    </div>
  )
}

export function GalleryTab() {
  const { toast } = useToast()
  const [items, setItems] = useState<GalleryItem[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [kind, setKind] = useState<'FOTO' | 'ANTES_DEPOIS'>('FOTO')
  const [photo, setPhoto] = useState('')
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [caption, setCaption] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api<{ items: GalleryItem[] }>('/api/admin/gallery')
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setEditingId(null)
    setKind('FOTO')
    setPhoto('')
    setBefore('')
    setAfter('')
    setCaption('')
    setDialogOpen(true)
  }

  const openEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setKind(item.kind === 'ANTES_DEPOIS' ? 'ANTES_DEPOIS' : 'FOTO')
    setPhoto(item.imageUrl ?? '')
    setBefore(item.beforeUrl ?? '')
    setAfter(item.afterUrl ?? '')
    setCaption(item.caption)
    setDialogOpen(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        kind,
        imageUrl: kind === 'FOTO' ? photo : null,
        beforeUrl: kind === 'ANTES_DEPOIS' ? before : null,
        afterUrl: kind === 'ANTES_DEPOIS' ? after : null,
        caption,
      }
      if (editingId) {
        await api(`/api/admin/gallery/${editingId}`, { method: 'PATCH', json: payload })
        toast({ title: 'Foto atualizada!', description: 'As mudanças já aparecem no site.' })
      } else {
        await api('/api/admin/gallery', { json: payload })
        toast({ title: 'Foto adicionada!', description: 'Ela já aparece na galeria do site.' })
      }
      setDialogOpen(false)
      setEditingId(null)
      setPhoto('')
      setBefore('')
      setAfter('')
      setCaption('')
      setKind('FOTO')
      load()
    } catch (err) {
      toast({
        title: editingId ? 'Erro ao atualizar' : 'Erro ao salvar',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const patch = async (id: string, data: Record<string, unknown>) => {
    try {
      await api(`/api/admin/gallery/${id}`, { method: 'PATCH', json: data })
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const remove = async (item: GalleryItem) => {
    try {
      await api(`/api/admin/gallery/${item.id}`, { method: 'DELETE' })
      toast({ title: 'Foto removida' })
      load()
    } catch (err) {
      toast({
        title: 'Erro ao remover',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  const move = async (item: GalleryItem, dir: 1 | -1) => {
    if (!items) return
    const idx = items.findIndex((i) => i.id === item.id)
    const target = items[idx + dir]
    if (!target) return
    await api(`/api/admin/gallery/${item.id}`, {
      method: 'PATCH',
      json: { sortOrder: target.sortOrder },
    })
    await api(`/api/admin/gallery/${target.id}`, {
      method: 'PATCH',
      json: { sortOrder: item.sortOrder },
    })
    load()
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Galeria de trabalhos"
        subtitle="As fotos aparecem automaticamente na página inicial. Use “Antes e depois” para mostrar transformações."
      >
        <Button onClick={openAdd} className="rounded-full bg-ink hover:bg-ink-deep">
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar foto
        </Button>
      </SectionTitle>

      {items?.some((i) => i.isExample) && (
        <PlaceholderWarn>
          As fotos marcadas com “exemplo” são ilustrativas e provisórias — substitua pelas fotos
          reais dos seus atendimentos.
        </PlaceholderWarn>
      )}

      {items === null && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              'overflow-hidden rounded-2xl border bg-white shadow-sm',
              item.visible ? 'border-slate-100' : 'border-dashed border-slate-200 opacity-70'
            )}
          >
            {item.kind === 'ANTES_DEPOIS' ? (
              <div className="grid grid-cols-2">
                <div className="relative aspect-square bg-slate-100">
                  {item.beforeUrl && (
                    <Image src={item.beforeUrl} alt="Antes" fill sizes="200px" className="object-cover" />
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-white">
                    ANTES
                  </span>
                </div>
                <div className="relative aspect-square bg-slate-100">
                  {item.afterUrl && (
                    <Image src={item.afterUrl} alt="Depois" fill sizes="200px" className="object-cover" />
                  )}
                  <span className="absolute right-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                    DEPOIS
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square bg-slate-100">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.caption} fill sizes="300px" className="object-cover" />
                )}
              </div>
            )}

            <div className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-bold text-slate-700">
                  {item.caption || 'Sem legenda'}
                </p>
                {item.isExample && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-700">
                    exemplo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={item.visible}
                  onCheckedChange={(v) => patch(item.id, { visible: v })}
                  aria-label="Mostrar no site"
                />
                <span className="text-[11px] font-bold text-slate-400">
                  {item.visible ? 'No site' : 'Oculta'}
                </span>
                <div className="ml-auto flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-stone-500 hover:bg-stone-100 hover:text-ink"
                    onClick={() => openEdit(item)}
                    aria-label="Editar foto"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(item, -1)}
                    disabled={idx === 0}
                    aria-label="Mover para cima"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(item, 1)}
                    disabled={idx === items.length - 1}
                    aria-label="Mover para baixo"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:bg-red-50 hover:text-red-600"
                    onClick={() => remove(item)}
                    aria-label="Excluir foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Input
                defaultValue={item.caption}
                placeholder="Editar legenda…"
                className="h-8 rounded-full text-xs"
                onBlur={(e) => {
                  if (e.target.value !== item.caption) patch(item.id, { caption: e.target.value })
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {items?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Nenhuma foto na galeria ainda. Clique em “Adicionar foto” para começar.
        </p>
      )}

      {/* Dialog adicionar / editar foto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="">
              {editingId ? 'Editar foto' : 'Adicionar à galeria'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Clique na imagem para trocá-la, mude o tipo ou ajuste a legenda.'
                : 'Envie uma foto simples ou um par “antes e depois” de uma transformação.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: 'FOTO', label: 'Foto única' },
                  { v: 'ANTES_DEPOIS', label: 'Antes e depois' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setKind(opt.v)}
                  className={cn(
                    'rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition',
                    kind === opt.v
                      ? 'border-stone-400 bg-stone-100 text-ink'
                      : 'border-slate-200 text-slate-500 hover:border-stone-300'
                  )}
                  aria-pressed={kind === opt.v}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {kind === 'FOTO' ? (
              <UploadBox label="Foto" url={photo} onChange={setPhoto} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <UploadBox label="Foto ANTES" url={before} onChange={setBefore} />
                <UploadBox label="Foto DEPOIS" url={after} onChange={setAfter} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="gl-caption">Legenda</Label>
              <Input
                id="gl-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex.: Tosa teddy bear no Thor"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving || (kind === 'FOTO' ? !photo : !before || !after)}
              className="rounded-full bg-ink hover:bg-ink-deep"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Salvar alterações' : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
