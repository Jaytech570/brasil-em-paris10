



import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Briefcase, MapPin, ArrowRight, Trash2, ShoppingBag, 
  MessageCircle, Map as MapIcon, LayoutDashboard, 
  Heart, Star, Search, Award, 
  Building2, Sparkles, Loader2, LogIn, LogOut, User,
  AlertTriangle, Globe, Clock, ThermometerSun, PlusCircle
} from 'lucide-react';
import { TabType, Job, Place, MarketItem } from './types';
import { parseImportText } from './services/geminiService';
import { supabase, isConfigured } from './supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.HOME);
  const [view, setView] = useState<'client' | 'admin' | 'login'>('client');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState<MarketItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const init = async () => {
      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        await loadData();
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadData = async () => {
    const [m, j, p] = await Promise.all([
      supabase.from('market_items').select('*').order('is_premium', { ascending: false }),
      supabase.from('jobs').select('*').order('is_premium', { ascending: false }),
      supabase.from('places').select('*').order('is_premium', { ascending: false })
    ]);
    if (m.data) setMarket(m.data);
    if (j.data) setJobs(j.data);
    if (p.data) setPlaces(p.data);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brasil em Paris</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8FAFC] relative shadow-2xl overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-6 py-5 flex items-center justify-between safe-pt">
        <div className="flex items-center gap-3" onClick={() => { setView('client'); setActiveTab(TabType.HOME); }}>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <div>
            <h1 className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Paris Connection</h1>
            <p className="text-[8px] text-green-600 font-bold uppercase tracking-widest">Premium v4.5</p>
          </div>
        </div>
        
        <button onClick={() => setView(user ? (view === 'admin' ? 'client' : 'admin') : 'login')} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
          {user ? <LayoutDashboard size={20} /> : <User size={20} />}
        </button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {view === 'login' && <LoginView onBack={() => setView('client')} />}
        {view === 'admin' && user && <AdminPanel onRefresh={loadData} market={market} jobs={jobs} places={places} />}
        {view === 'client' && (
          <>
            {activeTab === TabType.HOME && <HomeView setActiveTab={setActiveTab} marketCount={market.length} jobsCount={jobs.length} />}
            {activeTab === TabType.MARKET && <MarketView items={market} favorites={favorites} toggleFav={toggleFavorite} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
            {activeTab === TabType.JOBS && <JobsView items={jobs} />}
            {activeTab === TabType.PLACES && <PlacesView items={places} />}
            {activeTab === TabType.FAVORITES && <FavoritesView market={market} favs={favorites} toggleFav={toggleFavorite} />}
          </>
        )}
      </main>

      {/* TABS */}
      {view === 'client' && (
        <nav className="bg-white/95 backdrop-blur-2xl border-t border-slate-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around items-center pt-3 pb-safe-bottom z-50 rounded-t-[2rem] shadow-xl">
          <TabItem icon={<HomeIcon />} label="Home" active={activeTab === TabType.HOME} onClick={() => setActiveTab(TabType.HOME)} />
          <TabItem icon={<ShoppingBag />} label="Serviços" active={activeTab === TabType.MARKET} onClick={() => setActiveTab(TabType.MARKET)} />
          <TabItem icon={<Briefcase />} label="Vagas" active={activeTab === TabType.JOBS} onClick={() => setActiveTab(TabType.JOBS)} />
          <TabItem icon={<MapIcon />} label="Guia" active={activeTab === TabType.PLACES} onClick={() => setActiveTab(TabType.PLACES)} />
          <TabItem icon={<Heart />} label="Salvos" active={activeTab === TabType.FAVORITES} onClick={() => setActiveTab(TabType.FAVORITES)} />
        </nav>
      )}
    </div>
  );
};

// --- VIEWS ---

