import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Função para criar e retornar o cliente Supabase
export const createClient = () => {
  // Pega as variáveis de ambiente que configuramos no arquivo .env.local
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validação para garantir que as chaves foram carregadas
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from .env.local');
  }

  // Cria e retorna o cliente Supabase
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};

