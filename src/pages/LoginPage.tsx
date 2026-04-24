import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Radio, Lock, Mail, Eye, EyeOff, FlaskConical } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { isMockMode } from '@/infra/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginData) {
    setError(null)
    try {
      await signIn(data.email, data.password)
      navigate('/instalacoes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas')
    }
  }

  async function enterDemo() {
    await signIn('demo@loma.local', 'demo123')
    navigate('/instalacoes')
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(213 52% 6%) 0%, hsl(213 45% 10%) 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Radio className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-widest uppercase">LOMA</p>
            <p className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase">
              rastreamento
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Controle total das
            <br />
            <span className="text-primary">instalações</span>
            <br />
            em tempo real.
          </h1>
          <p className="text-base text-muted-foreground max-w-sm">
            Gerencie técnicos, equipamentos e ciclos de faturamento — tudo em um só lugar.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Instalações', value: '932+' },
            { label: 'Técnicos', value: '15+' },
            { label: 'Equipamentos', value: '650+' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border/50 bg-card/40 p-3">
              <p className="font-mono text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Radio className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="font-bold tracking-widest uppercase">LOMA Rastreamento</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Bem-vindo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {/* Banner modo demo */}
          {isMockMode && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm font-medium text-amber-300">Modo demonstração ativo</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Firebase não configurado. Você pode explorar o sistema com dados simulados.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
                onClick={enterDemo}
              >
                <FlaskConical className="mr-2 h-4 w-4" />
                Entrar como demo
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-9"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Erro geral */}
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={async () => {
              setError(null)
              try {
                await signInWithGoogle()
                navigate('/instalacoes')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao entrar com Google')
              }
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Loma Protegido · Sistema de Rastreamento
          </p>
        </div>
      </div>
    </div>
  )
}
