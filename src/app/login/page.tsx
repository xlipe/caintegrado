'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Define os dois modos possíveis para o formulário
type FormMode = 'login' | 'cadastro';

const LoginPage = () => {
  // Estado para controlar se estamos em modo Login ou Cadastro
  const [mode, setMode] = useState<FormMode>('login');

  // Estados do formulário
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (value && !value.endsWith('@edu.unirio.br')) {
        setEmailError('O e-mail deve ser do domínio @edu.unirio.br');
      } else {
        setEmailError(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailError) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();

    try {
      if (mode === 'cadastro') {
        // Lógica de Cadastro
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name, // Adiciona o nome aos metadados do usuário
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');

      } else {
        // Lógica de Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
        // Se o login for bem-sucedido, o ideal é redirecionar o usuário.
        // Por agora, vamos apenas mostrar uma mensagem de sucesso.
        setSuccess('Login bem-sucedido! Redirecionando...');
        // window.location.href = '/dashboard'; // Exemplo de redirecionamento
      }
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      console.error("ERRO DETECTADO:", err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'cadastro' : 'login');
    setError(null);
    setSuccess(null);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            {mode === 'login' ? 'Acessar Conta' : 'Criar Conta'}
          </h1>
          <p className="mt-2 text-purple-200">Use seu e-mail da faculdade para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Campo NOME: aparece apenas no modo cadastro */}
          {mode === 'cadastro' && (
            <div>
              <label htmlFor="name" className="text-sm font-medium text-purple-200">Nome Completo</label>
              <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                className="mt-1 block w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-purple-300 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-purple-400 sm:text-sm"
              />
            </div>
          )}

          {/* Campo EMAIL */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-purple-200">E-mail Institucional</label>
            <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
              className="mt-1 block w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-purple-300 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-purple-400 sm:text-sm"
            />
            {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
          </div>

          {/* Campo SENHA */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-purple-200">Senha</label>
            <input id="password" name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange}
              className="mt-1 block w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-purple-300 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-purple-400 sm:text-sm"
            />
          </div>

          <div>
            <button type="submit" disabled={isSubmitting || !!emailError}
              className="mt-2 flex w-full justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={toggleMode} className="font-medium text-purple-300 hover:text-purple-200">
            {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>

        {error && (
          <div className="mt-6 flex items-center space-x-3 rounded-lg bg-red-500/20 p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-6 flex items-center space-x-3 rounded-lg bg-green-500/20 p-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />
            <p className="text-sm text-green-300">{success}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default LoginPage;

