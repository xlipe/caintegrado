'use client'; // Necessário para usar hooks como useState

import { useState } from 'react';
import type { FormEvent } from 'react'; // Importando o tipo explicitamente
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Alterando a declaração do componente para uma constante com tipo explícito
const LoginPage: React.FC = () => {
  // Estados para controlar os inputs do formulário e mensagens de erro/sucesso
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => { // Usando o tipo importado
    e.preventDefault(); // Previne o recarregamento da página
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // --- Validação do E-mail ---
    if (!email.endsWith('@edu.unirio.br')) {
      setError('Por favor, use um e-mail institucional (@edu.unirio.br).');
      setIsLoading(false);
      return;
    }

    // TODO: Aqui virá a lógica para conectar com o Supabase
    console.log('Dados para cadastro:', { name, email });
    
    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccessMessage('Verifique seu e-mail para o link de confirmação!');
    setIsLoading(false);
    setName('');
    setEmail('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 p-8 text-white">
      
      {/* Botão de Voltar */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="mx-auto h-12 w-12 text-purple-300" />
          <h1 className="text-4xl font-bold mt-4">Crie sua Conta</h1>
          <p className="text-purple-200 mt-2">Use seu e-mail da faculdade para começar.</p>
        </div>

        {/* Formulário com efeito glass */}
        <form 
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-lg space-y-6"
        >
          {/* Campo Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-200">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-white/10 border-purple-400/50 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Campo E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-200">E-mail Institucional</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-white/10 border-purple-400/50 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          {/* Mensagens de erro e sucesso */}
          {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
          {successMessage && <p className="text-sm text-green-300 bg-green-900/50 p-3 rounded-md">{successMessage}</p>}


          {/* Botão de Envio */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? 'Enviando...' : 'Receber e-mail de confirmação'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;

