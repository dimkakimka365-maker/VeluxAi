import React, { useState } from "react";
import { 
  Sparkles, 
  Download, 
  Maximize2, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle 
} from "lucide-react";

interface ChatImageCardProps {
  src: string;
  alt?: string;
  onOpenLightbox?: (url: string, alt: string) => void;
}

export default function ChatImageCard({
  src,
  alt = "Generatsiya qilingan rasm",
  onOpenLightbox,
}: ChatImageCardProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      const res = await fetch(currentSrc);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const safeName = alt.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30) || "veloxai-rasm";
      link.download = `${safeName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(currentSrc, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(alt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setHasError(false);
    const newSeed = Math.floor(Math.random() * 10000000);
    // Replace or add seed in pollinations url
    let newUrl = currentSrc;
    if (newUrl.includes("seed=")) {
      newUrl = newUrl.replace(/seed=\d+/, `seed=${newSeed}`);
    } else {
      const sep = newUrl.includes("?") ? "&" : "?";
      newUrl = `${newUrl}${sep}seed=${newSeed}`;
    }
    setCurrentSrc(newUrl);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-[#2f2f2f] bg-[#171717] shadow-2xl max-w-xl group relative">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-[10px] font-bold text-amber-400 shadow-md">
          <Sparkles className="h-3 w-3 fill-amber-400/20" />
          Cheksiz AI Rasm
        </span>
        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#b4b4b4] border border-[#2f2f2f]">
          HD Flux
        </span>
      </div>

      {/* Loading Shimmer State */}
      {isLoading && (
        <div className="w-full h-72 md:h-80 bg-gradient-to-r from-[#171717] via-[#252525] to-[#171717] animate-pulse flex flex-col items-center justify-center p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 animate-spin">
            <RefreshCw className="h-6 w-6" />
          </div>
          <span className="text-xs font-semibold text-white mb-1">
            ✨ Cheksiz AI Rasm Chizilmoqda...
          </span>
          <p className="text-[11px] text-[#8e8e93] max-w-xs">
            Flux va Stable Diffusion neyron tarmoqlari orqali yuqori aniqlikda yaratilmoqda.
          </p>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="w-full h-64 bg-[#1f1515] border border-red-500/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
          <p className="text-xs text-red-300 font-medium mb-3">
            Tasvirni yuklashda xatolik yuz berdi
          </p>
          <button
            type="button"
            onClick={handleRegenerate}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-amber-400 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Qayta urinish
          </button>
        </div>
      )}

      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-auto object-cover max-h-[520px] transition-opacity duration-500 cursor-pointer ${
          isLoading ? "hidden" : "block opacity-100"
        }`}
        onClick={() => onOpenLightbox?.(currentSrc, alt)}
        referrerPolicy="no-referrer"
      />

      {/* Bottom Floating Control Bar */}
      {!isLoading && !hasError && (
        <div className="p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent border-t border-[#252525] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-medium text-white truncate max-w-xs" title={alt}>
            {alt}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="p-1.5 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-[#b4b4b4] hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1 border border-[#2f2f2f]"
              title="Prompt nusxalash"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{copied ? "Nusxalandi" : "Prompt"}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              className="p-1.5 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-[#b4b4b4] hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1 border border-[#2f2f2f]"
              title="Yangi variant chizish"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Yangi variant</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
              title="HD Yuklab olish"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isDownloading ? "..." : "Yuklab olish"}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLightbox?.(currentSrc, alt)}
              className="p-1.5 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-[#b4b4b4] hover:text-white transition-colors cursor-pointer border border-[#2f2f2f]"
              title="To'liq ekranda ko'rish"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
