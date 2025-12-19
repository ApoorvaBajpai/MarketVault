import type { Coin } from "../types/coin";
import { useNavigate } from "react-router-dom";


type Props = {
  coin: Coin;
  rank: number;
};

export default function MarketRow({ coin, rank }: Props) {
  const navigate = useNavigate();
  const changeColor =
    coin.percent_change_24h > 0 ? "text-green-600" : "text-red-500";

  return (
    <tr onClick={() => navigate(`/coin/${coin.id}`)}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
      <td className="px-4 py-3 text-sm">#{rank}</td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 font-semibold">
            {coin.symbol[0]}
          </div>

          <div>
            <div className="font-semibold">{coin.symbol}</div>
            <div className="text-gray-500 text-sm">{coin.name}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 font-medium">
        ${coin.price.toLocaleString()}
      </td>

      <td className={`px-4 py-3 font-medium ${changeColor}`}>
        {coin.percent_change_24h > 0 ? "+" : ""}
        {coin.percent_change_24h.toFixed(2)}%
      </td>

      <td className="px-4 py-3">
        ${coin.market_cap.toLocaleString()}
      </td>

      <td className="px-4 py-3">
        ${coin.volume_24h.toLocaleString()}
      </td>

      {/* Sparkline Placeholder */}
      <td className="px-4 py-3">
        <div className="w-24 h-8 bg-gray-100 rounded-lg"></div>
      </td>

      <td className="px-4 py-3">
        <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100">
          Add
        </button>
      </td>
    </tr>
  );
}
