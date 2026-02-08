import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Currency = "USD" | "INR" | "EUR" | "GBP";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    rates: Record<string, number>;
    convert: (usdPrice: number) => number;
    format: (usdPrice: number) => string;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        return (localStorage.getItem("preferred_currency") as Currency) || "USD";
    });
    const [rates, setRates] = useState<Record<string, number>>({
        USD: 1,
        INR: 83.0, // Fallback defaults
        EUR: 0.92,
        GBP: 0.79,
    });
    const [loading, setLoading] = useState(true);

    const fetchRates = useCallback(async () => {
        try {
            setLoading(true);
            // Using freecurrencyapi.com - Base is USD
            // Note: Ideally the API key should be in an env file
            const apiKey = import.meta.env.VITE_FREE_CURRENCY_API_KEY || "fca_live_PlaceholderKey";
            const response = await fetch(
                `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=INR,EUR,GBP,USD`
            );
            const data = await response.json();
            if (data.data) {
                setRates(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch exchange rates:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
        // Refresh rates every hour
        const interval = setInterval(fetchRates, 3600000);
        return () => clearInterval(interval);
    }, [fetchRates]);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem("preferred_currency", c);
    };

    const convert = useCallback((usdPrice: number) => {
        const rate = rates[currency] || 1;
        return usdPrice * rate;
    }, [currency, rates]);

    const format = useCallback((usdPrice: number) => {
        const converted = convert(usdPrice);
        const symbol = CURRENCY_SYMBOLS[currency];

        return `${symbol}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: currency === "USD" ? 2 : 2,
        })}`;
    }, [currency, convert]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, format, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
    return context;
};
