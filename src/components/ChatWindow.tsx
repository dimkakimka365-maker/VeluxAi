import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Globe, 
  Image as ImageIcon, 
  X, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  Code,
  ArrowRight,
  File,
  FileText,
  FileSpreadsheet,
  Paperclip,
  Clock
} from "lucide-react";
import Markdown from "react-markdown";
import { ChatSession, Message } from "../types";
import AIPresetSelector from "./AIPresetSelector";
import ThreeDVideoStudio from "./ThreeDVideoStudio";
// @ts-ignore
import logoImg from "../assets/images/velox_ai_logo_1781334265901.jpg";

const getFileIcon = (mimeType: string, filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4 text-sky-400" />;
  }
  if (mimeType.startsWith("text/") || ["txt", "json", "md", "ts", "js", "html", "css", "py", "rs", "cpp", "go"].includes(ext || "")) {
    return <FileText className="h-4 w-4 text-emerald-400" />;
  }
  if (["csv", "xlsx", "xls"].includes(ext || "")) {
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  }
  if (ext === "pdf") {
    return <File className="h-4 w-4 text-red-500" />;
  }
  return <File className="h-4 w-4 text-amber-500" />;
};

interface ChatWindowProps {
  session: ChatSession | null;
  onSendMessage: (text: string, image?: string, attachmentName?: string) => void;
  isGenerating: boolean;
  onSelectPreset: (presetId: string) => void;
  error?: string | null;
  isPremium?: boolean;
  onOpenPremium?: () => void;
  secondsLeft?: number;
}

