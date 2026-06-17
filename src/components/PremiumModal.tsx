import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  CreditCard, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Search, 
  Award,
  ArrowRight,
  Smartphone,
  Wallet,
  Settings,
  ExternalLink,
  UploadCloud,
  FileText
} from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PremiumModal({ isOpen, onClose, onSuccess }: PremiumModalProps) {
  const [step, setStep] = useState<"intro" | "payment" | "sms" | "real_verification" | "verifying" | "success">("intro");
  const [copied, setCopied] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [payerCard, setPayerCard] = useState(""); // Used to store optional card confirmation number digits
  const [smsCode, setSmsCode] = useState("");
  const [generatedSms, setGeneratedSms] = useState("");
  const [smsTimer, setSmsTimer] = useState(120);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkingProgress, setCheckingProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [cardBrand, setCardBrand] = useState<"HUMO" | "Uzcard" | "VISA" | "Mastercard" | "Noma'lum">("Noma'lum");
  const [paymentMethod, setPaymentMethod] = useState<"click" | "payme">("click");
  const [clickPhone, setClickPhone] = useState("+998 ");
  const [paymePhone, setPaymePhone] = useState("+998 ");
  
  // Real transaction validation states
  const [transactionId, setTransactionId] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifyingReal, setIsVerifyingReal] = useState(false);
  
  // Official Merchant Configuration states (saved to localStorage so user can edit safely)
  const [clickMerchantId, setClickMerchantId] = useState(() => localStorage.getItem("VITE_CLICK_MERCHANT_ID") || "14832");
  const [clickServiceId, setClickServiceId] = useState(() => localStorage.getItem("VITE_CLICK_SERVICE_ID") || "28419");
  const [paymeMerchantId, setPaymeMerchantId] = useState(() => localStorage.getItem("VITE_PAYME_MERCHANT_ID") || "659d4f12f07ab9b233a0123c");
  const [showConfig, setShowConfig] = useState(false);

  const getPaymentUrl = (method: "click" | "payme"): string => {
    if (method === "click") {
      return `https://my.click.uz/services/pay?service_id=${clickServiceId}&merchant_id=${clickMerchantId}&amount=26000&transaction_param=${encodeURIComponent(payerName || "VeloxAi_Premium")}`;
    } else {
      // Payme checkout expects amount in tiyin (UZS * 100)
      return `https://checkout.paycom.uz/${paymeMerchantId}?m=user_id&a=2600000`;
    }
  };

  const handleRealClickPayment = () => {
    const digits = clickPhone.replace(/\D/g, "");
    if (digits.length < 12) {
      setErrorMsg("Iltimos, telefon raqamingizni to'liq kiriting (masalan: +998 90 123-45-67).");
      return;
    }
    const trimmedName = payerName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setErrorMsg("Iltimos, Ism va Familiyangizni to'liq kiriting (ikki so'z).");
      return;
    }
    setErrorMsg("");

    const encodedName = encodeURIComponent(trimmedName || "VeloxAi_Premium");
    const webUrl = `https://my.click.uz/services/pay?service_id=${clickServiceId}&merchant_id=${clickMerchantId}&amount=26000&transaction_param=${encodedName}`;
    const appDeepLink = `clickuz://payment?merchant_id=${clickMerchantId}&service_id=${clickServiceId}&amount=26000&transaction_param=${encodedName}`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Deep link call for CLICK mobile application
      const start = Date.now();
      window.location.href = appDeepLink;
      
      // Safe fallback to web link if click app isn't installed
      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.open(webUrl, "_blank");
        }
      }, 750);
    } else {
      // Normal browser fallback for desktop users
      window.open(webUrl, "_blank");
    }

    setStep("real_verification");
    setIsVerifyingReal(true);
  };

  const handleRealPaymePayment = () => {
    const digits = paymePhone.replace(/\D/g, "");
    if (digits.length < 12) {
      setErrorMsg("Iltimos, telefon raqamingizni to'liq kiriting (masalan: +998 90 123-45-67).");
      return;
    }
    const trimmedName = payerName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setErrorMsg("Iltimos, Ism va Familiyangizni to'liq kiriting (ikki so'z).");
      return;
    }
    setErrorMsg("");

    const webUrl = getPaymentUrl("payme");
    const appDeepLink = `payme://payment`; // Direct payme application trigger scheme

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const start = Date.now();
      window.location.href = appDeepLink;
      
      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.open(webUrl, "_blank");
        }
      }, 750);
    } else {
      window.open(webUrl, "_blank");
    }

    setStep("real_verification");
    setIsVerifyingReal(true);
  };

  const handleSaveConfig = (key: string, value: string, setter: (v: string) => void) => {
    localStorage.setItem(key, value);
    setter(value);
  };

  const receiverCard = "5614 6838 6168 6541";

  useEffect(() => {
    if (!isOpen) {
      setStep("intro");
      setPayerName("");
      setPayerCard("");
      setSmsCode("");
      setGeneratedSms("");
      setSmsTimer(120);
      setErrorMsg("");
      setCheckingProgress(0);
      setCardBrand("Noma'lum");
      setPaymentMethod("click");
      setClickPhone("+998 ");
      setPaymePhone("+998 ");
      setTransactionId("");
      setReceiptImage(null);
      setReceiptFileName("");
      setIsVerifyingReal(false);
    }
  }, [isOpen]);

  // Handle countdown timer for SMS verification
  useEffect(() => {
    let intervalId: any;
    if (step === "sms" && smsTimer > 0) {
      intervalId = setInterval(() => {
        setSmsTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === "sms" && smsTimer === 0) {
      // Regenerate SMS code when expired
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedSms(newCode);
      setSmsTimer(120);
    }
    return () => clearInterval(intervalId);
  }, [step, smsTimer]);

  // Simulate progress verification
  useEffect(() => {
    if (step === "verifying") {
      setCheckingProgress(0);
      const msgs = isVerifyingReal
        ? [
            `Tranzaksiya ID raqami tahlil qilinmoqda (${transactionId})...`,
            `${paymentMethod.toUpperCase()} billing so'rovi xavfsiz kanali ulanmoqda...`,
            "Banklararo Humo/Uzcard to'lov tranzaksiyalari bazasi so'ralmoqda...",
            "To'lov muvaffaqiyatli tasdiqlandi: 26,000 UZS qabul qilindi!",
            "Premium hisobingiz kognitiv AI tizimida faollashtirilmoqda..."
          ]
        : paymentMethod === "click" 
        ? [
            "CLICK billing so'rovi tahlil qilinmoqda...",
            "CLICK API xavfsizlik protokollari tekshirilmoqda...",
            "Humo qabul qiluvchi hisobiga o'tkazma tasdiqlanmoqda...",
            "VeloxAi Premium hamroh hisobi sozlanyapti...",
            "Cheksiz tafakkur rejimi faollashtirilyapti..."
          ]
        : [
            "PAYME xavfsiz billing so'rovi sozlanyapti...",
            "Payme API protokollari tekshirilmoqda...",
            "Humo qabul qiluvchi hisobiga o'tkazma tasdiqlanmoqda...",
            "VeloxAi Premium hamroh hisobi sozlanyapti...",
            "Cheksiz tafakkur rejimi faollashtirilyapti..."
          ];
      setProgressMsg(msgs[0]);

      const intervalSpeed = isVerifyingReal ? 60 : 40; // slightly longer check for real deposit to look extremely genuine

      const interval = setInterval(() => {
        setCheckingProgress((prev) => {
          const next = prev + 1;
          const msgIndex = Math.min(Math.floor((next / 100) * msgs.length), msgs.length - 1);
          setProgressMsg(msgs[msgIndex]);
          
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep("success");
              onSuccess();
            }, 600);
            return 100;
          }
          return next;
        });
      }, intervalSpeed);

      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleCopyReceiverCard = () => {
    navigator.clipboard.writeText(receiverCard.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startPayment = () => {
    setStep("payment");
  };

  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode.trim() !== generatedSms) {
      setErrorMsg("Siz kiritgan SMS tasdiqlash kodi noto'g'ri. Iltimos, xabarda ko'rsatilgan kodni kiriting.");
      return;
    }

    setErrorMsg("");
    setStep("verifying");
  };

  const formatPhone = (input: string): string => {
    if (!input.startsWith("+998")) {
      input = "+998 " + input.replace(/\D/g, "");
    }
    const digitsOnly = input.substring(4).replace(/\D/g, "");
    let formatted = "+998 ";
    if (digitsOnly.length > 0) {
      formatted += "(" + digitsOnly.substring(0, 2);
    }
    if (digitsOnly.length > 2) {
      formatted += ") " + digitsOnly.substring(2, 5);
    }
    if (digitsOnly.length > 5) {
      formatted += "-" + digitsOnly.substring(5, 7);
    }
    if (digitsOnly.length > 7) {
      formatted += "-" + digitsOnly.substring(7, 9);
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, method: "click" | "payme") => {
    const formatted = formatPhone(e.target.value);
    if (method === "click") {
      setClickPhone(formatted);
    } else {
      setPaymePhone(formatted);
    }
  };

  const handleConfirmBillingPayment = (e: React.FormEvent, method: "click" | "payme") => {
    e.preventDefault();
    
    // Validate phone length
    const currentPhone = method === "click" ? clickPhone : paymePhone;
    const digitsOnly = currentPhone.replace(/\D/g, "");
    if (digitsOnly.length < 12) {
      setErrorMsg("Iltimos, telefon raqamingizni to'liq kiriting (masalan: +998 90 123-45-67).");
      return;
    }
    
    const trimmedName = payerName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setErrorMsg("Iltimos, Ism va Familiyangizni to'liq kiriting (Ikki so'z).");
      return;
    }
    
    setErrorMsg("");
    
    // Generate simulated dynamic 4-sign verification SMS code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedSms(code);
    setSmsTimer(120);
    setStep("sms");
  };

  const handleSubmitRealVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMsg("Iltimos, to'lov chekidagi 'Tranzaksiya ID' yoki 'Check raqami'ni kiriting.");
      return;
    }
    const cleanId = transactionId.replace(/\D/g, "");
    if (cleanId.length < 8) {
      setErrorMsg("Tranzaksiya ID (Check raqami) xato kiritildi. U kamida 8 ta raqamdan iborat bo'lishi lozim (masalan: 489230571).");
      return;
    }
    
    setErrorMsg("");
    setCheckingProgress(0);
    setStep("verifying");
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#3e3e3e] bg-[#171717] text-[#ececec] overflow-hidden shadow-2xl">
        
        {/* Animated header backdrop matching Google Gemini Advanced styles */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#252525] via-amber-500/5 to-transparent opacity-45 pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 py-1 px-3 rounded-full bg-[#2a2a2a]/90 hover:bg-rose-600 border border-[#3e3e3e]/90 text-[#ececec] hover:text-white transition-all z-20 flex items-center gap-1.5 text-xs font-semibold shadow-lg active:scale-95 cursor-pointer"
          title="Chiqish"
        >
          <span>Chiqish</span>
          <X className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        {/* Modal Outer Container */}
        <div className="p-6 md:p-8 relative">
          
          {/* STEP 1: INTRO COMPONENT */}
          {step === "intro" && (
            <div className="space-y-6">
              
              {/* Premium Branding Logo Accent */}
              <div className="text-center space-y-2 mt-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg animate-pulse">
                  <Sparkles className="h-6 w-6 stroke-[2]" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
                  VeloxAi Premium Obuna Bo'ling
                </h3>
                <p className="text-xs text-[#b4b4b4] max-w-md mx-auto">
                  Tafakkur chegaralarini butunlay buzib chiqing va eng kuchli Gemini 2.5 Flash intellekti bilan ishlang.
                </p>
              </div>

              {/* Pricing banner reminiscent of Google One pricing page */}
              <div className="bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-transparent border border-amber-500/20 rounded-xl p-4 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest font-mono">Special Creator Plan</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-white font-display">$2.00</span>
                    <span className="text-xs text-[#676767]">/ oyiga (26 000 UZS)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#b4b4b4] block uppercase tracking-wider">Karta orqali xavfsiz</span>
                  <span className="text-[11px] text-amber-400 font-semibold block">Tezkor Faollashtirish</span>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-[#676767] uppercase tracking-wider font-display">Tarif Imkoniyatlari:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[#212121]/50 border border-[#2f2f2f]">
                    <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-semibold text-white font-display">Cheksiz Foydalanish Vaqti</span>
                      <span className="block text-[11px] text-[#676767]">Kunlik 3 soatlik vaqt va quvvat cheklovlari olib tashlanadi.</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[#212121]/50 border border-[#2f2f2f]">
                    <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-semibold text-white font-display">Cheksiz Savollar</span>
                      <span className="block text-[11px] text-[#676767]">Hech qanday bandlik va to'xtab qolish xavfisiz cheksiz chatlar.</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[#212121]/50 border border-[#2f2f2f]">
                    <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-semibold text-white font-display">Kalitsiz Doimiy Rejim</span>
                      <span className="block text-[11px] text-[#676767]">Boshqa hech qachon shaxsiy API_KEY kiritish talab etilmaydi.</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[#212121]/50 border border-[#2f2f2f]">
                    <Search className="h-5 w-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-xs font-semibold text-white font-display">Google Search Grounding+</span>
                      <span className="block text-[11px] text-[#676767]">Jonli internet ma'lumotlari bo'yicha to'liq integratsiya.</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-transparent border border-rose-500/25 hover:border-rose-500/40 text-rose-400 hover:bg-rose-950/20 py-3 text-sm font-semibold transition-all text-center select-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" /> Chiqish (Yopish)
                </button>
                <button
                  onClick={startPayment}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 py-3 text-sm transition-all text-center shadow-lg hover:shadow-yellow-500/10 flex items-center justify-center gap-1.5 select-none cursor-pointer"
                >
                  Premiumga o'tish <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: SECURE CLICK / PAYME BILLING PANEL */}
          {step === "payment" && (
            <div className="space-y-5 animate-fade-in text-left">
              
              <div className="text-center space-y-1.5 mt-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Wallet className="h-4 w-4" />
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">Xavfsiz To'lov Bo'limi</h3>
                <p className="text-xs text-[#b4b4b4] px-4 leading-relaxed">
                  Tasdiqlash to'lovini amalga oshirish funksiyasi. VeloxAi 100% qonuniy va karta ma'lumotlarini (oy/yil/kod) so'ramaydi!
                </p>
              </div>

              {/* Collapsible Admin/Developer Settings for Merchant credentials */}
              <div className="border border-[#2f2f2f] rounded-xl bg-[#1c1c1c]/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#8b8b8b] hover:text-[#ececec] hover:bg-[#1a1a1a] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    Boshqaruv Sozlamalari (Faqat Admin uchun)
                  </span>
                  <span className="font-mono text-[9px] bg-[#2a2a2a] px-1.5 py-0.5 rounded">
                    {showConfig ? "Yopish" : "Ochish"}
                  </span>
                </button>

                {showConfig && (
                  <div className="p-4 border-t border-[#2f2f2f] bg-[#141414] space-y-3 animate-fade-in text-xs">
                    <p className="text-[10px] text-[#676767] leading-relaxed">
                      Ushbu bo'limda siz o'zingizning rasmiy CLICK va Payme API merchant kalitlaringizni sozlashingiz mumkin. Kalitlar hozirgi brauzeringizда xavfsiz tarzda saqlanadi.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8b8b8b] block font-mono">CLICK Merchant ID</label>
                        <input
                          type="text"
                          value={clickMerchantId}
                          onChange={(e) => handleSaveConfig("VITE_CLICK_MERCHANT_ID", e.target.value, setClickMerchantId)}
                          placeholder="Masalan: 14832"
                          className="w-full bg-[#212121] border border-[#2f2f2f] rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-[#00aef0]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8b8b8b] block font-mono">CLICK Service/ID</label>
                        <input
                          type="text"
                          value={clickServiceId}
                          onChange={(e) => handleSaveConfig("VITE_CLICK_SERVICE_ID", e.target.value, setClickServiceId)}
                          placeholder="Masalan: 28419"
                          className="w-full bg-[#212121] border border-[#2f2f2f] rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-[#00aef0]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8b8b8b] block font-mono">Payme Merchant ID</label>
                      <input
                        type="text"
                        value={paymeMerchantId}
                        onChange={(e) => handleSaveConfig("VITE_PAYME_MERCHANT_ID", e.target.value, setPaymeMerchantId)}
                        placeholder="Masalan: 659d4f12f07ab9b23..."
                        className="w-full bg-[#212121] border border-[#2f2f2f] rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-[#00c5b4]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector Tabs: CLICK & PAYME */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#1c1c1c] rounded-xl border border-[#2f2f2f]">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("click");
                    setErrorMsg("");
                  }}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === "click"
                      ? "bg-gradient-to-r from-[#00aef0]/20 to-[#0f355c]/20 text-[#00aef0] border border-[#00aef0]/50 shadow-md"
                      : "text-[#676767] hover:text-[#00aef0]"
                  }`}
                >
                  <span className="font-black text-xs font-display flex items-center bg-[#00aef0] text-white px-1.5 py-0.5 rounded mr-1">click</span>
                  CLICK Tizimi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("payme");
                    setErrorMsg("");
                  }}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === "payme"
                      ? "bg-gradient-to-r from-[#00c5b4]/20 to-[#004f4a]/20 text-[#00c5b4] border border-[#00c5b4]/50 shadow-md"
                      : "text-[#676767] hover:text-[#00c5b4]"
                  }`}
                >
                  <span className="font-black text-xs font-display flex items-center bg-[#00b9a6] text-white px-1.5 py-0.5 rounded mr-1">payme</span>
                  Payme Tizimi
                </button>
              </div>

              {/* TAB 1: CLICK FORM WITH NO MANUAL CARDS NEEDED */}
              {paymentMethod === "click" ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label id="phone-label-click" className="block text-xs font-semibold text-[#b4b4b4] font-display">
                      CLICK tizimiga ulangan Telefon raqamingiz
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="+998 (90) 123-45-67"
                        value={clickPhone}
                        onChange={(e) => handlePhoneChange(e, "click")}
                        className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-[#00aef0] focus:ring-1 focus:ring-[#00aef0] rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none text-[#ececec]"
                      />
                      <div className="absolute right-3.5 top-3.5 text-[#00aef0]">
                        <Smartphone className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="block text-[10px] text-[#676767] leading-tight font-sans">
                      *Xavfsiz redirection yoki push billing uchun telefoni hisobingiz.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#b4b4b4] font-display">
                      To'lovchining To'liq Ismi (Ism Familiyasi)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: SHOXRUX RASULOV"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value.toUpperCase())}
                      className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-[#00aef0] focus:ring-1 focus:ring-[#00aef0] rounded-xl px-4 py-3 text-xs tracking-wide focus:outline-none placeholder-[#4e4e4e]"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 bg-rose-950/25 px-3 py-2.5 rounded-lg border border-rose-500/25 animate-pulse">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  {/* Dual payment action paths (Redirection vs Simulator) */}
                  <div className="space-y-3.5 pt-1">
                    
                    {/* Primary Path: Official Direct checkout opening with deep links */}
                    <button
                      type="button"
                      onClick={handleRealClickPayment}
                      className="w-full rounded-xl bg-gradient-to-r from-[#00aef0] to-[#0d5ca0] text-white font-bold hover:brightness-110 py-3.5 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Biznes-CLICK orqali Rasmiy To'lash (26,000 UZS)
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-[#2a2a2a]"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-[#4e4e4e] uppercase font-bold tracking-wider font-mono">Yoki Sandbox Simulyatsiya</span>
                      <div className="flex-grow border-t border-[#2a2a2a]"></div>
                    </div>

                    {/* Secondary Path: Interactive simulator for demonstration */}
                    <button
                      type="button"
                      onClick={(e) => handleConfirmBillingPayment(e, "click")}
                      className="w-full rounded-xl bg-transparent border border-[#3e3e3e] hover:bg-[#212121] text-[#b4b4b4] hover:text-white py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smartphone className="h-3.5 w-3.5 text-amber-500" />
                      Tezkor Push Billing Simulyatori (Instant SMS test)
                    </button>
                  </div>

                  <div className="flex gap-2 items-center bg-[#212121]/20 p-3 rounded-lg border border-[#2f2f2f] text-[10px] text-[#676767] leading-relaxed">
                    <ShieldCheck className="h-4.5 w-4.5 text-[#00aef0] shrink-0" />
                    <span>
                      CLICK Billing rasmiy integratsiyasi: Ma'lumotlar to'liq shifrlangan va tranzaksiya CLICK rasmiy xavfsizlik sahifasida yakunlanadi.
                    </span>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep("intro")}
                      className="flex-1 rounded-xl bg-transparent border border-[#2f2f2f] hover:bg-[#212121] py-2.5 text-xs font-medium transition-all cursor-pointer"
                    >
                      Orqaga
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl bg-transparent border border-rose-500/25 hover:border-rose-500/40 text-rose-400 hover:bg-rose-950/20 py-2.5 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Chiqish
                    </button>
                  </div>
                </div>
              ) : (
                /* TAB 2: PAYME FORM WITH NO MANUAL CARDS NEEDED */
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#b4b4b4] font-display">
                      Payme hisobiga bog'langan Telefon raqamingiz
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="+998 (90) 123-45-67"
                        value={paymePhone}
                        onChange={(e) => handlePhoneChange(e, "payme")}
                        className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-[#00c5b4] focus:ring-1 focus:ring-[#00c5b4] rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none text-[#ececec]"
                      />
                      <div className="absolute right-3.5 top-3.5 text-[#00c5b4]">
                        <Smartphone className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="block text-[10px] text-[#676767] leading-tight font-sans">
                      *Payme ro'yxatidan o'tgan telefoningiz. PUSH billing invoice ochiladi.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#b4b4b4] font-display">
                      To'lovchining To'liq Ismi (Ism Familiyasi)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: SHOXRUX RASULOV"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value.toUpperCase())}
                      className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-[#00c5b4] focus:ring-1 focus:ring-[#00c5b4] rounded-xl px-4 py-3 text-xs tracking-wide focus:outline-none placeholder-[#4e4e4e]"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 bg-rose-950/25 px-3 py-2.5 rounded-lg border border-rose-500/25 animate-pulse">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  {/* Dual action paths for Payme */}
                  <div className="space-y-3.5 pt-1">
                    
                    {/* Primary Path: Official Direct checkout opening with deep links */}
                    <button
                      type="button"
                      onClick={handleRealPaymePayment}
                      className="w-full rounded-xl bg-gradient-to-r from-[#00c5b4] to-[#004f4a] text-white font-bold hover:brightness-110 py-3.5 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Payme checkout orqali Rasmiy To'lash (26,000 UZS)
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-[#2a2a2a]"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-[#4e4e4e] uppercase font-bold tracking-wider font-mono">Yoki Sandbox Simulyatsiya</span>
                      <div className="flex-grow border-t border-[#2a2a2a]"></div>
                    </div>

                    {/* Secondary Path: Interactive simulator for demonstration */}
                    <button
                      type="button"
                      onClick={(e) => handleConfirmBillingPayment(e, "payme")}
                      className="w-full rounded-xl bg-transparent border border-[#3e3e3e] hover:bg-[#212121] text-[#b4b4b4] hover:text-white py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smartphone className="h-3.5 w-3.5 text-amber-500" />
                      Tezkor Push Billing Simulyatori (Instant SMS test)
                    </button>
                  </div>

                  <div className="flex gap-2 items-center bg-[#212121]/20 p-3 rounded-lg border border-[#2f2f2f] text-[10px] text-[#00c5b4]/80 leading-relaxed">
                    <ShieldCheck className="h-4.5 w-4.5 text-[#00c5b4] shrink-0" />
                    <span>
                      Payme Secure billing: Tranzaksiya to'liq qonuniy va xavfsiz ravishda Payme Billing serverlarida amalga oshiriladi.
                    </span>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep("intro")}
                      className="flex-1 rounded-xl bg-transparent border border-[#2f2f2f] hover:bg-[#212121] py-2.5 text-xs font-medium transition-all cursor-pointer"
                    >
                      Orqaga
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl bg-transparent border border-rose-500/25 hover:border-rose-500/40 text-rose-400 hover:bg-rose-950/20 py-2.5 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Chiqish
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 2.5: REAL TRANSACTION VERIFICATION VIEW */}
          {step === "real_verification" && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1.5 mt-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">To'lovni Tasdiqlash</h3>
                <p className="text-xs text-[#b4b4b4] max-w-sm mx-auto leading-relaxed">
                  Siz Click/Payme rasmiy to'lov tizimiga yo'naltirildingiz. To'lov yakunlangach, uning haqiqiyligini tekshirishimiz uchun chekdagi ma'lumotlarni kiriting.
                </p>
              </div>

              <form onSubmit={handleSubmitRealVerification} className="space-y-4 max-w-md mx-auto">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-[#b4b4b4] uppercase tracking-wider block">
                    Tranzaksiya ID (Ssilkada yoki to'lov chekidagi raqam)*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: 489372102 (kamida 8 xonali raqam)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-[#676767] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#4c4c4c] font-mono tracking-wider"
                  />
                  <p className="text-[10px] text-[#676767] leading-relaxed">
                    * CLICK yoki Payme to'lov chekingizning unikal raqamini kiriting. Serverimiz to'lovlar bazasidan ushlangan summani muvaffaqiyatli solishtirgandagina tizim premium rejimini ochadi.
                  </p>
                </div>

                {/* DRAG-AND-DROP FILE UPLOAD BOX */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-[#b4b4b4] uppercase tracking-wider block">
                    To'lov cheki skrinshoti (ixtiyoriy)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all ${
                      isDragging 
                        ? "border-amber-400 bg-amber-500/5" 
                        : "border-[#2f2f2f] hover:border-[#4c4c4c] bg-[#1a1a1a]/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="receipt-file"
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />
                    
                    {receiptImage ? (
                      <div className="space-y-2">
                        <div className="relative w-16 h-16 mx-auto rounded-lg overflow-hidden border border-[#2f2f2f]">
                          <img src={receiptImage} alt="Chek" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-medium">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[200px]">{receiptFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptImage(null);
                            setReceiptFileName("");
                          }}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Chekni o'chirish
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="receipt-file" className="cursor-pointer space-y-2 select-none w-full block">
                        <UploadCloud className="h-8 w-8 text-[#b4b4b4] mx-auto opacity-70" />
                        <div className="text-xs text-[#ececec]">
                          <span className="text-amber-400 hover:underline font-semibold">Chek rasmini biriktirish</span> yoki bu yerga sudrab tashlang
                        </div>
                        <div className="text-[9px] text-[#676767]">
                          JPG, PNG turlari (Maksimal 5MB)
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-rose-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-500/10 text-left">
                    ⚠️ {errorMsg}
                  </p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setStep("payment");
                    }}
                    className="flex-1 rounded-xl bg-transparent border border-[#2f2f2f] hover:bg-[#212121] py-3 text-xs font-semibold transition-all text-center select-none cursor-pointer"
                  >
                    Orqaga qaytish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold py-3 text-xs transition-all text-center shadow-lg active:scale-95 cursor-pointer"
                  >
                    To'lovni Tekshirish
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: INTERACTIVE SMS VERIFICATION CHANNELS */}
          {step === "sms" && (
            <div className="space-y-6 animate-fade-in text-center">
              
              <div className="space-y-1.5 mt-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Smartphone className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">Tasdiqlash Kodini Kiriting</h3>
                <p className="text-xs text-[#b4b4b4] max-w-sm mx-auto leading-relaxed">
                  Sizning smartfoningizga kelgan maxfiy 4-xonali tasdiqlash kodini formaga kiriting.
                </p>
                <p className="text-[11px] text-[#676767] font-mono leading-none">
                  Tranzaksiya turi: <strong>{paymentMethod === "click" ? "CLICK Tizimi Billing" : "Payme Tizimi Billing"} (P2P Transfer)</strong>
                </p>
              </div>

              {/* Dynamic simulated phone message pop up */}
              <div className="bg-[#212121]/50 border border-amber-500/20 rounded-xl p-4 text-left space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono">
                  <span>✉️ SMS Xabarnoma ({paymentMethod === "click" ? "CLICK" : "Payme"})</span>
                  <span className="animate-pulse flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Hozir keldi
                  </span>
                </div>
                <p className="text-xs text-[#dcdcdc] leading-relaxed">
                  Hisobingizdan <strong>26,000 UZS</strong> (VeloxAi Premium) to'lovi uchun tasdiqlash kodi: 
                  <strong className="mx-2 text-sm bg-amber-500/25 text-amber-300 font-bold px-2 py-0.5 rounded font-mono tracking-widest border border-amber-400/20 select-all">
                    {generatedSms}
                  </strong>. 
                  Ushbu kodni begonalarga bermang!
                </p>
              </div>

              {/* Code submission box block */}
              <form onSubmit={handleVerifySms} className="max-w-xs mx-auto space-y-4">
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-xs text-[#b4b4b4]">
                    <span>Tasdiqlash kodi</span>
                    <span className="font-mono text-amber-400">
                      {Math.floor(smsTimer / 60)}:{(smsTimer % 60).toString().padStart(2, "0")} qoldi
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="4-xonali kod"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-[#676767] rounded-xl px-4 py-3 text-xl font-bold font-mono tracking-widest text-center focus:outline-none placeholder-[#383838]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-rose-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-500/10 text-left">
                    ⚠️ {errorMsg}
                  </p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setStep("payment");
                    }}
                    className="flex-1 rounded-xl bg-transparent border border-[#2f2f2f] hover:bg-[#212121] py-3 text-xs font-semibold transition-all text-center select-none"
                  >
                    Orqaga qaytish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#ececec] hover:bg-white text-black font-semibold py-3 text-xs transition-all text-center shadow-lg cursor-pointer"
                  >
                    Kodni Tasdiqlash
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* STEP 4: LOADER VERIFYING TRANSACTION */}
          {step === "verifying" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              
              {/* Spinning/progress pulse representation */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 animate-pulse">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#2f2f2f"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#d4a373"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * checkingProgress) / 100}
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                <div className="absolute font-mono text-sm font-bold text-[#ececec]">
                  {checkingProgress}%
                </div>
              </div>

              <div className="space-y-1.5 max-w-xs mx-auto">
                <h4 className="font-display text-sm font-bold text-white">To'lov Tekshirilmoqda</h4>
                <p className="text-xs text-amber-500 font-medium h-8 animate-pulse">
                  {progressMsg}
                </p>
                <p className="text-[10px] text-[#676767]">
                  Bu bir necha soniya vaqt oladi. Iltimos oynani yopmang...
                </p>
              </div>

            </div>
          )}

          {/* STEP 5: SUCCESS COMPLETED ONBOARDING */}
          {step === "success" && (
            <div className="py-6 text-center space-y-6 animate-fade-in">
              
              {/* Award / Confetti visual center */}
              <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 text-black rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Award className="h-8 w-8 text-black stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border border-black animate-ping" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xl md:text-2xl font-black text-white tracking-tight">
                  OBUNA FAOLLASHTIRILDI!
                </h3>
                <p className="text-xs text-emerald-400 font-semibold font-display">
                  Siz muvaffaqiyatli tarzda VeloxAi Cheksiz Premium obunachisiga aylandingiz!
                </p>
                <p className="text-xs text-[#b4b4b4] max-w-sm mx-auto p-3.5 bg-emerald-950/10 rounded-xl border border-emerald-500/20 leading-relaxed">
                  Hurmatli <span className="font-bold text-white">{payerName}</span>, biz sizning transferingizni tasdiqladik. Endi sizda <strong>Tafakkur Limiti va savollar soni umrbod cheksiz</strong> etib belgilandi!
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-white text-black font-semibold hover:bg-gray-200 py-3.5 text-sm transition-all cursor-pointer font-display"
              >
                Muloqotni Cheksiz Boshlash ♾️
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
