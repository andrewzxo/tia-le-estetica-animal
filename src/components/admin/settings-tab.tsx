'use client'

import { useCallback, useEffect, useState } from 'react'
import { Globe, Loader2, Save, ShieldCheck, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { api, SectionTitle, PlaceholderWarn } from './ui'
import { WhatsAppIcon } from '@/components/site/icons'

type Settings = {
  businessName: string
  logoUrl: string | null
  phone: string
  whatsapp: string
  address: string
  instagram: string
  facebook: string
  heroTitle: string
  heroSubtitle: string
  heroImageUrl: string | null
  aboutTitle: string
  aboutText: string
  hoursNote: string
  waBookingTemplate: string
}

const PROVISIONAL_WHATSAPP = '5511999999999'

function UploadField({
  url,
  onChange,
  label,
  aspect = 'square',
}: {
  url: string
  onChange: (url: string) => void
  label: string
  aspect?: 'square' | 'wide'
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
        <label
          className={
            aspect === 'square'
              ? 'relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-stone-400'
              : 'relative flex h-24 w-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-stone-400'
          }
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : url ? (
            <img src={url} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] font-bold text-slate-400">Enviar</span>
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
        {url && (
          <button
            type="button"
            className="text-xs font-bold text-red-500 hover:underline"
            onClick={() => onChange('')}
          >
            Remover
          </button>
        )}
      </div>
    </div>
  )
}

export function SettingsTab() {
  const { toast } = useToast()
  const [s, setS] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwBusy, setPwBusy] = useState(false)

  const load = useCallback(() => {
    api<{ settings: Settings }>('/api/admin/settings')
      .then((d) => setS(d.settings))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const set = (patch: Partial<Settings>) => setS((prev) => (prev ? { ...prev, ...patch } : prev))

  const save = async () => {
    if (!s) return
    setSaving(true)
    try {
      await api('/api/admin/settings', {
        method: 'PUT',
        json: {
          businessName: s.businessName,
          phone: s.phone,
          whatsapp: s.whatsapp,
          address: s.address,
          instagram: s.instagram,
          facebook: s.facebook,
          heroTitle: s.heroTitle,
          heroSubtitle: s.heroSubtitle,
          heroImageUrl: s.heroImageUrl || null,
          logoUrl: s.logoUrl || null,
          aboutTitle: s.aboutTitle,
          aboutText: s.aboutText,
          hoursNote: s.hoursNote,
          waBookingTemplate: s.waBookingTemplate,
        },
      })
      toast({
        title: 'Configurações salvas!',
        description: 'A página pública já foi atualizada.',
      })
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

  const changePassword = async () => {
    if (pw.next !== pw.confirm) {
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação da nova senha é diferente.',
        variant: 'destructive',
      })
      return
    }
    setPwBusy(true)
    try {
      await api('/api/admin/password', {
        json: { currentPassword: pw.current, newPassword: pw.next },
      })
      toast({ title: 'Senha alterada com sucesso!' })
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast({
        title: 'Não foi possível alterar',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setPwBusy(false)
    }
  }

  if (!s) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando configurações…
      </p>
    )
  }

  const waProvisional = s.whatsapp === PROVISIONAL_WHATSAPP
  const testWaLink = `https://api.whatsapp.com/send?phone=${s.whatsapp}&text=${encodeURIComponent('Olá! Teste de mensagem do site da Tia Lê Estética Animal 🐾')}`

  return (
    <div className="space-y-6 pb-6">
      <SectionTitle
        title="Site & Configurações"
        subtitle="Edite as informações comerciais, textos da página inicial, WhatsApp e segurança."
      />

      {/* ── Identidade ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Globe className="h-5 w-5 text-ink" /> Identidade do estabelecimento
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="st-name">Nome do estabelecimento *</Label>
            <Input
              id="st-name"
              value={s.businessName}
              onChange={(e) => set({ businessName: e.target.value })}
            />
          </div>
          <UploadField
            label="Logotipo (opcional)"
            url={s.logoUrl || ''}
            onChange={(url) => set({ logoUrl: url })}
          />
        </div>
      </section>

      {/* ── Contato ────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <WhatsAppIcon className="h-5 w-5 text-emerald-500" /> Contato & WhatsApp
        </h3>
        {waProvisional && (
          <div className="mt-3">
            <PlaceholderWarn>
              O número de WhatsApp abaixo é <strong>provisório</strong> (usado na demonstração).
              Substitua pelo número oficial antes de divulgar o site!
            </PlaceholderWarn>
          </div>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="st-wa">WhatsApp oficial (com DDD) *</Label>
            <Input
              id="st-wa"
              value={s.whatsapp}
              onChange={(e) => set({ whatsapp: e.target.value })}
              placeholder="5511999999999"
            />
            <p className="text-xs text-slate-400">
              Só números, com DDD. Ex.: 11999998888 (o sistema envia com código do Brasil).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-phone">Telefone para exibir (opcional)</Label>
            <Input
              id="st-phone"
              value={s.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="(11) 99999-8888"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="st-address">Endereço completo (opcional)</Label>
            <Input
              id="st-address"
              value={s.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="Rua, número, bairro, cidade — UF"
            />
            <p className="text-xs text-slate-400">
              Ao preencher, o mapa do Google aparece automaticamente na página inicial.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="st-ig">Instagram (usuário ou link)</Label>
            <Input
              id="st-ig"
              value={s.instagram}
              onChange={(e) => set({ instagram: e.target.value })}
              placeholder="@petbanhoetosadale"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-fb">Facebook (página ou link)</Label>
            <Input
              id="st-fb"
              value={s.facebook}
              onChange={(e) => set({ facebook: e.target.value })}
              placeholder="petbanhoetosadale"
            />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="st-watpl">Modelo da mensagem de agendamento no WhatsApp</Label>
          <Textarea
            id="st-watpl"
            value={s.waBookingTemplate}
            onChange={(e) => set({ waBookingTemplate: e.target.value })}
            rows={8}
            className="font-mono text-xs"
          />
          <p className="text-xs text-slate-400">
            Variáveis disponíveis:{' '}
            <code className="rounded bg-slate-100 px-1">
              {'{negocio} {servico} {data} {horario} {pet} {especie} {raca} {porte} {tutor} {telefone} {preco} {obs}'}
            </code>
          </p>
          <a
            href={testWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" /> Testar mensagem
          </a>
        </div>
      </section>

      {/* ── Textos e banner ────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Globe className="h-5 w-5 text-ink" /> Textos e fotos da página inicial
        </h3>
        <div className="mt-4 grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-herot">Título principal (banner)</Label>
            <Input
              id="st-herot"
              value={s.heroTitle}
              onChange={(e) => set({ heroTitle: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-heros">Frase de apresentação (banner)</Label>
            <Textarea
              id="st-heros"
              value={s.heroSubtitle}
              onChange={(e) => set({ heroSubtitle: e.target.value })}
              rows={2}
            />
          </div>
          <UploadField
            label="Foto do banner principal"
            url={s.heroImageUrl || ''}
            onChange={(url) => set({ heroImageUrl: url })}
            aspect="wide"
          />
          <div className="space-y-1.5">
            <Label htmlFor="st-aboutt">Título da seção “Sobre”</Label>
            <Input
              id="st-aboutt"
              value={s.aboutTitle}
              onChange={(e) => set({ aboutTitle: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-about">Texto da seção “Sobre”</Label>
            <Textarea
              id="st-about"
              value={s.aboutText}
              onChange={(e) => set({ aboutText: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-hoursn">Observação extra de funcionamento (opcional)</Label>
            <Input
              id="st-hoursn"
              value={s.hoursNote}
              onChange={(e) => set({ hoursNote: e.target.value })}
              placeholder="Ex.: Atendimento também fora do horário com agendamento prévio."
            />
          </div>
        </div>
      </section>

      <Button
        onClick={save}
        disabled={saving}
        size="lg"
        className="rounded-full bg-ink px-10 shadow-md shadow-stone-300 hover:bg-ink"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar todas as configurações
      </Button>

      {/* ── Segurança ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <ShieldCheck className="h-5 w-5 text-ink" /> Segurança
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          O acesso provisório usa <strong>admin / admin123</strong>. Troque a senha antes de usar
          o sistema de verdade.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="pw-current">Senha atual</Label>
            <Input
              id="pw-current"
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-next">Nova senha</Label>
            <Input
              id="pw-next"
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-confirm">Confirmar nova senha</Label>
            <Input
              id="pw-confirm"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </div>
        </div>
        <Button
          onClick={changePassword}
          disabled={pwBusy || !pw.current || !pw.next}
          variant="outline"
          className="mt-4 rounded-full border-stone-300 font-bold text-ink hover:bg-stone-100"
        >
          {pwBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
          Alterar senha
        </Button>
      </section>
    </div>
  )
}
