import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Usamos o nosso novo "ajudante" para criar o cliente Supabase e a resposta
  const { supabase, response } = createClient(request)

  // Esta linha é crucial: ela atualiza a sessão do utilizador,
  // garantindo que o cookie de autenticação está sempre válido.
  await supabase.auth.getSession()

  // Retornamos a resposta, que agora contém os cookies atualizados.
  return response
}

export const config = {
  matcher: [
    /*
     * Faz a correspondência de todos os caminhos de pedido, exceto os que começam com:
     * - _next/static (ficheiros estáticos)
     * - _next/image (ficheiros de otimização de imagem)
     * - favicon.ico (ficheiro do favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

