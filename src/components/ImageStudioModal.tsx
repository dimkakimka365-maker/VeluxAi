import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Palette, 
  Camera, 
  Tv, 
  Smartphone, 
  Square, 
  Wand2, 
  Flame, 
  Check 
} from "lucide-react";

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

const STYLES = [
  {
    id: "photorealistic",
    name: "Fotorealistik",
    badge: "8K Ultra HD",
    desc: "Haqiqiy professional fotosurat, jonli yorug'lik va mukammal detallar",
    icon: Camera,
    promptSuffix: "photorealistic 8k, ultra-detailed photograph, shot on 35mm lens, cinematic studio lighting, highly realistic textures, masterpiece"
  },
  {
    id: "anime",
    name: "Anime / Manga",
    badge: "Makoto Shinkai",
    desc: "Yapon animatsiyasi uslubida boy ranglar, jozibali estetika",
    icon: Wand2,
    promptSuffix: "makoto shinkai aesthetic anime art style, vibrant colors, expressive lighting, masterpiece, clean lines, high resolution wallpaper"
  },
  {
    id: "cyberpunk",
    name: "Kiberpank & Sci-Fi",
    badge: "Futuristik",
    desc: "Neon nurlar, kelajak texnologiyalari va mistik shahar manzaralari",
    icon: Flame,
    promptSuffix: "futuristic cyberpunk neon sci-fi style, volumetric fog, glowing holograms, cinematic atmosphere, unreal engine 5 render, octane render"
  },
  {
    id: "oil_painting",
    name: "Moybo'yoq San'ati",
    badge: "Klassik",
    desc: "Klassik rassomlik asari, qalin mo'yqalam izlari va chuqur ranglar",
    icon: Palette,
    promptSuffix: "classical masterpiece oil painting on textured canvas, rich brush strokes, dramatic chiaroscuro lighting, museum quality"
  },
  {
    id: "3d_render",
    name: "3D Animatsiya",
    badge: "Pixar / Octane",
    desc: "Yumshoq yoritilgan 3D personajlar va hayratlanarli modellashtirish",
    icon: Sparkles,
    promptSuffix: "pixar and disney style 3d render, octane render, soft subsurface scattering, charming expressive details, 4k 3d animation"
  },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "Kvadrat (1:1)", dims: "1024x1024", width: 1024, height: 1024, icon: Square },
  { id: "16:9", label: "Gorizontal (16:9)", dims: "1280x720", width: 1280, height: 720, icon: Tv },
  { id: "9:16", label: "Vertikal (9:16)", dims: "720x1280", width: 720, height: 1280, icon: Smartphone },
];

const INSPIRATION_IDEAS = [
  "Kelajak Toshkent shahri 2050, kiberpank neon chiroqlar va uchuvchi mashinalar",
  "Oq tulpor Chotqol tog'lari bag'rida, quyosh botishi manzarasi",
  "Samarqand Registon maydoni yulduzli osmon ostida, ertaknamo yoritilgan",
  "Kosmik kemada gullagan sirli issiqxona va derazadan ko'ringan Yer sayyorasi",
  "Zumrad billurdan yasalgan qudratli ajdaho, oltin tog' ustida",
  "Kuz faslidagi sokin yapon bog'i, qizil zarang barglari va ko'l",
];

export default function ImageStudioModal({
  isOpen,
  onClose,
  onSubmit,
}: ImageStudioModalProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0].id);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    const styleObj = STYLES.find((s) => s.id === selectedStyle) || STYLES[0];
    const ratioObj = ASPECT_RATIOS.find((r) => r.id === selectedRatio) || ASPECT_RATIOS[0];

    // Format rich request for AI
    const fullRequest = `🎨 [CHEKSIZ RASM YARATISH]: "${cleanPrompt}" mavzusida rasm chizib ber.\n` +
      `- Uslub: ${styleObj.name} (${styleObj.badge})\n` +
      `- Format: ${ratioObj.label} (${ratioObj.width}x${ratioObj.height})\n` +
      `- Vizual prompt tavsifi: ${cleanPrompt}, ${styleObj.promptSuffix}\n` +
      `- O'lcham parametri: width=${ratioObj.width}&height=${ratioObj.height}`;

    onSubmit(fullRequest);
    setPrompt("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#171717] border border-[#2f2f2f] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#8e8e93] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 shrink-0">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display">
                Cheksiz AI Rasm Studiyasi
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Cheksiz & Bepul
              </span>
            </div>
            <p className="text-xs text-[#8e8e93]">
              Istalgan tasavvurni soniyalar ichida yuqori sifatli (HD/8K) san&apos;at asariga aylantiring.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Prompt textarea */}
          <div>
            <label className="block text-xs font-semibold text-[#ececec] mb-1.5">
              Qanday rasm chizmoqchisiz? <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Masalan: Samarqand Registon maydoni yulduzli osmon ostida, neon chiroqlar, fotorealistik 8K..."
                rows={3}
                autoFocus
                className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-amber-500/60 rounded-xl p-3 text-sm text-white placeholder-[#676767] focus:outline-none resize-none transition-all font-sans"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-[#8e8e93] flex items-center gap-1 mr-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> G&apos;oyalar:
              </span>
              {INSPIRATION_IDEAS.slice(0, 4).map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="text-[11px] bg-[#212121] hover:bg-[#2a2a2a] text-[#b4b4b4] hover:text-white px-2.5 py-1 rounded-lg border border-[#2f2f2f] transition-colors truncate max-w-[200px] cursor-pointer"
                  title={idea}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#ececec] mb-2">
              San&apos;at Uslubi (Style)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5"
                        : "bg-[#212121] border-[#2f2f2f] hover:border-[#3e3e3e]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-amber-500 text-black"
                          : "bg-[#2a2a2a] text-[#b4b4b4]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {style.name}
                        </span>
                        {isSelected && (
                          <Check className="h-3 w-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-mono block">
                        {style.badge}
                      </span>
                      <p className="text-[10px] text-[#8e8e93] line-clamp-1 mt-0.5">
                        {style.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#ececec] mb-2">
              Tasvir O&apos;lchami (Format)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {ASPECT_RATIOS.map((ratio) => {
                const Icon = ratio.icon;
                const isSelected = selectedRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/60 text-white font-bold"
                        : "bg-[#212121] border-[#2f2f2f] text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{ratio.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-between border-t border-[#252525]">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3" /> Hech qanday limit yo&apos;q • Cheksiz
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs text-[#8e8e93] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  prompt.trim()
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black shadow-amber-500/20 active:scale-95"
                    : "bg-[#252525] text-[#676767] pointer-events-none"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 fill-black/20" />
                Rasm Yaratish (Cheksiz)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
