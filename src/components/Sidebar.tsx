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
  Award
} from "lucide-react";
import { ChatSession } from "../types";
// @ts-ignore
import logoImg from "../assets/images/velox_ai_logo_1781334265901.jpg";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchGroundingEnabled: boolean;
  onToggleSearchGrounding: () => void;
  secondsLeft: number;
  isPremium?: boolean;
  onOpenPremium?: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  setIsOpen,
  searchGroundingEnabled,
  onToggleSearchGrounding,
  secondsLeft,
  isPremium = false,
  onOpenPremium
}: SidebarProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
          <div className="px-3 mb-2 text-[11px] font-bold text-[#676767] uppercase tracking-wider font-display">
            Recent
          </div>
          
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <MessageSquare className="h-6 w-6 text-[#676767] mb-2 stroke-1" />
              <p className="text-xs text-[#b4b4b4] font-display">Tarix hozircha bo'sh</p>
            </div>
          ) : (
            sessions.map((session) => {
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
                  <span className="truncate text-sm pr-6 leading-tight select-none">
                    {session.title || "Yangi suhbat"}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteClick(e, session.id)}
                    className={`absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-[#676767] hover:text-red-400 hover:bg-[#2f2f2f]/60 ${
                      isConfirming ? "opacity-100 text-red-400 bg-red-950/20" : ""
                    }`}
                    title={isConfirming ? "O'chirishni tasdiqlang" : "Suhbatni o'chirish"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  
                  {isConfirming && (
                    <span className="absolute right-8 text-[10px] bg-red-950/40 text-red-200 px-1.5 py-0.5 rounded font-display animate-pulse">
                      Tasdiqlang
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Kunlik foydalanish limiti card */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717]">
          {isPremium ? (
            <div className="rounded-lg bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent p-3.5 border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-1 right-2">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4.5 w-4.5 text-amber-400 fill-amber-400/20" />
                <div className="leading-none">
                  <span className="block text-xs font-bold text-amber-400 font-display uppercase tracking-wide">Premium Faol</span>
                  <span className="text-[9px] text-[#b4b4b4]">Cheksiz vaqt & savol</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] text-[#b4b4b4]">Suhbat vaqti:</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  CHEKSIZ ♾️
                </span>
              </div>

              <div className="w-full bg-[#1c1c1c] h-1 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-amber-400 to-yellow-300" />
              </div>

              <p className="text-[9px] text-[#b4b4b4]/90 mt-2 leading-relaxed">
                Premium tarif faol! Barcha savollaringiz ustuvor tezlikda cheksiz qayta ishlanadi.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-[#212121]/40 p-3.5 border border-[#2f2f2f]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`h-4 w-4 ${secondsLeft > 0 ? "text-amber-500 animate-pulse" : "text-rose-500"}`} />
                <div className="leading-none">
                  <span className="block text-xs font-semibold text-[#ececec] font-display">Tafakkur Limiti</span>
                  <span className="text-[10px] text-[#676767]">Kuniga 3 soat</span>
                </div>
              </div>

              {/* Time Countdown Display */}
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] text-[#b4b4b4]">Mavjud vaqt:</span>
                <span className={`text-xs font-mono font-bold ${secondsLeft > 0 ? "text-amber-400" : "text-rose-500 animate-pulse"}`}>
                  {secondsLeft > 0 ? (() => {
                    const hrs = Math.floor(secondsLeft / 3600);
                    const mins = Math.floor((secondsLeft % 3600) / 60);
                    const secs = secondsLeft % 60;
                    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                  })() : "00:00:00"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1c1c1c] rounded-full h-1 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    secondsLeft > 3600 
                      ? "bg-[#d4a373]" 
                      : secondsLeft > 0 
                        ? "bg-amber-500" 
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (secondsLeft / 10800) * 100))}%` }}
                />
              </div>

              {/* Hint message matching "lekin soralgan hamma savolga javob bersin" */}
              <p className="text-[9px] text-[#676767] mt-2 leading-relaxed">
                {secondsLeft > 0 
                  ? "Suhbatingiz davomida bu vaqt kamayib boradi." 
                  : "Asosiy limit yakunlandi, lekin premium sovg'a sifatida xizmatimiz cheksiz va to'liq davom etmoqda!"}
              </p>

              {onOpenPremium && (
                <button
                  type="button"
                  onClick={onOpenPremium}
                  className="mt-3 w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 py-2 text-[11px] font-bold text-black shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Sparkles className="h-3 w-3 fill-black text-black" />
                  Cheksiz Rejimni Ochish ($2)
                </button>
              )}
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

        {/* Sidebar Footer Information */}
        <div className="p-4 border-t border-[#2f2f2f] bg-[#171717] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border font-bold uppercase text-xs shrink-0 ${
              isPremium 
                ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-black border-yellow-400 shadow-md animate-pulse font-extrabold" 
                : "bg-[#4e4e4e] text-white border-[#2f2f2f]"
            }`}>
              U
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-[#ececec] font-display">
                Foydalanuvchi
              </p>
              <p className={`truncate text-[9.5px] font-mono ${isPremium ? "text-amber-400 font-bold" : "text-[#676767]"}`}>
                {isPremium ? "VIP Premium" : "Oddiy Foydalanuvchi"}
              </p>
            </div>
          </div>
          
          {!isPremium && onOpenPremium && (
            <button
              onClick={onOpenPremium}
              className="p-1 px-1.5 rounded-md text-[#b4b4b4] hover:text-amber-400 hover:bg-[#212121] transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
              title="Premiumga o'tish"
            >
              <Sparkles className="h-3 w-3" /> Get
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
