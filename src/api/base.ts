import { getAuth } from "firebase/auth";
import { cacheManager } from "./cache";

export async function authFetch(
    url: string,
    options: RequestInit = {}
) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not logged in");
    }

    // Only cache GET requests
    const isGet = !options.method || options.method.toUpperCase() === "GET";

    if (isGet) {
        const cached = await cacheManager.get(url);
        if (cached) return cached;
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

    const data = await res.json();

    if (isGet) {
        await cacheManager.set(url, data);
    } else {
        // Clear all cache on mutations (Buy/Sell) to ensure fresh data across app
        await cacheManager.clear();
    }

    return data;
}