const HomeView = ({ setActiveTab, marketCount, jobsCount }: any) => (
  <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      <StatusItem icon={<Clock size={12}/>} label="Agora" value="14:30" />
      <StatusItem icon={<ThermometerSun size={12}/>} label="Clima" value="19°C" />
      <StatusItem icon={<Globe size={12}/>} label="Euro" value="R$ 6,10" />
    </div>

    <div className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent p-8 flex flex-col justify-end">
        <h2 className="text-white text-3xl font-black leading-tight tracking-tighter">Sua nova vida na França começa aqui.</h2>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <HomeCard icon={<ShoppingBag />} title="Serviços" count={marketCount} color="bg-indigo-600" onClick={() => setActiveTab(TabType.MARKET)} />
      <HomeCard icon={<Briefcase />} title="Vagas" count={jobsCount} color="bg-orange-500" onClick={() => setActiveTab(TabType.JOBS)} />
    </div>

    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl">
      <div className="space-y-1">
        <h3 className="font-black text-xl tracking-tight">Postar Anúncio</h3>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Fale com um administrador</p>
      </div>
      {/* Fix: PlusCircle is now imported from lucide-react */}
      <button className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg"><PlusCircle size={24}/></button>
    </div>
  </div>
);

const MarketView = ({ items, favorites, toggleFav, searchTerm, setSearchTerm }: any) => {
  const filtered = items.filter((i: any) => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Classificados</h2>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="O que você precisa?" 
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-sm focus:border-green-500 outline-none" 
        />
      </div>
      <div className="space-y-4">
        {filtered.map((item: any) => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm space-y-4">
             <div className="flex justify-between items-start">
               <div>
                 <span className="text-[8px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">{item.category}</span>
                 <h4 className="font-black text-lg text-slate-900 mt-2">{item.title}</h4>
               </div>
               <button onClick={() => toggleFav(item.id)} className={`p-2 rounded-lg ${favorites.includes(item.id) ? 'text-red-500 bg-red-50' : 'text-slate-200'}`}>
                 <Heart size={20} fill={favorites.includes(item.id) ? "currentColor" : "none"} />
               </button>
             </div>
             <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
             <div className="flex items-center justify-between pt-4 border-t border-slate-50">
               <span className="font-black text-slate-900">{item.price || 'Consultar'}</span>
               <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md">
                 <MessageCircle size={14} /> WhatsApp
               </a>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const JobsView = ({ items }: any) => (
  <div className="p-6 space-y-6">
    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Vagas de Emprego</h2>
    {items.map((j: any) => (
      <div key={j.id} className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm space-y-6">
        <div>
          <h4 className="font-black text-xl text-slate-900">{j.title}</h4>
          <div className="flex gap-2 mt-3">
            <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-widest">{j.company}</span>
            <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-widest">{j.location}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl flex justify-between">
           <span className="text-[10px] font-black text-slate-400 uppercase">Salário</span>
           <span className="text-[10px] font-black text-indigo-600">{j.salary || 'A combinar'}</span>
        </div>
        <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">Ver Detalhes <ArrowRight size={14}/></button>
      </div>
    ))}
  </div>
);

const PlacesView = ({ items }: any) => (
  <div className="p-6 space-y-6">
    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Guia de Lugares</h2>
    {items.map((p: any) => (
      <div key={p.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-lg">
        <div className="h-48 relative">
          <img src={p.image_url} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl flex items-center gap-1">
            <Star size={12} fill="#EAB308" className="text-yellow-500" />
            <span className="text-[10px] font-black">{p.rating}</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <h4 className="text-xl font-black text-slate-900">{p.name}</h4>
          <p className="text-xs text-slate-500 italic">"{p.description}"</p>
          <a href={p.maps_url} target="_blank" className="w-full py-4 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <MapPin size={16} /> Ver no Mapa
          </a>
        </div>
      </div>
    ))}
  </div>
);

const FavoritesView = ({ market, favs, toggleFav }: any) => {
  const items = market.filter((m: any) => favs.includes(m.id));
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Favoritos</h2>
      {items.length === 0 ? (
        <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
          <Heart size={48} />
          <p className="text-xs font-black uppercase tracking-widest">Nenhum item salvo</p>
        </div>
      ) : (
        items.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between shadow-sm">
             <div>
               <h5 className="font-black text-slate-900 text-sm">{item.title}</h5>
               <p className="text-[8px] font-bold text-slate-300 uppercase">{item.category}</p>
             </div>
             <button onClick={() => toggleFav(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
          </div>
        ))
      )}
    </div>
  );
};

// --- COMPONENTS ---

const TabItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 pb-2 transition-all ${active ? 'text-green-800' : 'text-slate-300'}`}>
    <div className={`p-2.5 rounded-xl transition-all ${active ? 'bg-green-50 scale-110 shadow-inner' : ''}`}>
      {React.cloneElement(icon, { size: 20, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-tighter transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

const StatusItem = ({ icon, label, value }: any) => (
  <div className="bg-white border border-slate-50 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm min-w-fit">
    <div className="text-slate-300">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-black text-slate-900">{value}</span>
    </div>
  </div>
);

const HomeCard = ({ icon, title, count, color, onClick }: any) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2rem] text-left border border-slate-50 shadow-sm active:scale-95 transition-all group">
    <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <h4 className="font-black text-slate-900 text-sm">{title}</h4>
    <p className="text-[9px] text-slate-300 font-bold uppercase mt-0.5">{count} Ativos</p>
  </button>
);

const LoginView = ({ onBack }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [load, setLoad] = useState(false);

  const handle = async (e: any) => {
    e.preventDefault();
    setLoad(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro ao entrar");
    else onBack();
    setLoad(false);
  };

  return (
    <div className="p-10 flex flex-col justify-center min-h-[70vh] space-y-10">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white rotate-6 shadow-xl"><User size={32}/></div>
        <h2 className="text-3xl font-black tracking-tighter">Painel Admin</h2>
      </div>
      <form onSubmit={handle} className="space-y-4">
        <input type="email" placeholder="E-mail" className="w-full p-4 rounded-xl border border-slate-100 bg-white font-bold text-sm outline-none focus:border-green-500 shadow-sm" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" className="w-full p-4 rounded-xl border border-slate-100 bg-white font-bold text-sm outline-none focus:border-green-500 shadow-sm" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button disabled={load} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
          {load ? <Loader2 className="animate-spin" size={16}/> : <LogIn size={16}/>} Acessar
        </button>
        <button type="button" onClick={onBack} className="w-full text-[8px] font-black text-slate-300 uppercase tracking-widest">Voltar para o Início</button>
      </form>
    </div>
  );
};

const AdminPanel = ({ onRefresh, market, jobs, places }: any) => {
  const [text, setText] = useState('');
  const [load, setLoad] = useState(false);

  const handleIA = async () => {
    setLoad(true);
    const result = await parseImportText(text);
    if (result) {
      const table = result.type === 'market' ? 'market_items' : (result.type === 'job' ? 'jobs' : 'places');
      const { error } = await supabase.from(table).insert([{ ...result.data, is_premium: false }]);
      if (error) alert(error.message);
      else {
        onRefresh();
        setText('');
        alert("Publicado com sucesso!");
      }
    }
    setLoad(false);
  };

  return (
    <div className="p-6 space-y-8 pb-40">
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <h2 className="font-black text-xl tracking-tighter leading-tight">Gestão de Conteúdo</h2>
        <button onClick={() => supabase.auth.signOut()} className="p-3 bg-white/10 rounded-xl"><LogOut size={20}/></button>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg space-y-6">
        <div className="flex items-center gap-3 text-indigo-600">
          <Sparkles size={24}/>
          <h3 className="font-black tracking-tighter">Publicar com IA</h3>
        </div>
        <textarea 
          placeholder="Cole aqui o texto bruto do anúncio (ex: Procuro babá para Paris 15...)"
          className="w-full h-40 bg-slate-50 rounded-xl p-4 text-xs font-medium border-none outline-none focus:ring-2 focus:ring-indigo-500"
          value={text} onChange={e=>setText(e.target.value)}
        />
        <button onClick={handleIA} disabled={load || !text} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
          {load ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>} Processar e Publicar
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Recém Adicionados</h4>
        {[...market, ...jobs, ...places].slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-50 flex justify-between items-center shadow-sm">
            <p className="font-black text-xs text-slate-900 truncate flex-1 pr-4">{m.title || m.name}</p>
            <button onClick={async () => {
              const table = m.company ? 'jobs' : (m.category ? 'market_items' : 'places');
              await supabase.from(table).delete().eq('id', m.id);
              onRefresh();
            }} className="p-2 text-red-400"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
