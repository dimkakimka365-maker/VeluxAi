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
  ArrowRight
} from "lucide-react";
import Markdown from "react-markdown";
import { ChatSession, Message } from "../types";
import AIPresetSelector from "./AIPresetSelector";
// @ts-ignore
import logoImg from "../assets/images/velox_ai_logo_1781334265901.jpg";

interface ChatWindowProps {
  session: ChatSession | null;
  onSendMessage: (text: string, image?: string) => void;
  isGenerating: boolean;
  onSelectPreset: (presetId: string) => void;
  error?: string | null;
}

export default function ChatWindow({
  session,
  onSendMessage,
  isGenerating,
  onSelectPreset,
  error
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
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
    if ((!inputText.trim() && !attachedImage) || isGenerating) return;

    onSendMessage(inputText.trim(), attachedImage || undefined);
    setInputText("");
    setAttachedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
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

            {/* AI Preset selector container */}
            <div className="bg-[#171717] rounded-xl p-5 border border-[#2f2f2f] shadow-xl">
              <AIPresetSelector 
                selectedPresetId={session.presetId}
                onSelectPreset={onSelectPreset}
              />
            </div>

            {/* Quick starts cards */}
            <div className="space-y-3">
              <h4 className="font-display text-[11px] font-bold text-[#676767] uppercase tracking-wider text-center">
                Mavzulardan Boshlash
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(s.prompt);
                    }}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#171717] border border-[#2f2f2f] hover:border-[#676767] hover:bg-[#212121]/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0" role="img" aria-label="emoji">
                        {s.emoji}
                      </span>
                      <div className="leading-tight">
                        <span className="block text-sm font-semibold text-[#ececec] group-hover:text-white transition-colors font-display">
                          {s.title}
                        </span>
                        <span className="block text-[11px] text-[#676767] truncate max-w-xs md:max-w-md">
                          {s.prompt}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#676767] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
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

                    {/* Optional Image Attachment Display */}
                    {message.image && (
                      <div className="relative group rounded-xl overflow-hidden max-w-sm border border-[#2f2f2f] bg-[#171717]/50 shadow-lg mt-1">
                        <img
                          src={message.image}
                          alt="attached data"
                          className="max-h-60 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
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
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          
          {/* Attachment preview if any */}
          {attachedImage && (
            <div className="absolute -top-16 left-2 flex items-center gap-2 p-1.5 bg-[#171717] border border-[#2f2f2f] rounded-xl shadow-lg">
              <img
                src={attachedImage}
                alt="thumbnail attached"
                className="w-10 h-10 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={removeAttachedImage}
                className="p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white"
                title="Rasm o'chirish"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Core Input box wrapper */}
          <div className="relative flex items-center rounded-2xl bg-[#2f2f2f] border border-[#3e3e3e] focus-within:border-[#676767] shadow-2xl transition-all">
            
            {/* Image attachment button trigger */}
            <button
              type="button"
              onClick={triggerFileSelection}
              className={`p-3 text-[#676767] hover:text-white hover:bg-[#212121]/50 rounded-l-2xl transition-colors cursor-pointer ${
                attachedImage ? "text-white" : ""
              }`}
              title="Rasm yuklash"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Input field */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                session.messages.length === 0 
                  ? "Suhbatni boshlash uchun savol bering..." 
                  : "Menga o'xshab istalgan narsani so'rang..."
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
                disabled={(!inputText.trim() && !attachedImage) || isGenerating}
                className={`p-2 rounded-xl transition-all ${
                  (inputText.trim() || attachedImage) && !isGenerating
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
      </div>
    </div>
  );
}
