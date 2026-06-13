import React, { useState, useEffect } from "react";
import { Menu, Bot, Sparkles, MessageSquare, Plus } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ChatSession, Message } from "./types";
import { PRESETS } from "./data/presets";
// @ts-ignore
import logoImg from "./assets/images/velox_ai_logo_1781334265901.jpg";

const LOCAL_STORAGE_KEY = "aqlll_ai_chat_sessions";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(18000); // 5 hours default (5 * 3600)

  // Initialize and check the daily limit of 5 hours
  useEffect(() => {
    const LIMIT_KEY_SEC = "veloxai_daily_limit_seconds";
    const LIMIT_KEY_DATE = "veloxai_daily_limit_date";
    try {
      const todayDateStr = new Date().toLocaleDateString();
      const storedDate = localStorage.getItem(LIMIT_KEY_DATE);
      let loadedSeconds = 18000;

      if (storedDate === todayDateStr) {
        const storedSeconds = localStorage.getItem(LIMIT_KEY_SEC);
        if (storedSeconds !== null) {
          loadedSeconds = parseInt(storedSeconds, 10);
        }
      } else {
        localStorage.setItem(LIMIT_KEY_DATE, todayDateStr);
        localStorage.setItem(LIMIT_KEY_SEC, "18000");
      }
      setSecondsLeft(loadedSeconds);
    } catch (e) {
      console.error("Error setting daily limit state:", e);
    }
  }, []);

  // Set interval timer to count down seconds left per day
  useEffect(() => {
    const LIMIT_KEY_SEC = "veloxai_daily_limit_seconds";
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        try {
          localStorage.setItem(LIMIT_KEY_SEC, next.toString());
        } catch (e) {}
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load chat sessions from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Parse timestamp ISO strings back to Date objects
          const decoded = parsed.map((session: any) => ({
            ...session,
            messages: session.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
            createdAt: new Date(session.createdAt),
          }));
          setSessions(decoded);
          setActiveSessionId(decoded[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }

    // Fallback: Seed first default chat session if history is empty
    handleNewChat();
  }, []);

  // Save sessions to localStorage whenever there's a modification
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Create a new fresh chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(2, 11),
      title: "Yangi suhbat",
      messages: [],
      presetId: "general",
      searchGroundingEnabled: false,
      createdAt: new Date(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setError(null);
  };

  // Select a specific session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setError(null);
  };

  // Delete a session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      // Auto-migrate selected session if active one was deleted
      if (activeSessionId === id) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
      return updated;
    });
  };

  // Set system prompt configuration category
  const handleSelectPreset = (presetId: string) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, presetId } : s))
    );
  };

  const handleToggleSearchGrounding = () => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, searchGroundingEnabled: !s.searchGroundingEnabled }
          : s
      )
    );
  };

  // Core function: Send user message and stream back AI response
  const handleSendMessage = async (text: string, image?: string) => {
    if (!activeSessionId || isGenerating) return;

    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (!currentSession) return;

    setError(null);

    // 1. Create and append User Message
    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      role: "user",
      text,
      image,
      timestamp: new Date(),
    };

    const firstPrompt = currentSession.messages.length === 0;
    
    // Auto rename blank suhbat using first user prompt
    const updatedTitle = firstPrompt
      ? text.length > 28
        ? text.substring(0, 28) + "..."
        : text
      : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMessage];

    // Append user message local state
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: updatedTitle, messages: updatedMessages }
          : s
      )
    );

    setIsGenerating(true);

    // 2. Prepare placeholding assistant message
    const assistantMsgId = Math.random().toString(36).substring(2, 11);
    const placeholderAssistant: Message = {
      id: assistantMsgId,
      role: "assistant",
      text: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...updatedMessages, placeholderAssistant] }
          : s
      )
    );

    try {
      // Find instruction of selected system prompt preset
      const currentPreset = PRESETS.find((p) => p.id === currentSession.presetId);
      const systemInstruction = currentPreset ? currentPreset.instruction : "";

      // Send requests upstream to Express server
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
            image: m.image,
          })),
          systemInstruction,
          searchGroundingEnabled: currentSession.searchGroundingEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Server aloqasi uzildi.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("Oqimli ma'lumot o'qib bo'lmadi.");
      }

      let accumulatedResponse = "";
      let isStreamingDone = false;

      while (!isStreamingDone) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // SSE responses separates blocks with double newlines
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataString = line.substring(6).trim();
            
            if (dataString === "[DONE]") {
              isStreamingDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(dataString);
              if (parsed.error) {
                setError(parsed.error);
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSessionId) return s;
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, text: parsed.error, isStreaming: false }
                          : m
                      ),
                    };
                  })
                );
                isStreamingDone = true;
                break;
              }
              if (parsed.text) {
                accumulatedResponse += parsed.text;
                
                // Update specific message in place
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSessionId) return s;
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, text: accumulatedResponse }
                          : m
                      ),
                    };
                  })
                );
              }
            } catch (jsonErr) {
              // Ignore parse errors from chunk splits
            }
          }
        }
      }

      // Stream finalized. Toggle off streaming cursor pulse
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Xatolik yuz berdi, qaytadan urinib ko'ring.");
      
      // Populate placeholder with error
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMsgId
                ? { 
                    ...m, 
                    text: m.text || "Aloqa ulanish xatosi. Iltimos qayta urinib ko'ring.", 
                    isStreaming: false 
                  }
                : m
            ),
          };
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d0d]">
      {/* Sidebar Panel of Chat History & Controls */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        searchGroundingEnabled={activeSession ? activeSession.searchGroundingEnabled : false}
        onToggleSearchGrounding={handleToggleSearchGrounding}
        secondsLeft={secondsLeft}
      />

      {/* Main Panel Content container */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Floating navbar header for mobile devices */}
        <header className="flex h-16 items-center justify-between border-b border-[#2f2f2f] bg-[#212121] px-4 md:px-8 text-[#ececec]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#b4b4b4] hover:bg-[#2f2f2f] hover:text-white md:hidden transition-colors"
              title="Menyuni ochish"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full overflow-hidden border border-[#2f2f2f] bg-[#171717]">
                <img src={logoImg} alt="VeloxAi" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </span>
              <span className="font-display font-medium text-sm text-[#ececec] truncate max-w-[12rem] sm:max-w-xs">
                {activeSession ? activeSession.title : "Suhbatlar"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#171717] px-2.5 py-1 text-[11px] font-medium text-[#ececec] border border-[#2f2f2f]">
              <Sparkles className="h-3 w-3" />
              Gemini 2.5 Flash Active
            </span>
          </div>
        </header>

        {/* Chat Window view container */}
        <ChatWindow
          session={activeSession}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onSelectPreset={handleSelectPreset}
          error={error}
        />
      </div>
    </div>
  );
}
