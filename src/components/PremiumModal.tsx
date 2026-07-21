import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Check, 
  Lock, 
  Zap, 
  Clock, 
  Search, 
  Award,
  ArrowRight,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Globe,
  MessageSquare,
  Flame,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Cpu,
  Bookmark,
  ShieldAlert,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface CardValidationResult {
  valid: boolean;
  hasFunds?: boolean;
  reason?: string;
  brand?: string;
}

export const isValidCardNumber = (num: string): CardValidationResult => {
  const clean = num.replace(/\D/g, "");
  if (clean.length !== 16) {
    return { valid: false, reason: "Karta raqami noto'g'ri. Iltimos, 16 ta raqam kiriting." };
  }
  
  // Standard test cards always valid & funded (ends with even number)
  const testCards = [
    "8600123456789012", // Uzcard (Valid, funded)
    "9860123456789012", // Humo (Valid, funded)
    "4111111111111112", // Visa (Valid, funded)
    "5412751234123456"  // Mastercard (Valid, funded)
  ];

  // Specific cards always valid but UN-funded (ends with odd number)
  const unfundedCards = [
    "8600123456789013", // Uzcard (Insufficient funds)
    "4111111111111111", // Visa (Insufficient funds)
    "9860123456789013"  // Humo (Insufficient funds)
  ];

  if (testCards.includes(clean)) {
    return { valid: true, hasFunds: true, brand: clean.startsWith("8600") ? "Uzcard" : clean.startsWith("9860") ? "HUMO" : clean.startsWith("4") ? "VISA" : "Mastercard" };
  }

  if (unfundedCards.includes(clean)) {
    return { valid: true, hasFunds: false, brand: clean.startsWith("8600") ? "Uzcard" : clean.startsWith("9860") ? "HUMO" : "VISA" };
  }

  // Luhn Algorithm Check
  let s = 0;
  let double = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    s += digit;
    double = !double;
  }
  
  const isLuhnValid = s % 10 === 0;
  if (!isLuhnValid) {
    return { valid: false, reason: "Karta raqami noto'g'ri (Luhn nazorat xatosi). Iltimos, qayta kiriting." };
  }

  // If it's Luhn-valid, we decide hasFunds based on whether the last digit of the card is even (has funds) or odd (insufficient funds)
  const lastDigit = parseInt(clean.charAt(clean.length - 1), 10);
  const hasFunds = lastDigit % 2 === 0;
  
  return { 
    valid: true, 
    hasFunds, 
    brand: clean.startsWith("8600") ? "Uzcard" : clean.startsWith("9860") ? "HUMO" : clean.startsWith("4") ? "VISA" : "Mastercard" 
  };
};

