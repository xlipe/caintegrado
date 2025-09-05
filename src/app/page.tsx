// Importa os ícones que vamos usar da biblioteca lucide-react
import { MessageCircle, Instagram, Coffee, User } from 'lucide-react';

export default function HomePage() {
  return (
    // Container principal que ocupa toda a tela e centraliza o conteúdo
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 p-8 text-white">
      
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          App do C.A.
        </h1>
        <p className="mt-4 text-lg text-purple-200">
          Acesse os links úteis e fique por dentro de tudo.
        </p>
      </div>

      {/* Grid responsivo para os botões. Em telas pequenas, uma coluna. Em telas médias e maiores, duas colunas. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 w-full max-w-2xl">

        {/* --- Botão 1: Grupo do Whatsapp --- */}
        <a 
          href="#" // TODO: Adicionar o link real do Whatsapp aqui
          className="group rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <MessageCircle className="h-10 w-10 text-green-400" />
            <div>
              <h2 className="text-xl font-semibold">Grupo do CA</h2>
              <p className="text-purple-200/80">Participe e tire suas dúvidas.</p>
            </div>
          </div>
        </a>

        {/* --- Botão 2: Instagram do CA --- */}
        <a 
          href="#" // TODO: Adicionar o link real do Instagram aqui
          className="group rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <Instagram className="h-10 w-10 text-pink-400" />
            <div>
              <h2 className="text-xl font-semibold">Instagram</h2>
              <p className="text-purple-200/80">Acompanhe as novidades.</p>
            </div>
          </div>
        </a>

        {/* --- Botão 3: Clube do Café --- */}
        <a 
          href="#" // TODO: Adicionar o link de mais informações aqui
          className="group rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <Coffee className="h-10 w-10 text-yellow-400" />
            <div>
              <h2 className="text-xl font-semibold">Clube do Café</h2>
              <p className="text-purple-200/80">Veja os eventos e participe.</p>
            </div>
          </div>
        </a>

        {/* --- Botão 4: Login/Cadastro --- */}
        <a 
          href="#" // TODO: Adicionar o link para a página de login
          className="group rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <User className="h-10 w-10 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">Login / Cadastro</h2>
              <p className="text-purple-200/80">Acesse sua área de aluno.</p>
            </div>
          </div>
        </a>

      </div>
    </main>
  );
}