export default function ChatWindow({
  session,
  onSendMessage,
  isGenerating,
  onSelectPreset,
  error,
  isPremium = false,
  onOpenPremium,
  secondsLeft = 10800
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when session messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, session?.messages?.map(m => m.text).join("")]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isGenerating) return;

    const textToSend = inputText.trim() || "Ushbu faylni tahlil qilib bering.";
    onSendMessage(textToSend, attachedFile || undefined, attachedFileName || undefined);
    setInputText("");
    setAttachedFile(null);
    setAttachedFileName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Fayl hajmi juda katta (maksimal 15MB ruxsat etiladi).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile(reader.result as string);
      setAttachedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    setAttachedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileSelection = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speaks aloud the text using browser's SpeechSynthesis API
  const speakText = (text: string, messageId: string) => {
    if ("speechSynthesis" in window) {
      if (speakingMessageId === messageId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }

      window.speechSynthesis.cancel();
      
      const cleanText = text
        .replace(/```[\s\S]*?```/g, "[kod bloki yozilgan]")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replace(/[#*_-]/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "uz-UZ"; 
      
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      
      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };

      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Preset quick starters
  const suggestions = [
    {
      title: "Kod yozish",
      prompt: "React va Tailwind CSS'da animatsiyali chiroyli tugma (Button) komponentini yozib ber.",
      emoji: "💻"
    },
    {
      title: "Insho tuzish",
      prompt: "Sun'iy intellektning insoniyat kelajagiga ta'siri haqida o'zbek tilida insho yozib ber.",
      emoji: "✍️"
    },
    {
      title: "Ingliz tilini o'rganish",
      prompt: "Ingliz tilidagi eng ko'p ishlatiladigan 10 ta iborani ma'nolari va amaliy misollari bilan tushuntir.",
      emoji: "🇬🇧"
    },
    {
      title: "Maslahat",
      prompt: "Dasturlash sohasida 2026-yilda eng kerakli va talabgor bo'ladigan texnologiyalarni sanab ber.",
      emoji: "💡"
    }
  ];

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#212121] text-[#b4b4b4]">
        <div className="h-12 w-12 rounded-full overflow-hidden border border-[#2f2f2f] mb-4 shadow-md">
          <img src={logoImg} alt="VeloxAi" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <h2 className="font-display text-base font-semibold text-[#ececec]">Suhbat topilmadi</h2>
        <p className="text-xs text-[#676767] max-w-sm mt-1 font-display">
          Chap tomondagi suhbatlar ro'yxatidan birortasini tanlang yoki yangi chat boshlang.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-[#212121] relative overflow-hidden text-[#ececec]">
      {/* Geometric accent details (rather than glowing colorful rings) */}
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-[#2f2f2f] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 border-l border-b border-[#2f2f2f] opacity-20 pointer-events-none" />

      {/* Main chat message stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        
        {session.messages.length === 0 ? (
          /* Onboarding Dashboard */
          <div className="max-w-3xl mx-auto py-10 space-y-10">
            {/* Header branding */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden border border-[#2f2f2f] shadow-lg mb-5 relative group">
                <img src={logoImg} alt="VeloxAi" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                VeloxAi
              </h2>
              <p className="text-sm text-[#b4b4b4] max-w-lg font-sans">
                ChatGPT kabi barcha savollarga aniq va muvozanatli javob bera oladigan aqlli yordamchi. Istalgan rolni sozlang va boshlang.
              </p>
            </div>

            {/* Onboarding Premium Banner (Gemini Advanced style) */}
            {!isPremium && onOpenPremium && (
              <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-[#171717] rounded-xl p-5 border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    VeloxAi Premium Rejim
                  </div>
                  <h3 className="font-display text-sm font-bold text-white">Cheksiz vaqt va savollar berish rejimiga o'ting</h3>
                  <p className="text-[11px] text-[#b4b4b4] leading-relaxed">Atiga $2 evaziga 3 soatlik kunlik vaqt cheklovini olib tashlang va uzluksiz tezkor Gemini 2.5 Flash modelidan to'liq erkinlikda foydalaning.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenPremium}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold text-xs px-5 py-3 transition-all active:scale-95 shrink-0 shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  Hammasini ochish <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* AI Preset selector container */}
            <div className="bg-[#171717] rounded-xl p-5 border border-[#2f2f2f] shadow-xl">
              <AIPresetSelector 
                selectedPresetId={session.presetId}
                onSelectPreset={onSelectPreset}
              />
            </div>

            {/* Quick starts cards */}
            <div className="space-y-4">
              <h4 className="font-display text-[11px] font-bold text-[#676767] uppercase tracking-wider text-center">
                Mavzulardan Boshlash
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(s.prompt);
                    }}
                    className="flex flex-col justify-between p-4 rounded-xl bg-[#171717] border border-[#2f2f2f] hover:border-amber-500/50 hover:bg-[#202020] transition-all duration-300 text-left group cursor-pointer hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1 h-[140px] relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl" role="img" aria-label="emoji">
                          {s.emoji}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                      <div className="leading-tight space-y-1">
                        <span className="block text-sm font-semibold text-[#ececec] group-hover:text-white transition-colors font-display">
                          {s.title}
                        </span>
                        <span className="block text-[11px] text-[#8a8a8a] leading-relaxed line-clamp-3">
                          {s.prompt}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active chat stream rendering */
          <div className="max-w-3xl mx-auto space-y-6">
            {session.messages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    isAssistant ? "items-start" : "items-start flex-row-reverse"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#4e4e4e] overflow-hidden ${
                      isAssistant
                        ? "border border-[#2f2f2f]"
                        : "text-white font-bold text-xs uppercase"
                    }`}
                  >
                    {isAssistant ? (
                      <img src={logoImg} alt="VeloxAi" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      "U"
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="flex-1 space-y-1">
                    {/* Role header labels */}
                    <div className={`text-xs font-bold text-[#b4b4b4] ${!isAssistant ? 'text-right' : 'text-left'}`}>
                      {isAssistant ? "VeloxAi" : "Siz"}
                    </div>

                    {/* Optional File/Image Attachment Display */}
                    {message.image && (
                      message.image.startsWith("data:image/") ? (
                        <div className="relative group rounded-xl overflow-hidden max-w-sm border border-[#2f2f2f] bg-[#171717]/50 shadow-lg mt-1">
                          <img
                            src={message.image}
                            alt="birlashtirilgan rasm"
                            className="max-h-60 object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#2f2f2f] bg-[#171717]/80 max-w-sm mt-1">
                          <div className="p-2.5 rounded-lg bg-[#2a2a2a] shrink-0 text-[#ececec]">
                            {getFileIcon(message.image.split(";")[0].replace("data:", ""), message.attachmentName || "fayl")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {message.attachmentName || "Birlashtirilgan fayl"}
                            </p>
                            <p className="text-[10px] text-[#8a8a8a] uppercase font-mono mt-0.5">
                              {message.image.split(";")[0].replace("data:", "").split("/")[1] || "hujjat"}
                            </p>
                          </div>
                          <a
                            href={message.image}
                            download={message.attachmentName || "fayl"}
                            className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#b4b4b4] hover:text-white transition-all scale-100 active:scale-95"
                            title="Yuklab olish"
                          >
                            <ArrowRight className="h-4 w-4 rotate-90" />
                          </a>
                        </div>
                      )
                    )}

                    {/* Chat Bubble Body card */}
                    <div
                      className={`relative text-[#d1d1d1] leading-relaxed select-text mt-1 ${
                        isAssistant
                          ? "pr-8"
                          : "bg-[#2f2f2f] border border-[#3e3e3e] px-4 py-3.5 rounded-xl ml-auto text-left max-w-[85%]"
                      }`}
                    >
                      {/* Body contents */}
                      {isAssistant ? (
                        <div className="markdown-body select-text text-sm">
                          <Markdown
                            components={{
                              pre({ children }) {
                                return <pre className="not-prose">{children}</pre>;
                              },
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                const codeString = String(children).replace(/\n$/, "");
                                const isInline = !match;
                                const codeId = Math.random().toString(36).substr(2, 9);

                                if (match && match[1] === "3d-video") {
                                  try {
                                    const parsed = JSON.parse(codeString);
                                    return (
                                      <ThreeDVideoStudio
                                        prompt={parsed.prompt || "3D scene"}
                                        modelType={parsed.modelType || "crystal"}
                                        title={parsed.title || "3D Obyekt"}
                                      />
                                    );
                                  } catch (err) {
                                    return (
                                      <ThreeDVideoStudio
                                        prompt="3D scene"
                                        modelType="crystal"
                                        title="3D Model & Video Studio"
                                      />
                                    );
                                  }
                                }

                                if (isInline) {
                                  return (
                                    <code className="bg-[#2f2f2f] text-[#ececec] px-1.5 py-0.5 rounded text-xs select-text border border-[#3e3e3e]" {...props}>
                                      {children}
                                    </code>
                                  );
                                }

                                return (
                                  <div className="relative rounded-lg overflow-hidden my-3 border border-[#2f2f2f] text-xs text-[#ececec] font-mono select-text">
                                    {/* Code Block Header with copy options */}
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#171717] border-b border-[#2f2f2f] select-none text-[#b4b4b4]">
                                      <span className="text-[10px] uppercase font-bold text-[#676767]">
                                        {match[1] || "code"}
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(codeString, codeId)
                                        }
                                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                                      >
                                        {copiedId === codeId ? (
                                          <>
                                            <Check className="h-3.5 w-3.5 text-white" />
                                            <span className="text-[10px] text-white">Nusxalandi</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span className="text-[10px]">Nusxa olish</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <div className="p-4 bg-[#111827] overflow-x-auto">
                                      <code className="block select-text text-gray-300">
                                        {codeString}
                                      </code>
                                    </div>
                                  </div>
                                );
                              },
                              p({ children, ...props }) {
                                return (
                                  <div className="mb-4 last:mb-0 leading-relaxed whitespace-pre-wrap select-text text-sm md:text-base text-[#d1d1d1]" {...props}>
                                    {children}
                                  </div>
                                );
                              },
                              img({ src, alt, ...props }) {
                                return (
                                  <div className="my-4 rounded-2xl overflow-hidden border border-[#2f2f2f] bg-[#171717]/80 shadow-2xl max-w-xl group relative">
                                    <img
                                      src={src || ""}
                                      alt={alt || "Generatsiya qilingan rasm"}
                                      className="w-full h-auto object-cover max-h-[500px]"
                                      referrerPolicy="no-referrer"
                                      {...props}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md px-4 py-3 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
                                      <span className="font-medium truncate max-w-[70%]">{alt || "VeloxAi Tasvir"}</span>
                                      <div className="flex gap-3">
                                        <a
                                          href={src || ""}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-sky-400 hover:text-sky-300 font-semibold transition-colors animate-pulse"
                                        >
                                          To'liq ochish
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            }}
                          >
                            {message.text}
                          </Markdown>
                          
                          {/* Stream typing indicator */}
                          {message.isStreaming && (
                            <span className="cursor-pulse" />
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "#ececec" }}>
                          {message.text}
                        </p>
                      )}

                      {/* Micro-actions below the bubble */}
                      {isAssistant && !message.isStreaming && (
                        <div className="mt-3 flex items-center gap-2 select-none">
                          <button
                            onClick={() => copyToClipboard(message.text, message.id)}
                            className="p-1.5 hover:bg-[#2f2f2f] rounded text-[#b4b4b4] hover:text-white transition-colors"
                            title="Nusxa olish"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => speakText(message.text, message.id)}
                            className="p-1.5 hover:bg-[#2f2f2f] rounded text-[#b4b4b4] hover:text-white transition-colors"
                            title={speakingMessageId === message.id ? "Ovozni to'xtatish" : "Ovozli o'qish"}
                          >
                            {speakingMessageId === message.id ? (
                              <VolumeX className="h-4 w-4 text-emerald-400 animate-pulse" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp display */}
                    <div className={`text-[9px] text-[#676767] font-mono mt-1 ${!isAssistant ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Waiting for response typing dots animation indicator */}
            {isGenerating && !session.messages.some((m) => m.isStreaming) && (
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2f2f2f] flex items-center justify-center shrink-0 shadow-xs">
                  <img src={logoImg} alt="VeloxAi" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold text-[#b4b4b4]">VeloxAi</div>
                  <div className="px-4 py-3 bg-[#171717] border border-[#2f2f2f] rounded-xl flex items-center gap-1.5 self-start w-20 mt-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error alert indicator */}
      {error && (
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 shrink-0 pb-1">
          <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block font-display">Tizim xatoligi:</span>
              <span className="text-red-300 font-sans">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Message Form Console */}
      <div className="p-6 shrink-0 bg-[#212121] border-t border-[#2f2f2f]/30">
        {!isPremium && secondsLeft <= 0 ? (
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-[#1c1c1c] border border-amber-500/20 rounded-2xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md animate-fade-in">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
            <div className="flex justify-center -mt-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-bounce">
                <Clock className="h-6 w-6 stroke-[2]" />
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-white">Bugungi 3 soatlik tekin foydalanish limitingiz tugadi!</h3>
              <p className="text-xs text-[#b4b4b4] max-w-lg mx-auto leading-relaxed">
                Premium tarif bilan cheksiz muloqot qiling. Atiga <strong>$3 / oyiga (39 000 UZS)</strong> evaziga barcha limitlarni abadiyga va cheksizga olib tashlang.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPremium}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold text-xs shadow-lg shadow-yellow-500/10 transition-all transform hover:scale-[1.02] active:scale-97 select-none cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 fill-black/20" /> Premium Rejimga o'tish ($3)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
            
            {/* Attachment preview if any */}
            {attachedFile && (
              <div className="absolute -top-16 left-2 flex items-center gap-2.5 p-1.5 bg-[#171717] border border-[#2f2f2f] rounded-xl shadow-2xl text-xs z-10 animate-fade-in animate-duration-200">
                {attachedFile.startsWith("data:image/") ? (
                  <img
                    src={attachedFile}
                    alt="thumbnail attached"
                    className="w-10 h-10 object-cover rounded-lg border border-[#2f2f2f]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#252525] border border-[#2f2f2f] flex items-center justify-center shrink-0">
                    {getFileIcon(attachedFile.split(";")[0].replace("data:", ""), attachedFileName || "fayl")}
                  </div>
                )}
                <div className="flex flex-col max-w-[12rem] pr-1">
                  <span className="text-[11px] font-semibold text-white truncate max-w-[10rem]">{attachedFileName || "Hujjat biriktirildi"}</span>
                  <span className="text-[9px] text-[#8a8a8a] uppercase font-mono">{attachedFile.split(";")[0].replace("data:", "").split("/")[1]?.substring(0, 8) || "fayl"}</span>
                </div>
                <button
                  type="button"
                  onClick={removeAttachedFile}
                  className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white cursor-pointer ml-1 shrink-0 transition-colors"
                  title="Faylni o'chirish"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Core Input box wrapper */}
            <div className="relative flex items-center rounded-2xl bg-[#2f2f2f] border border-[#3e3e3e] focus-within:border-[#676767] shadow-2xl transition-all">
              
              {/* Attachment paperclip and image selection */}
              <button
                type="button"
                onClick={triggerFileSelection}
                className={`p-3 text-[#676767] hover:text-white hover:bg-[#212121]/50 rounded-l-2xl transition-colors cursor-pointer ${
                  attachedFile ? "text-white" : ""
                }`}
                title="Rasm yoki fayl yuklash"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.xml,.js,.ts,.py,.rs,.cpp,.html,.css"
                className="hidden"
              />

              {/* Input field */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  session.messages.length === 0 
                    ? "Suhbatni boshlash va fayllarni tahlil qilish uchun yozing..." 
                    : "Menga o'xshab istalgan narsani so'rang yoki fayl yuklang..."
                }
                rows={1}
                className="w-full bg-transparent text-sm py-4 px-2 pr-16 max-h-36 resize-none overflow-y-auto focus:outline-none text-[#ececec] placeholder-[#676767] font-sans"
                style={{ minHeight: "24px" }}
              />

              {/* Send button interaction */}
              <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5 shrink-0">
                {session.searchGroundingEnabled && (
                  <span className="flex items-center gap-1 text-[9px] bg-[#171717] text-[#ececec] font-semibold px-2 py-1 rounded border border-[#2f2f2f]">
                    <Globe className="h-3 w-3 animate-pulse" />
                    Qidirish
                  </span>
                )}
                
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !attachedFile) || isGenerating}
                  className={`p-2 rounded-xl transition-all ${
                    (inputText.trim() || attachedFile) && !isGenerating
                      ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
                      : "bg-[#212121] text-[#676767] pointer-events-none"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Subtext info panel */}
            <div className="text-center mt-3">
              <p className="text-[10px] text-[#676767]">VeloxAi xatolar qilishi mumkin. Muhim faktlarni tekshirib oling.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
