import { getAuth } from "firebase/auth";

const API_BASE = "http://localhost:5000";

async function authFetch(
    url: string,
    options: RequestInit = {}
) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not logged in");
    }

    const token = await user.getIdToken();

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API error");
    }

    return res.json();
}

/* =======================
   Portfolio APIs
======================= */

export const getPortfolio = () =>
    authFetch(`${API_BASE}/api/portfolio`);


export const buyCoin = (
    coinId: string,
    symbol: string,
    quantity: number,
    price: number
) =>
    authFetch(`http://localhost:5000/api/portfolio/buy`, {
        method: "POST",
        body: JSON.stringify({ coinId, symbol, quantity, price }),
    });


export const sellCoin = (
    coinId: string,
    quantity: number
) =>
    authFetch(`${API_BASE}/api/portfolio/sell`, {
        method: "POST",
        body: JSON.stringify({ coinId, quantity }),
    });
