import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

function generatePriceGraph(
    currentPrice: number,
    change1h: number,
    change24h: number,
    change7d: number
) {
    const price1hAgo = currentPrice / (1 + change1h / 100);
    const price24hAgo = currentPrice / (1 + change24h / 100);
    const price7dAgo = currentPrice / (1 + change7d / 100);

    return [
        { time: "7d ago", price: Number(price7dAgo.toFixed(2)) },
        { time: "24h ago", price: Number(price24hAgo.toFixed(2)) },
        { time: "1h ago", price: Number(price1hAgo.toFixed(2)) },
        { time: "Now", price: Number(currentPrice.toFixed(2)) },
    ];
}

type CoinDetailsData = {
    id: string;
    name: string;
    symbol: string;
    logo: string;
    description: string;
    website: string;
    price: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    market_cap: number;
    volume_24h: number;
};

export default function CoinDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [coin, setCoin] = useState<CoinDetailsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch(`http://localhost:5000/api/coins/${id}/details`)
            .then(res => res.json())
            .then(data => {
                setCoin(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch coin details", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Loading coin details...</p>
                </div>
            </div>
        );
    }

    if (!coin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <p className="text-red-500 text-xl font-semibold">Failed to load coin details.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Back to Market
                    </button>
                </div>
            </div>
        );
    }

    const graphData = generatePriceGraph(
        coin.price,
        coin.percent_change_1h,
        coin.percent_change_24h,
        coin.percent_change_7d
    );

    const isPositive24h = coin.percent_change_24h >= 0;

    const formatNumber = (num: number) => {
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const getChangeColor = (change: number) => {
        return change >= 0 ? "text-green-500" : "text-red-500";
    };

    const getChangeBg = (change: number) => {
        return change >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 dark:from-gray-900 dark:via-indigo-950/30 dark:to-gray-900 text-gray-900 dark:text-gray-100">
            {/* Back Button */}
            <div className="px-8 pt-6">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back to Market</span>
                </button>
            </div>

            <div className="px-8 py-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                <img src={coin.logo} alt={coin.name} className="w-20 h-20" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-bold text-white mb-2">
                                    {coin.name}
                                </h1>
                                <p className="text-2xl text-indigo-100 font-medium">{coin.symbol}</p>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-bold text-white">
                                ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-2xl font-semibold ${isPositive24h ? 'text-green-300' : 'text-red-300'}`}>
                                {isPositive24h ? '↗' : '↘'} {Math.abs(coin.percent_change_24h).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Market Cap Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</h3>
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatNumber(coin.market_cap)}
                        </p>
                    </div>

                    {/* Volume Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">24h Volume</h3>
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatNumber(coin.volume_24h)}
                        </p>
                    </div>

                    {/* 24h Change Card */}
                    <div className={`rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${getChangeBg(coin.percent_change_24h)} border-gray-100 dark:border-gray-700`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">24h Change</h3>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coin.percent_change_24h >= 0 ? 'bg-green-200 dark:bg-green-800/50' : 'bg-red-200 dark:bg-red-800/50'}`}>
                                <svg className={`w-6 h-6 ${getChangeColor(coin.percent_change_24h)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={coin.percent_change_24h >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                                </svg>
                            </div>
                        </div>
                        <p className={`text-3xl font-bold ${getChangeColor(coin.percent_change_24h)}`}>
                            {coin.percent_change_24h >= 0 ? '+' : ''}{coin.percent_change_24h.toFixed(2)}%
                        </p>
                    </div>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Short-term Performance</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">1 Hour</span>
                                <span className={`font-bold text-lg ${getChangeColor(coin.percent_change_1h)}`}>
                                    {coin.percent_change_1h >= 0 ? '+' : ''}{coin.percent_change_1h.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">7 Days</span>
                                <span className={`font-bold text-lg ${getChangeColor(coin.percent_change_7d)}`}>
                                    {coin.percent_change_7d >= 0 ? '+' : ''}{coin.percent_change_7d.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Website Link Card */}
                    {coin.website && (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 border border-indigo-400 dark:border-indigo-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <h3 className="text-lg font-semibold mb-3 text-white">Official Resources</h3>
                            <a
                                href={coin.website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 group"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                <span className="text-white font-medium group-hover:underline">Visit Official Website</span>
                                <svg className="w-5 h-5 text-white ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>

                {/* Price Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Price Trend
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Historical price movement
                            </p>
                        </div>
                    </div>

                    <div style={{ width: "100%", height: 400 }}>
                        <ResponsiveContainer>
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    stroke="#9ca3af"
                                    style={{ fontSize: '14px' }}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    style={{ fontSize: '14px' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        padding: '12px'
                                    }}
                                    formatter={(value: any) => [`$${value}`, 'Price']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fill="url(#colorPrice)"
                                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 8 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Graph is derived from percentage change data and represents a trend, not exact historical prices.
                    </p>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        About {coin.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                        {coin.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
