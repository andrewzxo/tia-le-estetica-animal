'use client'

import { useCallback, useEffect, useState } from 'react'
import { LoginForm } from '@/components/admin/login-form'
import { AdminShell } from '@/components/admin/admin-shell'
import { PawPrint } from 'lucide-react'

type AdminUser = { name: string; username: string }

export default function AdminPage() {
  const [status, setStatus] = useState<'loading' | 'login' | 'ready'>('loading')
  const [user, setUser] = useState<AdminUser | null>(null)

  const checkSession = useCallback(() => {
    fetch('/api/admin/session')
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json()
          setUser(data.user)
          setStatus('ready')
        } else {
          setStatus('login')
        }
      })
      .catch(() => setStatus('login'))
  }, [])

  useEffect(() => {
    checkSession()
    const onUnauthorized = () => {
      setUser(null)
      setStatus('login')
    }
    window.addEventListener('dale:unauthorized', onUnauthorized)
    return () => window.removeEventListener('dale:unauthorized', onUnauthorized)
  }, [checkSession])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    setStatus('login')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50">
        <span className="flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-rose-500 text-white">
          <PawPrint className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-bold text-stone-400">Verificando acesso…</p>
      </div>
    )
  }

  if (status === 'login' || !user) {
    return <LoginForm onLogin={checkSession} />
  }

  return <AdminShell user={user} onLogout={logout} />
}
