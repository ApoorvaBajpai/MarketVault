const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * GET /api/news
 * Fetch latest crypto news from Marketaux
 * Parameters:
 * - symbols: comma separated symbols (BTC,ETH)
 * - limit: number of articles (default 10)
 * - search: search term (default "cryptocurrency")
 */
router.get("/", async (req, res) => {
    try {
        const { symbols, limit, search } = req.query;
        let marketauxSymbols = "";

        if (symbols) {
            marketauxSymbols = symbols.split(",").map(s => `CC:${s.trim().toUpperCase()}`).join(",");
        }

        const params = {
            api_token: process.env.MARKETAUX_API_KEY,
            limit: limit || 10,
            filter_entities: true,
            language: "en"
        };

        if (marketauxSymbols) {
            params.symbols = marketauxSymbols;
        } else {
            params.search = search || "cryptocurrency";
        }

        const response = await axios.get("https://api.marketaux.com/v1/news/all", { params });

        if (!response.data || !response.data.data) {
            return res.json([]);
        }

        const news = response.data.data.map(article => {
            let sentiment = 0;
            if (article.entities && article.entities.length > 0) {
                sentiment = article.entities[0].sentiment_score;
            }

            return {
                title: article.title,
                source: article.source,
                image: article.image_url,
                url: article.url,
                published_at: article.published_at,
                sentiment: sentiment
            };
        });

        res.json(news);
    } catch (err) {
        console.error("Marketaux API Error:", err.response?.data || err.message);
        res.status(500).json({
            error: "Failed to fetch news",
            message: err.message
        });
    }
});

module.exports = router;
