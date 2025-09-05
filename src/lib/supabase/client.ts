import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Cria uma instância do cliente Supabase para Client Components,
  // que sabe como interagir com o navegador.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

