'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import {
  Instagram,
  Github,
  Send,
  Camera,
  LogOut,
  Store,
  MessageCircle,
  X,
  Loader2,
  Check,
  MessageSquare,
} from 'lucide-react';

// Tipagem para o perfil do usuário
type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  status_text: string | null;
  social_telegram: string | null;
  social_instagram: string | null;
  social_steam: string | null;
  social_github: string | null;
  social_whatsapp: string | null;
};

// Componente para ícones de redes sociais
const SocialIcon = ({ network }: { network: string }) => {
  switch (network) {
    case 'instagram': return <Instagram className="h-5 w-5 text-purple-300" />;
    case 'github': return <Github className="h-5 w-5 text-purple-300" />;
    case 'telegram': return <Send className="h-5 w-5 text-purple-300" />;
    default: return <MessageSquare className="h-5 w-5 text-purple-300" />;
  }
};

export default function DashboardClient({ session, profile: initialProfile }: { session: Session; profile: Profile | null }) {
  const supabase = createClient();
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  
  const [statusText, setStatusText] = useState(initialProfile?.status_text || '');
  const [socials, setSocials] = useState({
      telegram: initialProfile?.social_telegram || '',
      instagram: initialProfile?.social_instagram || '',
      steam: initialProfile?.social_steam || '',
      github: initialProfile?.social_github || '',
      whatsapp: initialProfile?.social_whatsapp || '',
  });

  const user = session.user;

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates = {
      id: user.id,
      full_name: profile?.full_name || user.email, // Garante que o nome seja salvo
      status_text: statusText,
      social_telegram: socials.telegram,
      social_instagram: socials.instagram,
      social_steam: socials.steam,
      social_github: socials.github,
      social_whatsapp: socials.whatsapp,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      alert(error.message);
    } else {
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(updatedProfile);
    }
    setLoading(false);
  };

  const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocials(prev => ({...prev, [name]: value}));
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
      if (dbError) throw dbError;

      setProfile(prev => prev ? {...prev, avatar_url: publicUrl} : null);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  
  const getSocialLink = (network: keyof typeof socials, username: string) => {
    if(!username) return null;
    switch(network){
        case 'instagram': return `https://instagram.com/${username}`;
        case 'github': return `https://github.com/${username}`;
        case 'telegram': return `https://t.me/${username}`;
        case 'steam': return `https://steamcommunity.com/id/${username}`;
        case 'whatsapp': {
            const phone = username.replace(/\D/g, '');
            const message = encodeURIComponent(`Olá ${profile?.full_name || 'pessoa'}, achei seu whatsapp no app do CA da UNIRIO!`);
            return `https://wa.me/55${phone}?text=${message}`;
        }
        default: return null;
    }
  };

  return (
    <>
      <main className="min-h-screen w-full bg-gradient-to-br from-indigo-900 to-purple-900 p-4 sm:p-6 lg:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Meu Perfil</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg bg-red-500/50 px-3 py-2 text-sm font-semibold transition-colors hover:bg-red-500/80"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </header>

          {/* Cartão de Perfil */}
          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                    <img
                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`}
                        alt="Foto de Perfil"
                        className="h-24 w-24 rounded-full object-cover border-2 border-purple-400"
                    />
                    <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-600 transition-transform hover:scale-110">
                        <Camera className="h-4 w-4" />
                        <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={loading} />
                    </label>
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{profile?.full_name || user.email}</h2>
                    <p className="text-purple-300 text-sm">{user.email}</p>
                    
                    {/* Links Sociais */}
                    <div className="flex justify-center sm:justify-start items-center gap-3 mt-3">
                        {Object.entries(socials).map(([key, value]) => {
                            const link = getSocialLink(key as keyof typeof socials, value);
                            if(link) {
                                return (
                                    <a key={key} href={link} target="_blank" rel="noopener noreferrer" className="text-purple-300 transition-transform hover:scale-125 hover:text-white">
                                        <SocialIcon network={key} />
                                    </a>
                                )
                            }
                            return null;
                        })}
                    </div>
                </div>

                {/* Balão de Status */}
                {profile?.status_text && (
                     <div className="hidden sm:block absolute top-6 -right-16 transform">
                        <div className="relative rounded-lg bg-gray-700/50 p-3 text-sm italic">
                            {profile.status_text}
                            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-gray-700/50"></div>
                        </div>
                    </div>
                )}
            </div>
            {profile?.status_text && (
                <p className="sm:hidden mt-4 text-center italic text-purple-200 bg-gray-700/30 p-3 rounded-lg">"{profile.status_text}"</p>
            )}
          </div>
          
          {/* Ações do Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
             <button disabled className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 cursor-not-allowed opacity-50">
                <Store className="h-8 w-8 text-purple-300" />
                <span className="font-semibold">Lojinha do CA</span>
             </button>
             <button onClick={() => setContactModalOpen(true)} className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <MessageCircle className="h-8 w-8 text-purple-300" />
                <span className="font-semibold">Fale com a gente</span>
             </button>
          </div>


          {/* Formulário de Edição */}
          <form onSubmit={updateProfile} className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg">
             <h3 className="text-xl font-bold mb-6">Editar Informações</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                   <label htmlFor="status" className="text-sm font-medium text-purple-200 block mb-2">Seu status</label>
                   <input type="text" id="status" value={statusText} onChange={e => setStatusText(e.target.value)} placeholder="O que você está pensando?" className="input-glass"/>
                </div>

                {/* Instagram */}
                <div>
                   <label htmlFor="instagram" className="text-sm font-medium text-purple-200 block mb-2">Instagram</label>
                   <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-300">@</span>
                      <input type="text" name="instagram" value={socials.instagram} onChange={handleSocialChange} placeholder="usuario" className="input-glass pl-7"/>
                   </div>
                </div>

                {/* GitHub */}
                <div>
                   <label htmlFor="github" className="text-sm font-medium text-purple-200 block mb-2">GitHub</label>
                   <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-300">@</span>
                      <input type="text" name="github" value={socials.github} onChange={handleSocialChange} placeholder="usuario" className="input-glass pl-7"/>
                   </div>
                </div>

                {/* Telegram */}
                <div>
                   <label htmlFor="telegram" className="text-sm font-medium text-purple-200 block mb-2">Telegram</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-300">@</span>
                      <input type="text" name="telegram" value={socials.telegram} onChange={handleSocialChange} placeholder="usuario" className="input-glass pl-7"/>
                   </div>
                </div>

                {/* WhatsApp */}
                <div>
                   <label htmlFor="whatsapp" className="text-sm font-medium text-purple-200 block mb-2">WhatsApp</label>
                   <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-300">+55</span>
                      <input type="text" name="whatsapp" value={socials.whatsapp} onChange={handleSocialChange} placeholder="21912345678" className="input-glass pl-10"/>
                   </div>
                </div>

                 {/* Steam */}
                <div>
                   <label htmlFor="steam" className="text-sm font-medium text-purple-200 block mb-2">Steam (URL Personalizada)</label>
                   <input type="text" name="steam" value={socials.steam} onChange={handleSocialChange} placeholder="usuario" className="input-glass"/>
                </div>
             </div>

             <div className="mt-8 text-right">
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                   {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                   {loading ? 'A Guardar...' : 'Guardar Alterações'}
                </button>
             </div>
          </form>
        </div>
      </main>

      <ContactModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} user={user} />
      
      <style jsx global>{`
        .input-glass {
            display: block;
            width: 100%;
            appearance: none;
            border-radius: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: rgba(255, 255, 255, 0.05);
            padding: 0.5rem 0.75rem;
            color: white;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .input-glass::placeholder {
            color: #c084fc; /* purple-300 */
        }
        .input-glass:focus {
            outline: none;
            border-color: #a855f7; /* purple-500 */
            box-shadow: 0 0 0 2px #a855f7;
        }
      `}</style>
    </>
  );
}

// Componente do Modal de Contato
const ContactModal = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: User }) => {
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleContactSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setSendStatus('idle');

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: user.email,
                subject,
                message,
            }),
        });
        
        if (response.ok) {
            setSendStatus('success');
            setMessage('');
            setSubject('');
        } else {
            setSendStatus('error');
        }
        setIsSending(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-gray-900/80 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X className="h-6 w-6"/>
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">Fale com o CA</h2>
                {sendStatus === 'success' ? (
                     <div className="text-center p-8">
                        <Check className="h-16 w-16 text-green-400 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-white">Mensagem Enviada!</h3>
                        <p className="text-gray-300 mt-2">Obrigado pelo seu contato. Responderemos em breve!</p>
                        <button onClick={onClose} className="mt-6 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">Fechar</button>
                    </div>
                ) : (
                    <form onSubmit={handleContactSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="subject" className="text-sm font-medium text-purple-200 block mb-2">Assunto</label>
                                <input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="input-glass" />
                            </div>
                             <div>
                                <label htmlFor="message" className="text-sm font-medium text-purple-200 block mb-2">A sua Mensagem</label>
                                <textarea id="message" rows={5} value={message} onChange={e => setMessage(e.target.value)} required className="input-glass resize-none"></textarea>
                            </div>
                        </div>
                        {sendStatus === 'error' && <p className="text-red-400 text-sm mt-4">Ocorreu um erro ao enviar. Tente novamente.</p>}
                        <div className="mt-6 flex justify-end">
                            <button type="submit" disabled={isSending} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-purple-700 disabled:opacity-50">
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                {isSending ? 'A Enviar...' : 'Enviar Mensagem'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

