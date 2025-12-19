import Header from "./components/Header";
import MarketTable from "./components/MarketTable";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import CoinDetails from "./pages/CoinDetails";

export default function App() {
  const [coins, setCoins] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "stable" | "layer1" | "alt">("all");
  const [sort, setSort] = useState<"market_cap" | "price" | "volume_24h" | "rank">("market_cap");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // 🔹 Fetch market data
  useEffect(() => {
    let url = "http://localhost:5000/api/coins/listings-with-info";
    const params = new URLSearchParams();

    if (filter !== "all") params.append("filter", filter);
    if (sort !== "rank") {
      params.append("sort", sort);
      params.append("order", order);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setCoins(data))
      .catch(err => console.error("API error:", err));
  }, [filter, sort, order]);

  // 🔹 Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const filterButtonClass = (value: string) =>
    filter === value
      ? "px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-sm"
      : "px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200";

  return (
    <Routes>
      {/* MARKET PAGE */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-400">
            <Header
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              sort={sort}
              order={order}
              setSort={setSort}
              setOrder={setOrder}
            />

            <div className="px-8 py-4">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-sm font-medium">
                  Dashboard
                </button>
                <button className="px-6 py-2 bg-white border rounded-xl shadow-sm font-medium hover:bg-gray-50">
                  Categories
                </button>
                <button className="px-6 py-2 bg-white border rounded-xl shadow-sm font-medium hover:bg-gray-50">
                  Portfolio
                </button>
              </div>

              {/* Main Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-1">Market</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Click a row for full details page.
                </p>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                  <button onClick={() => setFilter("all")} className={filterButtonClass("all")}>All</button>
                  <button onClick={() => setFilter("stable")} className={filterButtonClass("stable")}>Stable</button>
                  <button onClick={() => setFilter("layer1")} className={filterButtonClass("layer1")}>Layer 1</button>
                  <button onClick={() => setFilter("alt")} className={filterButtonClass("alt")}>Alt</button>
                </div>

                <MarketTable coins={coins} />
              </div>
            </div>
          </div>
        }
      />

      {/* DETAILS PAGE */}
      <Route path="/coin/:id" element={<CoinDetails />} />
    </Routes>
  );
}
