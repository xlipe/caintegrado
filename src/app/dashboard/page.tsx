import { createClient } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; // Componente do lado do cliente

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116: 'No rows found' - acontece se o perfil ainda não foi criado pelo trigger
    console.error('Erro ao buscar perfil:', error);
  }
  
  // Passamos os dados do servidor para o componente de cliente
  return <DashboardClient session={session} profile={profile} />;
}

