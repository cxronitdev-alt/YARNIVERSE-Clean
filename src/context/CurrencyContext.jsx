import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Currency symbols ka map
  const currencySymbols = {
    INR: "₹", USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$"
  };

  // Real-time API se live rates fetch karna (Base Currency: INR)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
        const data = await response.json();
        setRates(data.rates); // Live rates state mein save ho gaye
        setLoading(false);
      } catch (error) {
        console.error("Error fetching live exchange rates:", error);
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  // Price convert karne wala function
  const formatPrice = (priceInINR) => {
    // Agar API load nahi hui ya price invalid hai toh default INR dikhao
    if (!rates || !priceInINR) return `₹${Number(priceInINR || 0).toLocaleString('en-IN')}`;

    const rate = rates[currency];
    const convertedPrice = priceInINR * rate;
    const symbol = currencySymbols[currency] || currency;

    if (currency === "INR") {
      return `${symbol}${Math.round(convertedPrice).toLocaleString('en-IN')}`;
    }
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  // Hum sirf ye 6 currencies dropdown mein dikhayenge
  const availableCurrencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD"];

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatPrice, 
      availableCurrencies, 
      loading 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);