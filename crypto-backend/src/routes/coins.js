const express = require("express");
const axios = require("axios");

const router = express.Router();

let cachedData = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 1000;


/* Listing API */
router.get("/listings", async (req, res) => {
    try {
        const response = await axios.get(
            "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
            {
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
                    Accept: "application/json"
                },
                params: {
                    start: 1,
                    limit: 100,
                    sort: "market_cap",
                    cryptocurrency_type: "all",
                    tag: "all"
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch listings",
            message: err.message
        });
    }
});

/* Info API */
router.get("/info/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(
            "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info",
            {
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
                    Accept: "application/json"
                },
                params: { id }
            }
        );

        res.json(response.data);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch coin info",
            message: err.message
        });
    }
});

/* Merged API */
router.get("/listings-with-info", async (req, res) => {
    try {
        const filter = req.query.filter || "all";
        const sort = req.query.sort || "market_cap";
        const order = req.query.order || "desc";

        const now = Date.now();

        if (cachedData && now - cacheTime < CACHE_DURATION) {
            let data = [...cachedData];

            if (filter === "stable") {
                data = data.filter(c =>
                    ["USDT", "USDC", "DAI", "BUSD"].includes(c.symbol)
                );
            }

            if (filter === "layer1") {
                data = data.filter(c =>
                    ["BTC", "ETH", "SOL", "ADA", "AVAX", "DOT"].includes(c.symbol)
                );
            }

            if (filter === "alt") {
                data = data.filter(c =>
                    c.symbol !== "BTC" && c.symbol !== "ETH"
                );
            }

            if (sort && sort !== "rank") {
                data.sort((a, b) => {
                    if (order === "asc") return a[sort] - b[sort];
                    return b[sort] - a[sort];
                });
            }

            return res.json(data);
        }

        const listingsRes = await axios.get(
            "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
            {
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
                    Accept: "application/json"
                },
                params: {
                    start: 1,
                    limit: 50,
                    sort,
                    sort_dir: order
                }

            }
        );

        const ids = listingsRes.data.data.map(c => c.id).join(",");

        const infoRes = await axios.get(
            "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info",
            {
                headers: {
                    "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
                    Accept: "application/json"
                },
                params: { id: ids }
            }
        );

        const infoMap = infoRes.data.data;

        let merged = listingsRes.data.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.quote.USD.price,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            market_cap: coin.quote.USD.market_cap,
            volume_24h: coin.quote.USD.volume_24h,
            logo: infoMap[coin.id]?.logo || null,
            tags: coin.tags || []
        }));

        // ✅ SAVE BASE DATA (UNFILTERED)
        cachedData = [...merged];
        cacheTime = Date.now();

        // 🔽 APPLY FILTERS AFTER CACHE
        if (filter === "stable") {
            merged = merged.filter(c =>
                ["USDT", "USDC", "DAI", "BUSD"].includes(c.symbol)
            );
        }

        if (filter === "layer1") {
            merged = merged.filter(c =>
                ["BTC", "ETH", "SOL", "ADA", "AVAX", "DOT"].includes(c.symbol)
            );
        }

        if (filter === "alt") {
            merged = merged.filter(c =>
                c.symbol !== "BTC" && c.symbol !== "ETH"
            );
        }

        res.json(merged);

    } catch (err) {
        res.status(500).json({
            error: "Failed to merge coin data",
            message: err.message
        });
    }
});

/* Coin Details API */
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch coin info
    const infoRes = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
          Accept: "application/json",
        },
        params: { id },
      }
    );

    // 2️⃣ Fetch latest quotes
    const quoteRes = await axios.get(
      "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
          Accept: "application/json",
        },
        params: { id },
      }
    );

    const info = infoRes.data.data[id];
    const quote = quoteRes.data.data[id].quote.USD;

    // 3️⃣ Send clean response
    res.json({
      id,
      name: info.name,
      symbol: info.symbol,
      logo: info.logo,
      description: info.description,
      website: info.urls?.website?.[0] || "",
      price: quote.price,
      percent_change_1h: quote.percent_change_1h,
      percent_change_24h: quote.percent_change_24h,
      percent_change_7d: quote.percent_change_7d,
      market_cap: quote.market_cap,
      volume_24h: quote.volume_24h,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch coin details",
      message: err.message,
    });
  }
});


module.exports = router;
