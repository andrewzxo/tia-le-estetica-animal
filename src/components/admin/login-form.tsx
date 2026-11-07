'use client'

import { useState } from 'react'
import { PawPrint, Lock, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from './ui'

export function LoginForm({ onLogin }: { onLogin: (user: { name: string }) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ user: { name: string } }>('/api/admin/login', {
        json: { username, password },
      })
      onLogin(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-900 text-amber-400">
              <PawPrint className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-stone-900">
              Painel Tia Lê Estética Animal
            </h1>
            <p className="mt-1 text-sm text-stone-500">Área restrita para as proprietárias</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adm-user">Usuário</Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="adm-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-pass">Senha</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="adm-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600 ring-1 ring-red-100"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-stone-900 py-2.5 font-semibold text-white hover:bg-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando…
                </>
              ) : (
                'Entrar no painel'
              )}
            </Button>
          </form>
        </div>

        <p className="mx-auto mt-4 max-w-md rounded-lg bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          ⚠ Acesso provisório de demonstração: usuário <strong>admin</strong>, senha{' '}
          <strong>admin123</strong>. Altere a senha em Configurações &gt; Segurança antes de usar
          comercialmente.
        </p>
      </div>
    </div>
  )
}
