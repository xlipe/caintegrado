'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client'; // MUDANÇA IMPORTANTE AQUI
import { AlertTriangle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuthAction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;


    if (isLogin) {
      // Lógica de Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      // Lógica de Cadastro
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Cadastro realizado! Verifique o seu e-mail para confirmar a conta.');
      }
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <Link href="/" className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors">
        <ArrowLeft className="h-8 w-8" />
      </Link>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
          <h1 className="text-3xl font-bold text-center text-white mb-2">{isLogin ? 'Login' : 'Crie a sua Conta'}</h1>
          <p className="text-center text-white/70 mb-6">
            {isLogin ? 'Bem-vindo(a) de volta!' : 'Use o seu e-mail da faculdade para começar.'}
          </p>

          <form onSubmit={handleAuthAction} className="space-y-4">
            {!isLogin && (
              <div className="flex gap-4">
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="Nome"
                  className="w-full rounded-lg bg-white/10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Sobrenome"
                  className="w-full rounded-lg bg-white/10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
            <input
              name="email"
              type="email"
              required
              placeholder="E-mail institucional"
              className="w-full rounded-lg bg-white/10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Senha"
              minLength={6}
              className="w-full rounded-lg bg-white/10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-base font-bold text-white transition-all hover:bg-purple-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/30 p-3 text-sm text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/30 p-3 text-sm text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-white/70">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-purple-300 hover:underline ml-2">
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

