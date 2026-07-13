import React, { useState } from "react";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  Compass, 
  Bot, 
  Sparkles, 
  Github,
  Globe,
  Clock,
  Award,
  Archive,
  ArchiveRestore,
  ShieldAlert,
  Database,
  LogOut,
  LogIn
} from "lucide-react";
import { ChatSession, UserProfile } from "../types";
// @ts-ignore
import logoImg from "../assets/images/velox_ai_logo_1781334265901.jpg";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onToggleArchiveSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchGroundingEnabled: boolean;
  onToggleSearchGrounding: () => void;
  secondsLeft: number;
  isPremium?: boolean;
  onOpenPremium?: () => void;
  isSupabaseConnected?: boolean;
  userProfile?: UserProfile | null;
  onGoogleLogin?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onToggleArchiveSession,
  isOpen,
  setIsOpen,
  searchGroundingEnabled,
  onToggleSearchGrounding,
  secondsLeft,
  isPremium = false,
  onOpenPremium,
  isSupabaseConnected = false,
  userProfile = null,
  onGoogleLogin,
  onLogout
}: SidebarProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [recentTab, setRecentTab] = useState<"active" | "archived">("active");
  const [showSupabaseHelp, setShowSupabaseHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    if (recentTab === "active") {
      return !s.isArchived;
    } else {
      return !!s.isArchived;
    }
  });

  const archivedCount = sessions.filter(s => s.isArchived).length;

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteSession(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  // Reset delete confirmation on leave
  const handleMouseLeave = () => {
    setConfirmDeleteId(null);
  };

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-[#2f2f2f] bg-[#171717] text-[#ececec] transition-all duration-300 shrink-0
          md:static md:translate-x-0 
          ${isOpen 
            ? "translate-x-0 w-72 opacity-100 border-r" 
            : "-translate-x-full md:-translate-x-0 md:w-0 md:opacity-0 md:border-r-0 overflow-hidden"
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#2f2f2f] bg-[#171717]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden border border-[#2f2f2f] shadow-xs">
              <img src={logoImg} alt="VeloxAi" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="font-display font-semibold tracking-tight text-[#ececec] text-sm">
                VeloxAi
              </h1>
              <span className="text-[9px] font-mono text-[#676767] uppercase tracking-widest font-semibold block">
                Geometric UI
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-[#b4b4b4] hover:bg-[#212121] hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              // Close on mobile after click
              if (window.innerWidth < 768) {
                setIsOpen(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2f2f2f] bg-transparent px-4 py-3 font-display text-sm font-medium text-[#ececec] transition-all hover:bg-[#212121] active:scale-98"
          >
            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
              <Plus className="h-3 w-3 text-black stroke-[3]" />
            </div>
            Yangi Chat Boshlash
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-3 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#676767] uppercase tracking-wider font-display">
              Recent
            </span>
            <div className="flex bg-[#232323] rounded-lg p-0.5 border border-[#2e2e2e] text-[10px]/none font-semibold">
              <button
                type="button"
                onClick={() => setRecentTab("active")}
                className={`px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                  recentTab === "active"
                    ? "bg-[#313131] text-white shadow-sm"
                    : "text-[#8e8e8e] hover:text-white"
                }`}
              >
                Aktiv
              </button>
              <button
                type="button"
                onClick={() => setRecentTab("archived")}
                className={`px-2 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  recentTab === "archived"
                    ? "bg-[#313131] text-white shadow-sm"
                    : "text-[#8e8e8e] hover:text-white"
                }`}
              >
                Arxiv
                {archivedCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 font-extrabold rounded-full text-[8px]">
                    {archivedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageSquare className="h-6 w-6 text-[#4c4c4c] mb-2 stroke-1" />
              <p className="text-xs text-[#8e8e8e] font-display font-medium">
                {recentTab === "active" ? "Aktiv suhbatlar yo'q" : "Arxivlangan suhbatlar yo'q"}
              </p>
              <p className="text-[10px] text-[#555555] mt-1">
                {recentTab === "active" ? "Yangi chat yaratib suhbatni boshlang" : "Suhbatlarni bu yerga arxivlashingiz mumkin"}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isConfirming = confirmDeleteId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-[#212121] text-white border-l-2 border-white"
                      : "text-[#b4b4b4] hover:bg-[#212121]/50 hover:text-white"
                  }`}
                >
                  <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#676767]'}`} />
                  <span className="truncate text-sm pr-14 leading-tight select-none">
                    {session.title || "Yangi suhbat"}
                  </span>

                  {/* Actions Toolbed */}
                  <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                    {/* Archive / Restore Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleArchiveSession(session.id);
                      }}
                      className="p-1 rounded-md text-[#676767] hover:text-amber-400 hover:bg-[#2f2f2f]/60 transition-colors"
                      title={session.isArchived ? "Faollashtirish (Arxivdan chiqarish)" : "Arxivlash"}
                    >
                      {session.isArchived ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteClick(e, session.id)}
                      className={`p-1 rounded-md text-[#676767] hover:text-red-400 hover:bg-[#2f2f2f]/60 transition-colors ${
                        isConfirming ? "text-red-400 bg-red-950/20" : ""
                      }`}
                      title={isConfirming ? "O'chirishni tasdiqlang" : "Suhbatni o'chirish"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  {isConfirming && (
                     <span className="absolute right-14 text-[9px] bg-red-950/60 text-red-200 px-1.5 py-0.5 rounded font-display animate-pulse font-medium z-10">
                       Tasdiqlang
                     </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Velox AI Subscription Status Banner */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717]">
          {isPremium ? (
            <div className="rounded-lg bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-[#171717] p-3.5 border border-amber-500/30 flex items-center gap-3">
              <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0 fill-amber-400/20" />
              <div className="leading-tight min-w-0 flex-1">
                <span className="block text-xs font-semibold text-amber-400 font-display">Premium Tarif Faol</span>
                <span className="text-[10px] text-[#b4b4b4] block truncate">Cheksiz muloqot va vaqt</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#212121]/40 p-3 border border-[#2f2f2f] space-y-2">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-slate-400 shrink-0 animate-pulse" />
                <div className="leading-tight min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-white font-display">Oddiy Tarif (Free)</span>
                  <p className="text-[10px] font-mono text-amber-400 font-medium tracking-wide">
                    {secondsLeft > 0 ? (
                      `${Math.floor(secondsLeft / 3600)} soat ${Math.floor((secondsLeft % 3600) / 60)} daqiqa qoldi`
                    ) : (
                      "Bugungi limit tugadi ⏱️"
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenPremium}
                className="w-full text-center py-2 px-2.5 rounded-lg bg-amber-500 text-black hover:bg-amber-600 active:scale-97 text-xs font-bold font-display transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Premiumga o'tish</span>
                <span className="text-[9.5px] font-extrabold opacity-95">($3/oy)</span>
              </button>
            </div>
          )}
        </div>

        {/* Google Search Grounding toggle */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717]">
          <div className="flex items-center justify-between rounded-lg bg-[#212121] p-3 border border-[#2f2f2f]">
            <div className="flex items-center gap-2">
              <Globe className={`h-4 w-4 ${searchGroundingEnabled ? "text-white animate-pulse" : "text-[#676767]"}`} />
              <div className="leading-tight">
                <span className="block text-xs font-semibold text-[#ececec]">Google Qidiruv</span>
                <span className="text-[9px] text-[#676767]">Jonli ma'lumotlar</span>
              </div>
            </div>
            <button
              onClick={onToggleSearchGrounding}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                searchGroundingEnabled ? "bg-white" : "bg-[#4e4e4e]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${
                  searchGroundingEnabled ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Supabase connection status indicator */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717] space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-[#212121] p-3 border border-[#2f2f2f]">
            <div className="flex items-center gap-2">
              <Database className={`h-4 w-4 ${isSupabaseConnected ? "text-emerald-400" : "text-[#676767]"}`} />
              <div className="leading-tight">
                <span className="block text-xs font-semibold text-[#ececec]">Supabase Buluti</span>
                <span className={`text-[9px] ${isSupabaseConnected ? "text-emerald-400 font-semibold" : "text-[#676767]"}`}>
                  {isSupabaseConnected ? "Muvaffaqiyatli ulangan ✓" : "Lokal variantda ishlayapti"}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowSupabaseHelp(!showSupabaseHelp)}
              className="text-[10px] text-amber-400 hover:underline cursor-pointer border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 rounded px-1.5 py-0.5 transition-all text-center select-none"
            >
              Info
            </button>
          </div>

          {showSupabaseHelp && (
            <div className="rounded-lg bg-[#1a1a1a] p-3 border border-[#2f2f2f] text-left space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white text-[11px]">Supabase Integration</p>
                <button 
                  onClick={() => setShowSupabaseHelp(false)}
                  className="text-[9px] text-[#8e8e8e] hover:text-white"
                >
                  Yopish
                </button>
              </div>
              <p className="text-[10px] text-[#b4b4b4] leading-relaxed">
                Ushbu loyiha Supabase orqali bulutli ma'lumotlar omborini qo'llab-quvvatlaydi. Sirlar bo'limiga VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni kiriting.
              </p>
              <div className="space-y-1">
                <span className="text-[9px] text-[#676767] uppercase block font-bold tracking-wider">Loyiha Jadvali:</span>
                <div className="relative">
                  <pre className="text-[8.5px] bg-[#212121] p-2 rounded text-yellow-200/90 font-mono overflow-x-auto max-h-24">
                    {`create table velox_sessions (
  id text primary key,
  title text not null,
  preset_id text not null,
  search_grounding_enabled boolean not null default false,
  is_archived boolean not null default false,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`create table velox_sessions (
  id text primary key,
  title text not null,
  preset_id text not null,
  search_grounding_enabled boolean not null default false,
  is_archived boolean not null default false,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="absolute top-1.5 right-1.5 text-[8.5px] bg-[#2f2f2f] text-white px-1.5 py-0.5 rounded hover:bg-[#3e3e3e]"
                  >
                    {copiedSql ? "Nusxalandi! ✓" : "Nusxalash"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Information */}
        <div className="p-4 border-t border-[#2f2f2f] bg-[#171717] space-y-3">
          {userProfile ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {userProfile.picture ? (
                  <img
                    src={userProfile.picture}
                    alt={userProfile.name}
                    className="h-8 w-8 rounded-full object-cover border border-[#2f2f2f]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border font-bold uppercase text-xs shrink-0 bg-[#4e4e4e] text-white border-[#2f2f2f]`}>
                    {userProfile.name ? userProfile.name.charAt(0) : "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-semibold text-[#ececec] font-display">
                    {userProfile.name}
                  </p>
                  <p className="truncate text-[9.5px] font-mono text-[#676767]">
                    {userProfile.email}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#676767] hover:text-red-400 hover:bg-[#212121] transition-colors cursor-pointer shrink-0"
                title="Tizimdan chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-neutral-100 text-black px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38C16.88,15.22,14.83,16.5,12,16.5c-3.03,0-5.6-2.05-6.52-4.8c-0.23-0.69-0.36-1.43-0.36-2.2 s0.13-1.51,0.36-2.2C6.4,4.55,8.97,2.5,12,2.5c1.8,0,3.42,0.67,4.68,1.77L18.8,2.15C17,0.82,14.65,0,12,0 C7.33,0,3.31,3.01,1.83,7.18C1.29,8.71,1,10.32,1,12s0.29,3.29,0.83,4.82C3.31,20.99,7.33,24,12,24c4.8,0,8.4-1.95,10.15-4.82 c0.94-1.54,1.35-3.41,1.35-5.08C23.5,13.1,23.4,12.1,21.35,11.1z" fill="#4285F4"/>
              </svg>
              <span>Google orqali ulanish</span>
            </button>
          )}

          {/* Status Indicator Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232323]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block w-2 h-2 rounded-full shrink-0 bg-emerald-500"></span>
              <span className="text-[10px] text-[#8e8e8e] font-display font-medium truncate">
                Velox AI Server: Onlayn
              </span>
            </div>
            <span className="text-[9.5px] font-bold text-emerald-400 uppercase select-none font-mono">
              Aktiv
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