export default function PremiumModal({ isOpen, onClose, onSuccess }: PremiumModalProps) {
  // Steps: "plans" (features + selection), "checkout" (billing details), "processing" (high-security verification), "success" (unlocked state with receipt)
  const [step, setStep] = useState<"plans" | "checkout" | "processing" | "success">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"card" | "click" | "payme">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [errorMsg, setErrorMsg] = useState("");
  const [cardBrand, setCardBrand] = useState<"HUMO" | "Uzcard" | "VISA" | "Mastercard" | "Noma'lum">("Noma'lum");
  
  // Recipient / Merchant Card States
  const [merchantCard, setMerchantCard] = useState<string>(() => {
    try {
      return localStorage.getItem("velox_merchant_card") || "5514 6838 6168 6541";
    } catch (_) {
      return "5514 6838 6168 6541";
    }
  });
  const [merchantCardName, setMerchantCardName] = useState<string>(() => {
    try {
      return localStorage.getItem("velox_merchant_name") || "KOMRON";
    } catch (_) {
      return "KOMRON";
    }
  });
  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [tempMerchantCard, setTempMerchantCard] = useState("");
  const [tempMerchantName, setTempMerchantName] = useState("");

  // Simulated processing status messages
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMsg, setProcessingMsg] = useState("");

  // Secure Local Sandbox Configs
  const [clickMerchantId] = useState("14832");
  const [clickServiceId] = useState("28419");
  const [paymeMerchantId] = useState("659d4f12f07ab9b233a0123c");

  const getPriceDetails = () => {
    if (billingCycle === "monthly") {
      return { usd: "$3.00", uzs: "39,000 UZS", period: "oyiga", save: "" };
    }
    return { usd: "$25.00", uzs: "325,000 UZS", period: "yiliga", save: "30% tejash", rawSave: "143,000 UZS tejash" };
  };

  const getPaymentUrl = (method: "click" | "payme"): string => {
    const amount = billingCycle === "monthly" ? "39000" : "325000";
    const amountTiyin = billingCycle === "monthly" ? "3900000" : "32500000";
    const nameParam = encodeURIComponent(cardholderName || "Velox_Pro_Subscriber");
    
    if (method === "click") {
      return `https://my.click.uz/services/pay?service_id=${clickServiceId}&merchant_id=${clickMerchantId}&amount=${amount}&transaction_param=${nameParam}`;
    } else {
      return `https://checkout.paycom.uz/${paymeMerchantId}?m=user_id&a=${amountTiyin}`;
    }
  };

  // Real-time card type prefix detection
  useEffect(() => {
    const cleanNum = cardNumber.replace(/\D/g, "");
    if (cleanNum.startsWith("8600")) {
      setCardBrand("Uzcard");
    } else if (cleanNum.startsWith("9860")) {
      setCardBrand("HUMO");
    } else if (cleanNum.startsWith("4")) {
      setCardBrand("VISA");
    } else if (cleanNum.startsWith("5")) {
      setCardBrand("Mastercard");
    } else {
      setCardBrand("Noma'lum");
    }
  }, [cardNumber]);

  useEffect(() => {
    if (!isOpen) {
      setStep("plans");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardholderName("");
      setPhone("+998 ");
      setErrorMsg("");
      setProcessingProgress(0);
      setProcessingMsg("");
    }
  }, [isOpen]);

  // Satisfying processing animations sequence
  useEffect(() => {
    let interval: any;
    if (step === "processing") {
      const phrases = [
        "Xavfsiz SSL-256 shifrlangan tarmoq aloqasi o'rnatilmoqda...",
        "Bank protokoli billing tizimi bilan sinxronlashmoqda...",
        "Tranzaksiya muvaffaqiyatli tasdiqlandi. Kvitansiya yaratilmoqda...",
        "Velox Pro-Tafakkur kanallari va Gemini Pro klasteri faollashtirilmoqda...",
        "Tayyor! Cheksiz, yuqori tezlikdagi sun'iy intellekt xizmati faol!"
      ];
      
      setProcessingProgress(0);
      setProcessingMsg(phrases[0]);

      // Determine if there is sufficient funds
      let hasSufficientFunds = true;
      if (paymentMethod === "card") {
        const cleanCard = cardNumber.replace(/\D/g, "");
        const validation = isValidCardNumber(cleanCard);
        if (validation.valid && validation.hasFunds === false) {
          hasSufficientFunds = false;
        }
      }

      interval = setInterval(() => {
        setProcessingProgress((prev) => {
          const next = prev + 1;
          
          // Stop and fail at 50% if there are no funds
          if (!hasSufficientFunds && next >= 50) {
            clearInterval(interval);
            setTimeout(() => {
              setStep("checkout");
              setErrorMsg("To'lov rad etildi: Karta hisobida yetarli mablag' mavjud emas (Mablag' yetishmovchiligi xatoligi). Iltimos, kartangiz balansini to'ldiring yoki boshqa faol karta kiriting.");
            }, 800);
            return 50;
          }

          const phraseIdx = Math.min(Math.floor((next / 100) * phrases.length), phrases.length - 1);
          setProcessingMsg(phrases[phraseIdx]);

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
      }, 40);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, cardNumber, onSuccess]);

  if (!isOpen) return null;

  // Format inputs
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(" ") : v;
  };

  const formatCardExpiry = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length >= 2) {
      return clean.substring(0, 2) + "/" + clean.substring(2, 4);
    }
    return clean;
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = cardNumber.replace(/\D/g, "");
    
    const validation = isValidCardNumber(cleanCard);
    if (!validation.valid) {
      setErrorMsg(validation.reason || "Karta raqami xato.");
      return;
    }

    if (cardExpiry.length < 5) {
      setErrorMsg("Karta amal qilish muddati noto'g'ri (OY/YIL).");
      return;
    }
    if (cardCvc.length < 3) {
      setErrorMsg("Karta CVC/CVV kodi noto'g'ri (kamida 3 ta raqam).");
      return;
    }
    if (!cardholderName.trim()) {
      setErrorMsg("Karta egasining to'liq ism-familiyasini kiriting.");
      return;
    }
    setErrorMsg("");
    setStep("processing");
  };

  const handleMobileSubmit = (e: React.FormEvent, method: "click" | "payme") => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      setErrorMsg("Telefon raqamingizni to'liq kiriting: +998 (XX) XXX-XX-XX");
      return;
    }
    if (!cardholderName.trim()) {
      setErrorMsg("Tizimdagi ism-familiyangizni kiriting.");
      return;
    }
    setErrorMsg("");
    
    // Launch secure sandbox gateway
    const url = getPaymentUrl(method);
    window.open(url, "_blank");

    setStep("processing");
  };

  const currentPrice = getPriceDetails();

  return (
    <div 
      id="premium-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in"
    >
      <div 
        id="premium-modal-container"
        className="relative w-full max-w-5xl rounded-2xl border border-[#2f2f35] bg-[#0c0c0e] text-[#ececec] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[92vh] lg:max-h-[85vh]"
      >
        
        {/* Dynamic top-edge ambient gradient beam */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 z-10" />

        {/* Global Exit */}
        <button 
          id="premium-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-[#18181b]/90 hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-all z-20 active:scale-95 cursor-pointer"
          title="Yopish"
        >
          <X className="h-4 w-4" />
        </button>

        {/* LEFT COMPARTMENT: DISCOVER AND COMPARISON */}
        <div 
          id="premium-features-column"
          className="flex-1 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1f1f23] overflow-y-auto"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded font-display tracking-widest">
                VELOX ADVANCED
              </span>
              <span className="text-[#a1a1aa] text-xs font-medium">Professional Intelligence</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display mb-2">
              Barcha AI Chegaralarini Buzib O'ting
            </h2>
            <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
              Gemini Advanced, ChatGPT Plus va Claude Pro darajasidagi eng ilg'or kognitiv modellarga cheksiz, to'xtovsiz va real-vaqtda qidiruv imkoniyatlari bilan ega bo'ling.
            </p>

            {/* Structured Feature Comparison Checklist */}
            <div className="space-y-4 mb-6" id="features-comparison-list">
              <h4 className="text-[11px] font-bold text-[#71717a] uppercase tracking-widest font-display">
                Advanced obuna afzalliklari:
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#141416] border border-[#1f1f23] space-y-1">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Cheksiz Tezlik</span>
                  </div>
                  <p className="text-[11px] text-[#8e8e93]">Sutkalik quvvat va kutish vaqti cheklovlari butunlay olib tashlanadi.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#141416] border border-[#1f1f23] space-y-1">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Google Search Grounding+</span>
                  </div>
                  <p className="text-[11px] text-[#8e8e93]">Eng so'nggi ma'lumotlarni internet tarmog'idan izlash va tahlil qilish.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#141416] border border-[#1f1f23] space-y-1">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Cpu className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Gemini Advanced & GPT-4o</span>
                  </div>
                  <p className="text-[11px] text-[#8e8e93]">Murakkab mantiqiy fikrlash, tahlil, kodlash va rasm tahlili.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#141416] border border-[#1f1f23] space-y-1">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sliders className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Foydalanuvchi Shaxsiylashtirish</span>
                  </div>
                  <p className="text-[11px] text-[#8e8e93]">Tizim sozlamalari, ko'rsatmalari va eslab qolish xotirasini sozlash.</p>
                </div>
              </div>

              {/* Free vs Pro Comparison mini panel */}
              <div className="rounded-xl border border-[#27272a]/40 bg-[#141416]/50 p-4 mt-4">
                <div className="grid grid-cols-3 text-center text-xs font-bold pb-2 border-b border-[#27272a]/40">
                  <span className="text-left text-[#71717a]">IMKONIYAT</span>
                  <span className="text-[#a1a1aa]">ODDIY REJA</span>
                  <span className="text-amber-400 font-extrabold flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3 fill-amber-400/20" /> PRO ADVANCED
                  </span>
                </div>
                <div className="space-y-2.5 pt-2.5 text-[11px]">
                  <div className="grid grid-cols-3">
                    <span className="text-[#a1a1aa] font-medium">Model tezligi</span>
                    <span className="text-center text-[#71717a]">Me'yoriy</span>
                    <span className="text-center text-white font-bold">Maksimal (Turbomode)</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[#a1a1aa] font-medium">Internet qidiruv</span>
                    <span className="text-center text-[#71717a]">Yo'q</span>
                    <span className="text-center text-white font-bold">Faol (Grounding)</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[#a1a1aa] font-medium">API_KEY sozlash</span>
                    <span className="text-center text-[#71717a]">Majburiy / Kvotalik</span>
                    <span className="text-center text-white font-bold">Talab qilinmaydi ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1f1f23] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#71717a]">
              <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="text-[11px]">PCI-DSS va SSL bilan himoyalangan xavfsiz to'lov tizimi.</span>
            </div>
            <span className="text-xs font-bold text-white font-mono shrink-0">VeloxAi Inc.</span>
          </div>
        </div>

        {/* RIGHT COMPARTMENT: DYNAMIC CHECKOUT GATEWAY */}
        <div 
          id="premium-checkout-column"
          className="flex-1 p-6 md:p-8 bg-[#121214] flex flex-col justify-between overflow-y-auto min-h-[420px]"
        >
          
          {/* STEP 1: BILLING CHOICE AND SUBSCRIPTION PLANS */}
          {step === "plans" && (
            <div className="space-y-6 my-auto" id="plans-selection-step">
              <div>
                <h4 className="text-sm font-bold text-white mb-3 text-left">To'lov davrini tanlang:</h4>
                
                {/* Custom billing switch */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#1a1a1e] rounded-xl border border-[#27272a] mb-5">
                  <button
                    id="billing-monthly-btn"
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      billingCycle === "monthly"
                        ? "bg-[#2d2d34] text-white shadow"
                        : "text-[#71717a] hover:text-white"
                    }`}
                  >
                    Oylik Obuna
                  </button>
                  <button
                    id="billing-yearly-btn"
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      billingCycle === "yearly"
                        ? "bg-[#2d2d34] text-white shadow"
                        : "text-[#71717a] hover:text-white"
                    }`}
                  >
                    Yillik Obuna
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide">
                      CHEGIRMA
                    </span>
                  </button>
                </div>

                {/* Selected Plan Cost Previewer */}
                <div className="bg-[#1a1a1e] border border-[#27272a] rounded-xl p-5 space-y-3 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl pointer-events-none rounded-full" />
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-[#a1a1aa] font-medium">Velox Advanced Pro</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-display">
                        {currentPrice.usd}
                      </span>
                      <span className="text-xs text-[#71717a]">
                        / {currentPrice.period}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-3 border-t border-[#27272a]/50 text-[#71717a]">
                    <span>O'zbekiston milliy valyutasida:</span>
                    <span className="text-amber-400 font-extrabold font-mono text-sm">
                      {currentPrice.uzs}
                    </span>
                  </div>

                  {billingCycle === "yearly" && (
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] py-2 px-3 rounded-lg text-center font-bold">
                      💡 Yillik obuna orqali jami {currentPrice.rawSave} olasiz!
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic premium visual markers */}
              <div className="space-y-3 pt-1 text-left">
                <div className="flex items-center gap-2.5 text-xs text-[#a1a1aa]">
                  <Flame className="h-4 w-4 text-amber-500 shrink-0 animate-bounce" />
                  <span>Tezkor yuklama ustuvorligi (High Demand vaqtida ham)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#a1a1aa]">
                  <MessageSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Suhbatlar tarixini bulutli saqlash va sinxronlash</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#a1a1aa]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Istalgan vaqtda obunani bekor qilish imkoniyati</span>
                </div>
              </div>

              <button
                id="plans-continue-btn"
                onClick={() => setStep("checkout")}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black hover:from-amber-600 hover:to-yellow-600 py-4 text-sm transition-all shadow-lg hover:shadow-yellow-500/25 flex items-center justify-center gap-2 select-none cursor-pointer active:scale-95"
              >
                Faollashtirish sahifasiga o'tish <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL SECURE CHECKOUT WITH INTEGRATIONS */}
          {step === "checkout" && (
            <div className="space-y-4 my-auto" id="checkout-form-step">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Xavfsiz hisob-kitob:</h4>
                <button 
                  id="checkout-back-plans-btn"
                  onClick={() => setStep("plans")}
                  className="text-xs text-amber-500 hover:text-amber-400 hover:underline cursor-pointer font-semibold"
                >
                  Tarifni o'zgartirish
                </button>
              </div>

              {/* Uzbekistan Integrated Systems selector tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1a1a1e] rounded-xl border border-[#27272a] text-xs">
                <button
                  id="tab-payment-card"
                  type="button"
                  onClick={() => { setPaymentMethod("card"); setErrorMsg(""); }}
                  className={`py-2.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === "card" 
                      ? "bg-[#2d2d34] text-white shadow" 
                      : "text-[#71717a] hover:text-white"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Milliy / Visa
                </button>
                <button
                  id="tab-payment-click"
                  type="button"
                  onClick={() => { setPaymentMethod("click"); setErrorMsg(""); }}
                  className={`py-2.5 rounded-lg font-black transition-all cursor-pointer ${
                    paymentMethod === "click" 
                      ? "bg-[#102a45] text-[#00aef0] shadow border border-[#00aef0]/20" 
                      : "text-[#71717a] hover:text-[#00aef0]"
                  }`}
                >
                  CLICK
                </button>
                <button
                  id="tab-payment-payme"
                  type="button"
                  onClick={() => { setPaymentMethod("payme"); setErrorMsg(""); }}
                  className={`py-2.5 rounded-lg font-black transition-all cursor-pointer ${
                    paymentMethod === "payme" 
                      ? "bg-[#0b2d28] text-[#00c5b4] shadow border border-[#00c5b4]/20" 
                      : "text-[#71717a] hover:text-[#00c5b4]"
                  }`}
                >
                  Payme
                </button>
              </div>

              {/* Qabul qiluvchi (Sotuvchi) Karta Ma'lumotlari */}
              <div className="p-3.5 bg-[#161619]/90 border border-amber-500/15 rounded-xl space-y-2 text-left text-xs shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-amber-500" /> Qabul qiluvchi (Sotuvchi) Karta:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempMerchantCard(merchantCard);
                      setTempMerchantName(merchantCardName);
                      setIsEditingMerchant(true);
                    }}
                    className="text-[10px] text-amber-500 hover:text-amber-400 hover:underline cursor-pointer font-bold transition-all"
                  >
                    Karta raqamini o'zgartirish
                  </button>
                </div>
                {isEditingMerchant ? (
                  <div className="space-y-2.5 p-2.5 bg-[#202025] rounded-lg border border-[#2d2d34] animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#8e8e93] uppercase tracking-wide">Karta raqami</label>
                        <input
                          type="text"
                          maxLength={19}
                          value={tempMerchantCard}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                            const parts = [];
                            for (let i = 0; i < v.length; i += 4) {
                              parts.push(v.substring(i, i + 4));
                            }
                            setTempMerchantCard(parts.join(" "));
                          }}
                          className="w-full bg-[#121214] border border-[#27272a] focus:border-amber-500 rounded px-2.5 py-1.5 text-xs font-mono text-white tracking-wider outline-none"
                          placeholder="8600 •••• •••• ••••"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#8e8e93] uppercase tracking-wide">Egasining Ismi</label>
                        <input
                          type="text"
                          value={tempMerchantName}
                          onChange={(e) => setTempMerchantName(e.target.value.toUpperCase())}
                          className="w-full bg-[#121214] border border-[#27272a] focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white uppercase outline-none"
                          placeholder="Masalan: KOMRON"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setIsEditingMerchant(false)}
                        className="px-2.5 py-1.5 bg-transparent hover:bg-[#2c2c35] rounded-lg text-gray-400 font-medium transition-colors cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = tempMerchantCard.replace(/\D/g, "");
                          if (clean.length !== 16) {
                            setErrorMsg("Qabul qiluvchi karta raqami 16 ta raqam bo'lishi kerak!");
                            return;
                          }
                          setMerchantCard(tempMerchantCard);
                          setMerchantCardName(tempMerchantName || "KOMRON");
                          localStorage.setItem("velox_merchant_card", tempMerchantCard);
                          localStorage.setItem("velox_merchant_name", tempMerchantName || "KOMRON");
                          setIsEditingMerchant(false);
                          setErrorMsg("");
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-colors cursor-pointer"
                      >
                        Saqlash
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[#ececec] p-2 bg-[#121214] rounded-lg border border-[#232328]">
                    <div className="flex items-center gap-2">
                      <div className="h-5 px-1.5 rounded bg-amber-500/10 border border-amber-500/25 flex items-center justify-center font-bold text-[8px] text-amber-500 tracking-wider font-sans uppercase">
                        {merchantCard.startsWith("9860") ? "HUMO" : merchantCard.startsWith("8600") ? "UZCARD" : "CARD"}
                      </div>
                      <span className="font-mono text-xs font-bold tracking-widest text-emerald-400">{merchantCard}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{merchantCardName}</span>
                  </div>
                )}
              </div>

              {/* METHOD A: DIRECT PLASTIC CARD DEBIT GATEWAY */}
              {paymentMethod === "card" && (
                <form id="card-payment-form" onSubmit={handleCardSubmit} className="space-y-4">
                  
                  {/* Real-time high-fidelity credit card simulation */}
                  <div className="relative h-44 rounded-xl bg-gradient-to-tr from-[#1b1b1f] via-[#232329] to-[#2d2d34] p-5 text-white overflow-hidden shadow-lg border border-[#2d2d34] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
                    
                    <div className="flex justify-between items-start">
                      {/* Gold Chip element */}
                      <div className="h-9 w-12 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <div className="w-7 h-5 bg-amber-600/50 rounded-sm" />
                      </div>
                      <span className="text-xs font-black font-mono tracking-widest text-amber-500">
                        {cardBrand === "Noma'lum" ? "DEBIT CARD" : cardBrand.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[10px] text-[#71717a] font-mono tracking-wide uppercase">Karta raqami</span>
                      <span className="block text-lg font-black font-mono tracking-widest text-[#ececec]">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <span className="block text-[8px] text-[#71717a] uppercase font-mono">Egasining ismi</span>
                        <span className="block text-xs font-bold font-mono uppercase tracking-wider truncate max-w-[170px]">
                          {cardholderName || "SHOXRUX RASULOV"}
                        </span>
                      </div>
                      <div className="flex gap-5">
                        <div>
                          <span className="block text-[8px] text-[#71717a] uppercase font-mono">Muddati</span>
                          <span className="block text-xs font-bold font-mono">
                            {cardExpiry || "OY/YIL"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-[#71717a] uppercase font-mono">CVC</span>
                          <span className="block text-xs font-bold font-mono">
                            {cardCvc ? "•••" : "000"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Credit Card input rows */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Karta raqami (Uzcard, Humo, Visa, Mastercard)</label>
                      <input
                        id="input-card-number"
                        type="text"
                        required
                        maxLength={19}
                        placeholder="8600 •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="w-full bg-[#1a1a1e] border border-[#27272a] focus:border-amber-500 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider focus:outline-none text-[#ececec]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Amal qilish muddati</label>
                      <input
                        id="input-card-expiry"
                        type="text"
                        required
                        maxLength={5}
                        placeholder="OY/YIL"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                        className="w-full bg-[#1a1a1e] border border-[#27272a] focus:border-amber-500 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider text-center focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">CVC / CVV kodi</label>
                      <input
                        id="input-card-cvc"
                        type="password"
                        required
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-[#1a1a1e] border border-[#27272a] focus:border-amber-500 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider text-center focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Egasining Ism va Familiyasi (Lotincha)</label>
                      <input
                        id="input-card-holder"
                        type="text"
                        required
                        placeholder="Masalan: SHOXRUX RASULOV"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        className="w-full bg-[#1a1a1e] border border-[#27272a] focus:border-amber-500 rounded-lg px-3 py-2.5 text-xs focus:outline-none text-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Test card helpers */}
                  <div className="p-3 bg-[#161619] border border-[#232328] rounded-lg space-y-1.5 text-left text-[11px] text-[#8e8e93] leading-relaxed">
                    <span className="block font-bold text-amber-500 uppercase tracking-wider text-[9px]">Sinov va Test rejimi ma'lumotlari:</span>
                    <p>Muvaffaqiyatli to'lov uchun (balansi bor): <code className="text-emerald-400 font-mono">8600 1234 5678 9012</code> (Luhn-to'g'ri va oxirgi raqami juft) karta raqamini kiriting.</p>
                    <p>Mablag' yetishmovchiligi xatoligi uchun (balanssiz): <code className="text-rose-400 font-mono">8600 1234 5678 9013</code>, <code className="text-rose-400 font-mono">4111 1111 1111 1111</code> (oxirgi raqami toq) kartalaridan foydalaning.</p>
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 bg-rose-950/25 px-3 py-2 rounded-lg border border-rose-500/20 text-left">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      id="card-btn-back"
                      type="button"
                      onClick={() => setStep("plans")}
                      className="flex-1 rounded-xl bg-transparent border border-[#27272a] hover:bg-[#1a1a1e] py-3 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Orqaga
                    </button>
                    <button
                      id="card-btn-submit"
                      type="submit"
                      className="flex-1 rounded-xl bg-[#ececec] hover:bg-white text-black font-extrabold py-3 text-xs transition-all shadow-md cursor-pointer text-center"
                    >
                      {currentPrice.uzs} To'lash
                    </button>
                  </div>
                </form>
              )}

              {/* METHOD B: MOBILE TELECOM SYSTEMS (CLICK / PAYME) */}
              {(paymentMethod === "click" || paymentMethod === "payme") && (
                <form id="mobile-payment-form" onSubmit={(e) => handleMobileSubmit(e, paymentMethod)} className="space-y-4">
                  <div className="space-y-4 p-5 bg-[#1a1a1e] border border-[#27272a] rounded-xl text-left">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#a1a1aa]">
                        {paymentMethod.toUpperCase()} tizimidagi telefon raqamingiz:
                      </label>
                      <div className="relative">
                        <input
                          id="input-mobile-phone"
                          type="text"
                          required
                          placeholder="+998 (90) 123-45-67"
                          value={phone}
                          onChange={(e) => {
                            const input = e.target.value;
                            if (!input.startsWith("+998")) {
                              setPhone("+998 ");
                              return;
                            }
                            const digits = input.substring(5).replace(/\D/g, "");
                            let formatted = "+998 ";
                            if (digits.length > 0) formatted += "(" + digits.substring(0,2);
                            if (digits.length > 2) formatted += ") " + digits.substring(2,5);
                            if (digits.length > 5) formatted += "-" + digits.substring(5,7);
                            if (digits.length > 7) formatted += "-" + digits.substring(7,9);
                            setPhone(formatted);
                          }}
                          className="w-full bg-[#121214] border border-[#27272a] focus:border-amber-500 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider focus:outline-none text-white"
                        />
                        <Smartphone className="absolute right-3 top-3 h-4.5 w-4.5 text-[#71717a]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#a1a1aa]">
                        Ism va Familiyangiz:
                      </label>
                      <input
                        id="input-mobile-name"
                        type="text"
                        required
                        placeholder="Masalan: SHOXRUX RASULOV"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        className="w-full bg-[#121214] border border-[#27272a] focus:border-amber-500 rounded-lg px-3 py-2.5 text-xs focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 bg-rose-950/25 px-3 py-2 rounded-lg border border-rose-500/20 text-left">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      id="mobile-btn-back"
                      type="button"
                      onClick={() => setStep("plans")}
                      className="flex-1 rounded-xl bg-transparent border border-[#27272a] hover:bg-[#1a1a1e] py-3 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Orqaga
                    </button>
                    <button
                      id="mobile-btn-submit"
                      type="submit"
                      className={`flex-1 rounded-xl font-extrabold py-3 text-xs transition-all shadow-md cursor-pointer text-center text-white ${
                        paymentMethod === "click" 
                          ? "bg-gradient-to-r from-[#00aef0] to-[#0a5a9e] hover:brightness-110" 
                          : "bg-gradient-to-r from-[#00c5b4] to-[#014e47] hover:brightness-110"
                      }`}
                    >
                      {paymentMethod.toUpperCase()} orqali To'lash
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: HIGH-SECURITY BANK BILLING HANDSHAKE */}
          {step === "processing" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 my-auto" id="processing-step">
              
              {/* Spinning circular progress display */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#1a1a1e"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * processingProgress) / 100}
                    className="transition-all duration-100 ease-out"
                  />
                </svg>
                <div className="absolute font-mono text-sm font-black text-white">
                  {processingProgress}%
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <h4 className="font-display text-sm font-bold text-white">Xavfsiz Tranzaksiya</h4>
                <p className="text-xs text-amber-500 font-semibold h-10 animate-pulse px-2 leading-relaxed">
                  {processingMsg}
                </p>
                <p className="text-[10px] text-[#71717a]">
                  Billing to'lov tranzaksiyasi tahlil qilinmoqda. Tarmoq aloqasini uzmang yoki sahifani tark etmang.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: GORGEOUS SUCCESS UNLOCKED DISPLAY */}
          {step === "success" && (
            <div className="py-6 text-center space-y-6 my-auto animate-fade-in" id="success-step">
              <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 text-black rounded-full flex items-center justify-center shadow-xl">
                <Award className="h-8 w-8 text-black stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-black animate-ping" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xl font-black text-white tracking-tight uppercase">
                  Advanced Obunangiz Faol!
                </h3>
                <p className="text-xs text-emerald-400 font-bold font-display">
                  Tabriklaymiz! Siz muvaffaqiyatli premium statusiga o'tdingiz.
                </p>
                
                {/* Simulated high-fidelity invoice receipt */}
                <div className="bg-[#1a1a1e] border border-[#27272a] rounded-xl p-4 text-left space-y-2.5 text-xs leading-relaxed text-[#a1a1aa] max-w-md mx-auto font-mono">
                  <div className="flex justify-between border-b border-[#27272a] pb-2 text-white font-bold">
                    <span>TO'LOV CHЕKI</span>
                    <span className="text-emerald-400 font-extrabold uppercase">[FAOL]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mijoz:</span>
                    <span className="text-white font-medium">{cardholderName || "SHOXRUX RASULOV"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarif rejasi:</span>
                    <span className="text-white font-medium">Velox Advanced ({billingCycle === "monthly" ? "Oylik" : "Yillik"})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qabul qiluvchi:</span>
                    <span className="text-white font-medium">{merchantCardName} ({merchantCard})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tranzaksiya turi:</span>
                    <span className="text-white font-medium">{paymentMethod.toUpperCase()} Gateway</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#27272a]/40">
                    <span>Jami yechilgan summa:</span>
                    <span className="text-amber-400 font-black">{currentPrice.uzs}</span>
                  </div>
                </div>
              </div>

              <button
                id="success-continue-btn"
                onClick={onClose}
                className="w-full rounded-xl bg-white text-black font-extrabold hover:bg-gray-100 py-4 text-sm transition-all cursor-pointer font-display select-none active:scale-95"
              >
                Cheksiz suhbatni boshlash ♾️
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
