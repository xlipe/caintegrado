import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Instagram, Github, Send, MessageSquare, Home } from 'lucide-react';
import Link from 'next/link';

type Profile = {
  id: string;
  avatar_url: string | null;
  status_text: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  course: string | null;
  neighborhood: string | null;
  sexual_orientation: string | null;
  social_telegram: string | null;
  social_instagram: string | null;
  social_steam: string | null;
  social_github: string | null;
  social_whatsapp: string | null;
};

// Componente para ícones de redes sociais (sem alterações)
const SocialIcon = ({ network, username }: { network: string; username: string | null }) => {
  if (!username) return null;

  let href = '#';
  let IconComponent;

  switch (network) {
    case 'instagram':
      href = `https://instagram.com/${username.replace('@', '')}`;
      IconComponent = Instagram;
      break;
    case 'github':
      href = `https://github.com/${username.replace('@', '')}`;
      IconComponent = Github;
      break;
    case 'telegram':
      href = `https://t.me/${username.replace('@', '')}`;
      IconComponent = Send;
      break;
    case 'whatsapp':
      const phone = username.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá, achei o seu whatsapp no app do CA da UNIRIO!`);
      href = `https://wa.me/55${phone}?text=${message}`;
      IconComponent = MessageSquare;
      break;
    default:
      return null;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors">
      <IconComponent className="h-8 w-8" />
    </a>
  );
};


export default async function ProfilePage({ params }: { params: { username: string } }) {
  // AQUI ESTÁ A CORREÇÃO: Usamos o novo sistema de conexão.
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username) 
    .single<Profile>();

  if (!profile) {
    notFound();
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4 text-white">
       <Link href="/dashboard" className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors" title="Voltar ao Dashboard">
        <Home className="h-8 w-8"/>
      </Link>
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.id}`}
              alt="Foto de Perfil"
              className="h-32 w-32 rounded-full object-cover border-4 border-purple-400 shadow-lg"
            />
            {profile.status_text && (
              <div className="absolute -right-4 -top-4 transform rotate-12">
                <div className="relative rounded-lg bg-purple-600 p-2 shadow-md">
                  <p className="italic text-sm">"{profile.status_text}"</p>
                  <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-purple-600"></div>
                </div>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{fullName || 'Utilizador do App'}</h1>
            <p className="text-purple-300">@{profile.username}</p>
            <p className="text-white/80 mt-1">{profile.course || 'Curso não informado'}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/20 pt-6">
          <div>
            <h2 className="font-semibold text-purple-300 mb-2">Bairro</h2>
            <p>{profile.neighborhood || 'Não informado'}</p>
          </div>
          <div>
            <h2 className="font-semibold text-purple-300 mb-2">Gênero</h2>
            <p>{profile.gender || 'Não informado'}</p>
          </div>
           <div>
            <h2 className="font-semibold text-purple-300 mb-2">Orientação Sexual</h2>
            <p>{profile.sexual_orientation || 'Não informado'}</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-6 border-t border-white/20 pt-6">
            <SocialIcon network="instagram" username={profile.social_instagram} />
            <SocialIcon network="github" username={profile.social_github} />
            <SocialIcon network="telegram" username={profile.social_telegram} />
            <SocialIcon network="whatsapp" username={profile.social_whatsapp} />
        </div>
      </div>
    </main>
  );
}

