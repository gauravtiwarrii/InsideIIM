'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import ParticleBackground from '@/components/ParticleBackground'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true)
    setError(null)
    
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError('Check your email for the confirmation link.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>
      
      <Card className="z-10 w-full max-w-md p-8 glass-panel border border-white/10">
        <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-tight">
          Invest<span className="text-blue-400">IQ</span> Auth
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Email</label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-white/10 text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Password</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

          <div className="flex gap-4 mt-6">
            <Button 
              className="flex-1 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => handleAuth('signup')}
              disabled={loading}
            >
              Sign Up
            </Button>
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => handleAuth('login')}
              disabled={loading}
            >
              Sign In
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
