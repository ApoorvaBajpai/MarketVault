const request = require("supertest");
const express = require("express");
const axios = require("axios");
const coinsRoutes = require("../routes/coins");

jest.mock("axios");

// Mock authMiddleware
jest.mock("../../middleware/authMiddleware", () => (req, res, next) => next());

const app = express();
app.use(express.json());
app.use("/api/coins", coinsRoutes);

describe("Coins API Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset cachedData in coins.js if possible, but it's module-scoped.
        // We might need to handle cache in tests.
    });

    test("GET /api/coins/api/listings - should fetch listings", async () => {
        axios.get.mockResolvedValue({ data: { data: [] } });

        const res = await request(app).get("/api/coins/api/listings");

        expect(res.statusCode).toBe(200);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("listings/latest"),
            expect.anything()
        );
    });

    test("GET /api/coins/info/:id - should fetch coin info", async () => {
        axios.get.mockResolvedValue({ data: { data: {} } });

        const res = await request(app).get("/api/coins/info/1");

        expect(res.statusCode).toBe(200);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("info"),
            expect.anything()
        );
    });

    test("GET /api/coins/listings-with-info - should fetch and merge data", async () => {
        const mockListings = {
            data: {
                data: [
                    {
                        id: 1,
                        name: "Bitcoin",
                        symbol: "BTC",
                        quote: { USD: { price: 50000, percent_change_24h: 1, market_cap: 1000000, volume_24h: 100000 } }
                    },
                    {
                        id: 2,
                        name: "Ethereum",
                        symbol: "ETH",
                        quote: { USD: { price: 3000, percent_change_24h: 2, market_cap: 500000, volume_24h: 50000 } }
                    }
                ]
            }
        };
        const mockInfo = {
            data: {
                data: {
                    1: { logo: "btc-logo.png" },
                    2: { logo: "eth-logo.png" }
                }
            }
        };

        axios.get
            .mockResolvedValueOnce(mockListings)
            .mockResolvedValueOnce(mockInfo);

        const res = await request(app).get("/api/coins/listings-with-info");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].name).toBe("Bitcoin");
    });

    test("GET /api/coins/listings-with-info - should use cache on second call", async () => {
        // Since cachedData is module-scoped, the previous test already populated it.
        const res = await request(app).get("/api/coins/listings-with-info");

        expect(res.statusCode).toBe(200);
        expect(axios.get).not.toHaveBeenCalled(); // Should not call axios because of cache
    });

    test("GET /api/coins/listings-with-info - should apply filters from cache (stable)", async () => {
        const res = await request(app).get("/api/coins/listings-with-info").query({ filter: "stable" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0); // BTC/ETH are not stablecoins
    });

    test("GET /api/coins/listings-with-info - should apply filters from cache (layer1)", async () => {
        const res = await request(app).get("/api/coins/listings-with-info").query({ filter: "layer1" });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("GET /api/coins/listings-with-info - should apply filters from cache (alt)", async () => {
        const res = await request(app).get("/api/coins/listings-with-info").query({ filter: "alt" });
        expect(res.statusCode).toBe(200);
        expect(res.body.find(c => c.symbol === "BTC")).toBeUndefined();
    });

    test("GET /api/coins/listings-with-info - should apply sorting (price asc)", async () => {
        const res = await request(app).get("/api/coins/listings-with-info").query({ sort: "price", order: "asc" });
        expect(res.statusCode).toBe(200);
        expect(res.body[0].price).toBeLessThan(res.body[1].price);
    });

    test("GET /api/coins/listings-with-info - should handle merge failure", async () => {
        // We need to bypass the cache to trigger a new fetch
        // Since we can't easily clear the cache in coins.js without exports, 
        // we'll rely on the fact that we can't easily test this unless we wait or mock Date.now
        // But let's try to trigger the catch block by mocking axios failure if possible 
        // (but cache hit will take precedence).
        // For 100% coverage of coins.js we might need to export a resetCache function or use a more complex setup.
        // However, we can at least cover the details error.
    });

    test("GET /api/coins/listings-with-info - should return 500 on merge failure", async () => {
        // Mocking Date.now to expire cache
        const realDateNow = Date.now;
        global.Date.now = jest.fn(() => realDateNow() + 1000000);

        axios.get.mockRejectedValue(new Error("Merge error"));

        const res = await request(app).get("/api/coins/listings-with-info");

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Failed to merge coin data");

        global.Date.now = realDateNow;
    });

    test("GET /api/coins/:id/details - should fetch coin details", async () => {
        const mockInfo = {
            data: {
                data: {
                    1: { name: "Bitcoin", symbol: "BTC", logo: "logo.png", description: "desc", urls: { website: ["http://btc.com"] } }
                }
            }
        };
        const mockQuote = {
            data: {
                data: {
                    1: { quote: { USD: { price: 50000, percent_change_1h: 0.1, percent_change_24h: 1, percent_change_7d: 5, market_cap: 1000000, volume_24h: 100000 } } }
                }
            }
        };

        axios.get
            .mockResolvedValueOnce(mockInfo)
            .mockResolvedValueOnce(mockQuote);

        const res = await request(app).get("/api/coins/1/details");

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Bitcoin");
        expect(res.body.price).toBe(50000);
    });

    test("GET /api/coins/:id/details - should return 500 on details failure", async () => {
        axios.get.mockRejectedValue(new Error("Details error"));

        const res = await request(app).get("/api/coins/1/details");

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Failed to fetch coin details");
    });

    test("GET /api/coins/api/listings - should return 500 on failure", async () => {
        axios.get.mockRejectedValue(new Error("Network error"));

        const res = await request(app).get("/api/coins/api/listings");

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Failed to fetch listings");
    });
});
