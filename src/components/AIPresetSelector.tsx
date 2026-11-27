import { 
  Sparkles, 
  Code, 
  Languages, 
  PenTool, 
  FileText, 
  Briefcase,
  Palette 
} from "lucide-react";
import { SystemPreset } from "../types";
import { PRESETS } from "../data/presets";

interface AIPresetSelectorProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

export default function AIPresetSelector({
  selectedPresetId,
  onSelectPreset
}: AIPresetSelectorProps) {
  
  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Palette":
        return <Palette className={className} />;
      case "Code":
        return <Code className={className} />;
      case "Languages":
        return <Languages className={className} />;
      case "PenTool":
        return <PenTool className={className} />;
      case "FileText":
        return <FileText className={className} />;
      case "Briefcase":
        return <Briefcase className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="font-display font-medium text-[#ececec] text-sm">
          AI Hamrohingizning &quot;Rolini&quot; Tanlang
        </h3>
        <p className="text-xs text-[#b4b4b4] mt-1">
          Yo'nalishni o'zgartirish orqali yanada to'g'ri va moslashtirilgan javob oling
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-[#2f2f2f] border-white shadow-md shadow-white/5 ring-1 ring-white/20"
                  : "bg-[#171717] border-[#2f2f2f] hover:border-[#676767] hover:bg-[#212121]/30"
              }`}
            >
              {/* Soft glow background for selected */}
              {isSelected && (
                <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/5 rounded-full blur-xl" />
              )}
              
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                  isSelected 
                    ? "bg-white text-black" 
                    : "bg-[#212121] text-[#b4b4b4]"
                }`}>
                  {getIcon(preset.iconName, "h-4 w-4")}
                </div>
                <span className={`font-display text-sm font-semibold ${
                  isSelected ? "text-white" : "text-[#ececec]"
                }`}>
                  {preset.name}
                </span>
              </div>
              
              <p className="text-xs text-[#b4b4b4] leading-relaxed font-sans line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
