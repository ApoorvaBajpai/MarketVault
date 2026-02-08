import { useEffect, useState } from "react";
import { getPortfolio } from "../api/portfolio";
import { useAuth } from "../context/AuthContext";
import { sellCoin } from "../api/portfolio";


type Holding = {
  coinId: string;
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
};

type Portfolio = {
  holdings: Holding[];
};

export default function Portfolio() {
  const { user, loading: authLoading } = useAuth();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(false);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});



  useEffect(() => {
    if (authLoading) return; // ⛔ wait for Firebase

    if (!user) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      try {
        const data = await getPortfolio();
        setPortfolio(data);
      } catch (err: any) {
        setError(err.message || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [authLoading, user, reload]);

  useEffect(() => {
    const loadPrices = async () => {
      const token = await user?.getIdToken();
      if (!token) return;

      const res = await fetch(
        "http://localhost:5000/api/coins/listings-with-info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const map: Record<string, number> = {};
      data.forEach((c: any) => {
        map[c.symbol] = c.price;
      });

      console.log("PRICE MAP KEYS:", Object.keys(map));
      setPriceMap(map);
    };

    if (user) loadPrices();
  }, [user]);



  if (authLoading || loading) {
    return <div className="p-8 text-gray-500">Loading portfolio...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!portfolio || portfolio.holdings.length === 0) {
    return <div className="p-8 text-gray-500">No assets in portfolio</div>;
  }

  const totalInvested = portfolio.holdings.reduce(
    (sum, coin) => sum + coin.quantity * coin.avgBuyPrice,
    0
  );

  const totalCurrentValue = portfolio.holdings.reduce((sum, coin) => {
    const currentPrice = priceMap[coin.symbol] || 0;
    return sum + coin.quantity * currentPrice;
  }, 0);
  const profitLoss = totalCurrentValue - totalInvested;


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Portfolio</h1>
      <p className="mb-4 text-lg">
        <strong>Total Invested:</strong>{" "}
        ${totalInvested.toLocaleString()}
      </p>

      <p className="mb-1 text-lg">
        <strong>Current Value:</strong>{" "}
        ${totalCurrentValue.toLocaleString()}
      </p>

      <p
        className={`mb-4 text-lg ${profitLoss >= 0 ? "text-green-600" : "text-red-500"
          }`}
      >
        <strong>P / L:</strong>{" "}
        {profitLoss >= 0 ? "+" : "-"}$
        {Math.abs(profitLoss).toLocaleString()}
      </p>


      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-3 text-left">Coin</th>
            <th className="p-3 text-center">Quantity</th>
            <th className="p-3 text-center">Avg Buy Price</th>
            <th className="p-3 text-center">Action</th>
            <th className="p-3 text-center">Current Price</th>
            <th className="p-3 text-center">P / L</th>


          </tr>
        </thead>

        <tbody>

          {portfolio.holdings.map((coin) => {
            console.log("COIN ID:", coin.coinId, "PRICE:", priceMap[coin.coinId]);
            const currentPrice = priceMap[coin.symbol] || 0;
            const invested = coin.quantity * coin.avgBuyPrice;
            const currentValue = coin.quantity * currentPrice;
            const coinPL = currentValue - invested;

            return (
              <tr key={coin.coinId} className="border-t dark:border-gray-700">
                <td className="p-3">{coin.symbol}</td>
                <td className="p-3 text-center">{coin.quantity}</td>
                <td className="p-3 text-center">
                  ${coin.avgBuyPrice.toLocaleString()}
                </td>


                <td className="p-3 text-center">
                  ${currentPrice.toLocaleString()}
                </td>

                <td
                  className={`p-3 text-center ${coinPL >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                >
                  {coinPL >= 0 ? "+" : "-"}$
                  {Math.abs(coinPL).toLocaleString()}
                </td>


              </tr>
            )
          })}

        </tbody>
      </table>
    </div>
  );
}
