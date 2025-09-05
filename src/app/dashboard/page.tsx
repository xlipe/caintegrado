import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

// Esta função força a página a ser dinâmica e não usar cache
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  // Se o utilizador existe, buscamos a sessão completa para passar ao componente cliente
  const { data: { session } } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!session) {
      redirect('/login');
  }

  return <DashboardClient session={session} profile={profile} />;
}

