import { useEffect, useState } from "react";
import { fetchNews } from "../api/news";
import type { NewsArticle, NewsOptions } from "../api/news";

function formatRelativeTime(dateString: string) {
    try {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 60) return `${Math.max(0, diffInMins)}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    } catch (e) {
        return "recently";
    }
}

export function NewsSkeleton() {
    return (
        <div className="animate-pulse flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-full sm:w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
            <div className="flex-grow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    );
}

function NewsCard({ article }: { article: NewsArticle }) {
    return (
        <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300"
        >
            {article.image ? (
                <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                </div>
            ) : (
                <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10h10M7 14h10M7 18h5" />
                    </svg>
                </div>
            )}
            <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {article.source}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatRelativeTime(article.published_at)}</span>
                    {article.sentiment !== 0 && (
                        <>
                            <span className="text-gray-400">•</span>
                            <span className={`flex items-center gap-1 ${article.sentiment > 0.1 ? "text-green-500" : article.sentiment < -0.1 ? "text-red-500" : "text-gray-400"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${article.sentiment > 0.1 ? "bg-green-500" : article.sentiment < -0.1 ? "bg-red-500" : "bg-gray-400"}`}></div>
                                {article.sentiment > 0.1 ? "Bullish" : article.sentiment < -0.1 ? "Bearish" : "Neutral"}
                            </span>
                        </>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {article.title}
                </h3>
            </div>
        </a>
    );
}

interface NewsListProps extends NewsOptions {
    title?: string;
    icon?: React.ReactNode;
}

export default function NewsList({ symbols, limit, search, title = "Latest Crypto News", icon }: NewsListProps) {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchNews({ symbols, limit, search }).then((data) => {
            if (mounted) {
                setNews(data);
                setLoading(false);
            }
        }).catch(() => {
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, [symbols, limit, search]);

    return (
        <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                        {icon || (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10h10M7 14h10M7 18h5" />
                            </svg>
                        )}
                    </span>
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    Array(limit || 4).fill(0).map((_, i) => <NewsSkeleton key={i} />)
                ) : news.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600 shadow-sm">
                        <div className="text-6xl mb-4">📰</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No News Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            We couldn't find any recent news {symbols ? `for ${symbols}` : "at the moment"}.
                        </p>
                    </div>
                ) : (
                    news.map((article, i) => (
                        <NewsCard key={i} article={article} />
                    ))
                )}
            </div>
        </section>
    );
}
