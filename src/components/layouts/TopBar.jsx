import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MapPin, Truck, Globe, Search, CheckCircle2, Clock, Package, Check, Phone, Sparkles, X, Menu } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh-CN', name: 'Chinese (中文)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ko', name: 'Korean (한국어)' }
];

const exchangeRates = {
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  INR: 1,
  JPY: 1.87,
  AUD: 0.018,
  CAD: 0.016,
  AED: 0.044
};

export default function TopBar() {
  const { currency, setCurrency, availableCurrencies, loading } = useCurrency();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const topbarRef = useRef(null);
  
  const trackBtnRef = useRef(null);
  const langBtnRef = useRef(null);
  const currencyBtnRef = useRef(null);
  
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const [selectedLang, setSelectedLang] = useState({ code: 'en', name: 'English' });
  const [searchLang, setSearchLang] = useState("");

  const [orderId, setOrderId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update dropdown position for desktop
  const updateDropdownPosition = (ref) => {
    if (ref.current && !isMobile) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topbarRef.current && !topbarRef.current.contains(event.target)) {
        const portalDropdown = document.getElementById('topbar-portal-dropdown');
        if (portalDropdown && portalDropdown.contains(event.target)) {
          return;
        }
        setOpenDropdown(null);
        setMobileMenuOpen(false);
        if (trackResult) {
          setTimeout(() => { setTrackResult(null); setOrderId(""); }, 300);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [trackResult]);

  // Update position when dropdown opens on desktop
  useEffect(() => {
    if (!isMobile) {
      if (openDropdown === 'track') updateDropdownPosition(trackBtnRef);
      else if (openDropdown === 'lang') updateDropdownPosition(langBtnRef);
      else if (openDropdown === 'currency') updateDropdownPosition(currencyBtnRef);
    }
  }, [openDropdown, isMobile]);

  // Update position on scroll/resize for desktop
  useEffect(() => {
    if (isMobile) return;
    
    const handleUpdate = () => {
      if (openDropdown === 'track') updateDropdownPosition(trackBtnRef);
      else if (openDropdown === 'lang') updateDropdownPosition(langBtnRef);
      else if (openDropdown === 'currency') updateDropdownPosition(currencyBtnRef);
    };
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [openDropdown, isMobile]);

  // Google Translate setup
  useEffect(() => {
    if (!document.querySelector('#google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'google_translate_hidden_element'
        );
      };
    }
  }, []);

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setSearchLang("");

    const gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
      gtSelect.value = lang.code;
      gtSelect.dispatchEvent(new Event('change'));
    }
  };

  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(searchLang.toLowerCase())
  );

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (!orderId || orderId.length < 5) return;

    setIsTracking(true);
    setTrackResult(null);

    setTimeout(() => {
      setIsTracking(false);
      const statuses = ["shipped", "out_for_delivery", "delivered"];
      const randomStatus = statuses[orderId.length % 3];

      setTrackResult({
        id: orderId.toUpperCase(),
        status: randomStatus,
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      });
    }, 1500);
  };

  // Track Order Content
  const TrackOrderContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-serif font-bold text-lg sm:text-xl text-[#3b2416] flex items-center gap-2">
          <Package size={20} className="text-amber-500" /> Track Your Order
        </h4>
        <button 
          onClick={() => { setOpenDropdown(null); setTrackResult(null); setOrderId(""); }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      {!trackResult ? (
        <form onSubmit={handleTrackOrder} className="flex flex-col gap-4">
          <div className="relative">
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. YRN12345)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#3b2416] focus:ring-4 focus:ring-[#3b2416]/10 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isTracking}
            className="w-full bg-gradient-to-r from-[#3b2416] to-[#5a3820] text-white py-3 rounded-xl text-sm font-bold tracking-wider uppercase hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
          >
            {isTracking ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Tracking...
              </>
            ) : (
              <>
                <Search size={16} />
                Track Package
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-amber-50/30 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order ID</span>
            <p className="font-mono font-bold text-[#3b2416] text-lg">{trackResult.id}</p>
            <span className="text-xs text-gray-500 mt-1 block">📅 Estimated: {trackResult.date}</span>
          </div>

          <div className="relative pl-8 space-y-6 border-l-2 border-gray-100 ml-3 mt-6">
            <div className="relative">
              <div className="absolute -left-[37px] bg-emerald-500 rounded-full p-1.5 border-4 border-white shadow-md">
                <Check size={12} className="text-white" />
              </div>
              <p className="text-sm font-bold text-gray-800">Order Placed</p>
              <p className="text-xs text-gray-500 mt-1">We have received your order</p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[37px] rounded-full p-1.5 border-4 border-white shadow-md ${["shipped", "out_for_delivery", "delivered"].includes(trackResult.status) ? "bg-emerald-500" : "bg-gray-300"}`}>
                {["shipped", "out_for_delivery", "delivered"].includes(trackResult.status) ? 
                  <Check size={12} className="text-white" /> : 
                  <div className="w-3 h-3" />
                }
              </div>
              <p className={`text-sm font-bold ${["shipped", "out_for_delivery", "delivered"].includes(trackResult.status) ? "text-gray-800" : "text-gray-400"}`}>
                Shipped
              </p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[37px] rounded-full p-1.5 border-4 border-white shadow-md ${
                trackResult.status === "delivered" ? "bg-emerald-500" : 
                trackResult.status === "out_for_delivery" ? "bg-amber-500 animate-pulse" : "bg-gray-300"
              }`}>
                {trackResult.status === "delivered" ? 
                  <Check size={12} className="text-white" /> : 
                  <Truck size={12} className={trackResult.status === "out_for_delivery" ? "text-white" : "text-transparent"} />
                }
              </div>
              <p className={`text-sm font-bold ${
                trackResult.status === "delivered" ? "text-gray-800" : 
                trackResult.status === "out_for_delivery" ? "text-amber-600" : "text-gray-400"
              }`}>
                Out for Delivery
              </p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[37px] rounded-full p-1.5 border-4 border-white shadow-md ${
                trackResult.status === "delivered" ? "bg-emerald-500" : "bg-gray-300"
              }`}>
                {trackResult.status === "delivered" ? 
                  <CheckCircle2 size={12} className="text-white" /> : 
                  <div className="w-3 h-3" />
                }
              </div>
              <p className={`text-sm font-bold ${trackResult.status === "delivered" ? "text-emerald-600" : "text-gray-400"}`}>
                Delivered
              </p>
            </div>
          </div>

          <button
            onClick={() => { setTrackResult(null); setOrderId(""); }}
            className="w-full text-center text-sm font-semibold text-[#3b2416] hover:text-amber-600 pt-4 cursor-pointer transition-colors underline underline-offset-4"
          >
            Track Another Order
          </button>
        </div>
      )}
    </>
  );

  // Language Content
  const LanguageContent = () => (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-serif font-bold text-lg text-[#3b2416] flex items-center gap-2">
          <Globe size={20} className="text-amber-500" /> Select Language
        </h4>
        <button 
          onClick={() => setOpenDropdown(null)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search language..."
          value={searchLang}
          onChange={(e) => setSearchLang(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#3b2416] focus:ring-2 focus:ring-[#3b2416]/20 transition-all"
        />
      </div>
      <div className="max-h-[50vh] overflow-y-auto space-y-1">
        {filteredLanguages.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">No language found</div>
        ) : (
          filteredLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                selectedLang.code === lang.code 
                  ? 'bg-amber-50 font-bold text-[#3b2416]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{lang.name}</span>
              {selectedLang.code === lang.code && 
                <CheckCircle2 size={18} className="text-[#3b2416] flex-shrink-0" />
              }
            </button>
          ))
        )}
      </div>
    </>
  );

  // Currency Content
  const CurrencyContent = () => (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-serif font-bold text-lg text-[#3b2416] flex items-center gap-2">
          <Clock size={20} className="text-amber-500" /> Select Currency
        </h4>
        <button 
          onClick={() => setOpenDropdown(null)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-amber-50/30 p-3 rounded-xl mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Exchange Rates</span>
        <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Real-time updates
        </div>
      </div>
      <div className="max-h-[50vh] overflow-y-auto space-y-1">
        {availableCurrencies.map((currCode) => (
          <button
            key={currCode}
            onClick={() => { setCurrency(currCode); setOpenDropdown(null); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
              currency === currCode 
                ? 'bg-amber-50 font-bold text-[#3b2416]' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-base">{currCode}</span>
              <span className="text-xs text-gray-400">
                1 USD = {(1 / exchangeRates.USD * exchangeRates[currCode] || 1).toFixed(2)} {currCode}
              </span>
            </div>
            {currency === currCode && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <CheckCircle2 size={18} className="text-[#3b2416]" />
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );

  // Render dropdown
  const renderDropdown = () => {
    if (!openDropdown) return null;

    let content = null;

    switch (openDropdown) {
      case 'track':
        content = <TrackOrderContent />;
        break;
      case 'lang':
        content = <LanguageContent />;
        break;
      case 'currency':
        content = <CurrencyContent />;
        break;
    }

    // Mobile: Full screen modal
    if (isMobile) {
      return createPortal(
        <div 
          id="topbar-portal-dropdown"
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenDropdown(null);
              if (openDropdown === 'track') {
                setTrackResult(null);
                setOrderId("");
              }
            }
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"></div>
          
          {/* Modal Content */}
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            {content}
          </div>
        </div>,
        document.body
      );
    }

    // Desktop: Portal dropdown
    let width = "w-80";
    if (openDropdown === 'track') width = "w-96 lg:w-[28rem]";
    else if (openDropdown === 'lang') width = "w-64 sm:w-72";
    else if (openDropdown === 'currency') width = "w-48 sm:w-56";

    return createPortal(
      <div
        id="topbar-portal-dropdown"
        className={`fixed ${width} z-[99999] animate-in fade-in slide-in-from-top-2 duration-200`}
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${Math.max(dropdownPosition.right, 16)}px`,
        }}
      >
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {content}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body { top: 0px !important; position: static !important; }
          .goog-te-banner-frame { display: none !important; }
          .goog-te-gadget { display: none !important; color: transparent !important; }
          #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
          .goog-tooltip { display: none !important; }
          .goog-tooltip:hover { display: none !important; }
          #google_translate_hidden_element { display: none !important; }
        `
      }} />

      <div
        ref={topbarRef}
        className="bg-gradient-to-r from-[#1a0f0a] via-[#2a170e] to-[#1a0f0a] text-[#f4ede8] text-xs sm:text-sm h-auto sm:h-11 px-3 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between relative z-50 shadow-lg border-b border-amber-900/20"
      >
        <div id="google_translate_hidden_element"></div>

        <div className="flex items-center justify-between w-full sm:w-auto py-2 sm:py-0">
          <div className="hidden lg:flex items-center gap-5">
            <span className="font-light tracking-wide text-amber-100/80">
              <Phone size={12} className="inline mr-1" />
              Need Help?
              <a href="tel:+918356976167" className="font-semibold ml-1.5 hover:text-amber-300 transition-colors">
                +91 xxxxxxxxxx
              </a>
            </span>
          </div>

          <div className="flex-1 text-center lg:flex-none px-2">
            <span className="font-light tracking-wide text-amber-100/80 text-[11px] sm:text-xs lg:text-sm">
              <Sparkles size={12} className="inline mr-1 text-amber-400" />
              10% off First Purchase! Code:
              <span className="font-bold text-amber-400 ml-1 tracking-widest bg-amber-400/10 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                FIRST10
              </span>
            </span>
          </div>

          <button
            className="sm:hidden p-1.5 hover:bg-amber-900/20 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 lg:gap-5 h-full">
          <div ref={trackBtnRef} className="relative h-full flex items-center">
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300 transition-all duration-300 h-full px-2 py-1 rounded-lg hover:bg-amber-900/10"
              onClick={() => setOpenDropdown(openDropdown === 'track' ? null : 'track')}
            >
              <Truck size={14} className={`transition-colors ${openDropdown === 'track' ? 'text-amber-400' : ''}`} />
              <span className="hidden lg:inline font-medium text-xs lg:text-sm">Track Order</span>
            </div>
          </div>

          <div className="h-4 w-px bg-amber-100/20 hidden lg:block"></div>

          <div ref={langBtnRef} className="relative h-full flex items-center">
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300 transition-all duration-300 h-full px-2 py-1 rounded-lg hover:bg-amber-900/10"
              onClick={() => setOpenDropdown(openDropdown === 'lang' ? null : 'lang')}
            >
              <Globe size={14} className={`transition-colors ${openDropdown === 'lang' ? 'text-amber-400' : ''}`} />
              <span className="font-medium text-xs lg:text-sm">{selectedLang.name.split(' ')[0]}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 opacity-70 ${openDropdown === 'lang' ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <div className="h-4 w-px bg-amber-100/20 hidden lg:block"></div>

          <div ref={currencyBtnRef} className="relative h-full flex items-center">
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300 transition-all duration-300 h-full px-2 py-1 rounded-lg hover:bg-amber-900/10"
              onClick={() => setOpenDropdown(openDropdown === 'currency' ? null : 'currency')}
            >
              {loading ? (
                <span className="animate-pulse text-xs">...</span>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="font-bold tracking-wider text-xs lg:text-sm">{currency}</span>
                  <span className="text-[10px] text-amber-400/70 hidden lg:block">
                    1 USD = {(1 / exchangeRates.USD * exchangeRates[currency] || 1).toFixed(2)} {currency}
                  </span>
                </div>
              )}
              <ChevronDown size={14} className={`transition-transform duration-300 opacity-70 ${openDropdown === 'currency' ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden w-full border-t border-amber-900/20 mt-2 pt-2 pb-3 space-y-2">
            <button
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-amber-900/10 rounded-xl transition-colors"
              onClick={() => {
                setOpenDropdown('track');
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Truck size={18} className="text-amber-400" />
              </div>
              <div>
                <span className="font-medium text-sm block">Track Order</span>
                <span className="text-xs text-amber-100/50">Check your delivery status</span>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-amber-900/10 rounded-xl transition-colors"
              onClick={() => {
                setOpenDropdown('lang');
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Globe size={18} className="text-amber-400" />
              </div>
              <div>
                <span className="font-medium text-sm block">Language</span>
                <span className="text-xs text-amber-100/50">{selectedLang.name}</span>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-amber-900/10 rounded-xl transition-colors"
              onClick={() => {
                setOpenDropdown('currency');
                setMobileMenuOpen(false);
              }}
            >
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Clock size={18} className="text-amber-400" />
              </div>
              <div>
                <span className="font-medium text-sm block">Currency</span>
                <span className="text-xs text-amber-100/50">{currency}</span>
              </div>
            </button>

            <div className="px-3 pt-3 border-t border-amber-900/20">
              <a href="tel:+918356976167" className="flex items-center gap-3 text-sm text-amber-100/70 hover:text-amber-300">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-amber-400" />
                </div>
                <div>
                  <span className="font-medium block">Need Help?</span>
                  <span>+91 xxxxxxxxxx</span>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Render dropdown/modal */}
      {renderDropdown()}
    </>
  );
}