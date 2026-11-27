import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles 
} from "lucide-react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  altText = "VeloxAi Tasvir",
}: ImageLightboxModalProps) {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const safeName = altText.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30) || "veloxai-rasm";
      link.download = `${safeName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!altText) return;
    navigator.clipboard.writeText(altText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 py-2 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-xs md:text-sm font-medium text-white truncate max-w-md">
            {altText}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2f2f2f] transition-colors cursor-pointer"
            title="Kichiklashtirish"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 py-2 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] text-xs font-mono text-[#ececec] border border-[#2f2f2f] transition-colors cursor-pointer"
            title="Masshtabni tiklash"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2f2f2f] transition-colors cursor-pointer"
            title="Kattalashtirish"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-[1px] h-6 bg-[#2f2f2f] mx-1" />

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="p-2 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2f2f2f] transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            title="Promptdan nusxa olish"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? "Nusxalandi" : "Prompt"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
            title="HD Yuklab olish"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? "Yuklanmoqda..." : "HD Yuklab olish"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 ml-1 rounded-xl bg-[#2a2a2a] hover:bg-red-500/20 hover:text-red-400 text-white transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden p-2">
        <div
          className="transition-transform duration-200 ease-out select-none"
          style={{ transform: `scale(${scale})` }}
        >
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-[#2f2f2f]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[11px] text-[#8e8e93] py-2 border-t border-[#252525]">
        <span>✨ Cheksiz AI Rasm Generatsiyasi (Flux / 8K Ultra HD)</span>
        <a
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
          className="text-amber-400 hover:underline flex items-center gap-1"
        >
          Asl manzilni ochish <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
