'use client';

import { useState, FormEvent, ChangeEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // MUDANÇA IMPORTANTE AQUI
import { Session } from '@supabase/supabase-js';
import {
  Camera,
  LogOut,
  Store,
  MessageCircle,
  X,
  Loader2,
  Check,
  Instagram,
  Github,
  Send,
  MessageSquare,
  Eye,
  AtSign
} from 'lucide-react';
import Link from 'next/link';

// Tipagem para o perfil do utilizador atualizada
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

// Componente para o Balão de Status (sem alterações)
const StatusBubble = ({ initialStatus, onSave }: { initialStatus: string, onSave: (newStatus: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (status.trim() !== initialStatus) onSave(status.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
        <input
          ref={inputRef}
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg bg-white/20 p-3 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
    );
  }

  return (
    <div
      className="relative w-full cursor-pointer rounded-xl bg-purple-600/80 p-3 shadow-md transition-colors hover:bg-purple-600/100"
      onClick={() => setIsEditing(true)}
    >
      <p className="italic text-white/90">{initialStatus || 'Clique para definir um status...'}</p>
      <div className="absolute top-1/2 -left-2 h-0 w-0 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-purple-600/80"></div>
    </div>
  );
};

export default function DashboardClient({ session, profile: initialProfile }: { session: Session; profile: Profile | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [username, setUsername] = useState(initialProfile?.username || '');
  const [profileData, setProfileData] = useState({
    first_name: initialProfile?.first_name || '',
    last_name: initialProfile?.last_name || '',
    gender: initialProfile?.gender || '',
    course: initialProfile?.course || '',
    neighborhood: initialProfile?.neighborhood || '',
    sexual_orientation: initialProfile?.sexual_orientation || '',
  });

  const [socials, setSocials] = useState({
    social_telegram: initialProfile?.social_telegram || '',
    social_instagram: initialProfile?.social_instagram || '',
    social_steam: initialProfile?.social_steam || '',
    social_github: initialProfile?.social_github || '',
    social_whatsapp: initialProfile?.social_whatsapp || '',
  });

  const user = session.user;

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setUsername(sanitized);
  }

  const handleProfileDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSocialsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocials(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactStatus('sending');
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    const userNameForContact = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || user.email;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userEmail: user.email, userName: userNameForContact }),
      });
      if (!response.ok) throw new Error('Falha ao enviar e-mail.');
      setContactStatus('success');
      setTimeout(() => { setContactModalOpen(false); setContactStatus('idle'); }, 2000);
    } catch (error) {
      console.error(error);
      setContactStatus('error');
    }
  };

  const updateProfileField = async (field: keyof Profile, value: any) => {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, [field]: value, updated_at: new Date() });
    
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };
  
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!username) {
        alert("O nome de utilizador é obrigatório.");
        return;
    }
    setLoading(true);
    setSaveStatus('idle');

    const updates = {
      id: user.id,
      username,
      ...profileData,
      ...socials,
      updated_at: new Date(),
    };
    
    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      if(error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')){
          alert("Este nome de utilizador já está em uso. Por favor, escolha outro.");
      } else {
        console.error("Erro ao salvar no Supabase:", error);
      }
      setSaveStatus('error');
    } else {
      setSaveStatus('success');
    }
    setLoading(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setLoading(true);
      const file = event.target.files[0];
      const filePath = `${user.id}-${Date.now()}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfileField('avatar_url', publicUrl);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const ContactModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-indigo-900/80 p-6 shadow-2xl">
        <button onClick={() => setContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"> <X className="h-6 w-6" /> </button>
        <h2 className="text-xl font-bold mb-4">Fale com a gente</h2>
        <form onSubmit={handleContactSubmit}>
          <textarea name="message" placeholder="Digite sua mensagem aqui..." required rows={5} className="w-full rounded-lg bg-white/10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={contactStatus === 'sending'}></textarea>
          <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-base font-semibold transition-all hover:bg-purple-700 disabled:opacity-50" disabled={contactStatus === 'sending' || contactStatus === 'success'}>
            {contactStatus === 'sending' && <Loader2 className="h-5 w-5 animate-spin" />}
            {contactStatus === 'idle' && 'Enviar Mensagem'}
            {contactStatus === 'success' && <Check className="h-5 w-5" />}
            {contactStatus === 'error' && 'Tentar Novamente'}
          </button>
           {contactStatus === 'error' && <p className="text-red-400 text-sm mt-2 text-center">Ocorreu um erro. Tente novamente.</p>}
        </form>
      </div>
    </div>
  );

  return (
    <>
      {isContactModalOpen && <ContactModal />}
      <main className="min-h-screen w-full bg-gradient-to-br from-indigo-900 to-purple-900 p-4 sm:p-6 lg:p-8 text-white">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Meu Painel de Edição</h1>
            <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg bg-red-500/50 px-3 py-2 text-sm font-semibold transition-colors hover:bg-red-500/80"> <LogOut className="h-4 w-4" /> Sair </button>
          </header>

          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              <div className="lg:col-span-1 flex flex-col items-center gap-4">
                <div className="relative group">
                    <img src={initialProfile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`} alt="Foto de Perfil" className="h-32 w-32 rounded-full object-cover border-4 border-purple-400 shadow-lg"/>
                    <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <Camera className="h-8 w-8 text-white"/>
                      <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={loading} />
                    </label>
                </div>
                <div className="w-full relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    <input name="username" type="text" value={username} onChange={handleUsernameChange} placeholder="nome_de_utilizador" required className="w-full rounded-lg bg-white/10 p-3 pl-10 text-center font-mono placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-purple-500"/>
                </div>
                 <div className="w-full mt-4">
                    <StatusBubble initialStatus={initialProfile?.status_text || ''} onSave={(newStatus) => updateProfileField('status_text', newStatus)}/>
                </div>
              </div>

              <div className="lg:col-span-1 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
                <h2 className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">Dados Pessoais</h2>
                <div className="space-y-4">
                  <input name="first_name" value={profileData.first_name} onChange={handleProfileDataChange} className="w-full rounded-lg bg-white/10 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Nome"/>
                  <input name="last_name" value={profileData.last_name} onChange={handleProfileDataChange} className="w-full rounded-lg bg-white/10 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Sobrenome"/>
                  <input name="course" value={profileData.course} onChange={handleProfileDataChange} className="w-full rounded-lg bg-white/10 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Curso (ex: Sistemas de Informação)"/>
                  <input name="neighborhood" value={profileData.neighborhood} onChange={handleProfileDataChange} className="w-full rounded-lg bg-white/10 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Bairro"/>
                  <input name="gender" value={profileData.gender} onChange={handleProfileDataChange} className="w-full rounded-lg bg-white/10 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Gênero"/>
                  <input name="sexual_orientation" value={profileData.sexual_orientation} onChange={handleProfileDataChange} className="w-full rounded-lg bg-white/10 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Orientação Sexual"/>
                </div>
              </div>

              <div className="lg:col-span-1 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
                <h2 className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">Redes Sociais</h2>
                <div className="space-y-4">
                   <div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input name="social_instagram" value={socials.social_instagram} onChange={handleSocialsChange} className="w-full rounded-lg bg-white/10 p-3 pl-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="@usuario"/></div>
                   <div className="relative"><Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input name="social_github" value={socials.social_github} onChange={handleSocialsChange} className="w-full rounded-lg bg-white/10 p-3 pl-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="usuario"/></div>
                   <div className="relative"><Send className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input name="social_telegram" value={socials.social_telegram} onChange={handleSocialsChange} className="w-full rounded-lg bg-white/10 p-3 pl-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="@usuario"/></div>
                   <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+55</span><input name="social_whatsapp" value={socials.social_whatsapp} onChange={handleSocialsChange} className="w-full rounded-lg bg-white/10 p-3 pl-12 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="21987654321"/></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex flex-wrap gap-4">
                    <Link href={username ? `/perfil/${username}` : '#'} className={`flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 font-semibold transition-colors hover:bg-white/30 ${!username ? 'cursor-not-allowed opacity-50' : ''}`}>
                      <Eye className="h-5 w-5"/> Ver meu Perfil
                    </Link>
                    <button type="button" onClick={() => {}} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 font-semibold transition-colors hover:bg-white/30"> <Store className="h-5 w-5"/> Lojinha do CA </button>
                    <button type="button" onClick={() => setContactModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 font-semibold transition-colors hover:bg-white/30"> <MessageCircle className="h-5 w-5"/> Fale com a gente </button>
                 </div>
                 <div className="flex items-center gap-4">
                    {saveStatus === 'success' && <span className="text-green-400 flex items-center gap-2"><Check/> Salvo com sucesso!</span>}
                    {saveStatus === 'error' && <span className="text-red-400">Erro ao salvar.</span>}
                    <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100" disabled={loading}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : 'Salvar Todas as Alterações'}
                    </button>
                 </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

