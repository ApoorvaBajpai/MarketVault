const request = require("supertest");
const express = require("express");
const portfolioRoutes = require("../routes/portfolio");
const Portfolio = require("../models/Portfolio");

// Mock the model
jest.mock("../models/Portfolio");

// Mock authMiddleware to skip actual Firebase token verification
jest.mock("../../middleware/authMiddleware", () => (req, res, next) => {
    req.user = { uid: "test-user-123" };
    next();
});

const app = express();
app.use(express.json());
app.use("/api/portfolio", portfolioRoutes);

describe("Portfolio Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Buy a new coin
    test("POST /api/portfolio/buy - should add a new coin to portfolio", async () => {
        const mockPortfolio = {
            uid: "test-user-123",
            holdings: [],
            save: jest.fn().mockResolvedValue(true),
        };
        Portfolio.findOne.mockResolvedValue(mockPortfolio);

        const res = await request(app)
            .post("/api/portfolio/buy")
            .send({ coinId: "bitcoin", symbol: "BTC", quantity: 1, price: 60000 });

        expect(res.statusCode).toBe(200);
        expect(mockPortfolio.holdings).toHaveLength(1);
        expect(mockPortfolio.holdings[0].symbol).toBe("BTC");
        expect(mockPortfolio.save).toHaveBeenCalled();
    });

    // 2. Buy more of an existing coin (Weighted Average)
    test("POST /api/portfolio/buy - should update quantity and avg price for existing coin", async () => {
        const mockPortfolio = {
            uid: "test-user-123",
            holdings: [
                { coinId: "bitcoin", symbol: "BTC", quantity: 1, avgBuyPrice: 40000 }
            ],
            save: jest.fn().mockResolvedValue(true),
        };
        Portfolio.findOne.mockResolvedValue(mockPortfolio);

        const res = await request(app)
            .post("/api/portfolio/buy")
            .send({ coinId: "bitcoin", symbol: "BTC", quantity: 1, price: 60000 });

        expect(res.statusCode).toBe(200);
        expect(mockPortfolio.holdings[0].quantity).toBe(2);
        // Weighted Average Calculation: (1 * 40000 + 1 * 60000) / 2 = 50000
        expect(mockPortfolio.holdings[0].avgBuyPrice).toBe(50000);
        expect(mockPortfolio.save).toHaveBeenCalled();
    });

    // 3. Sell a portion of a coin
    test("POST /api/portfolio/sell - should decrease quantity of an existing coin", async () => {
        const mockPortfolio = {
            uid: "test-user-123",
            holdings: [
                { coinId: "bitcoin", symbol: "BTC", quantity: 2, avgBuyPrice: 50000 }
            ],
            save: jest.fn().mockResolvedValue(true),
        };
        Portfolio.findOne.mockResolvedValue(mockPortfolio);

        const res = await request(app)
            .post("/api/portfolio/sell")
            .send({ coinId: "bitcoin", quantity: 0.5 });

        expect(res.statusCode).toBe(200);
        expect(mockPortfolio.holdings[0].quantity).toBe(1.5);
        expect(mockPortfolio.save).toHaveBeenCalled();
    });

    // 4. Sell all of a coin (removes from holdings)
    test("POST /api/portfolio/sell - should remove coin if quantity reaching zero", async () => {
        const mockPortfolio = {
            uid: "test-user-123",
            holdings: [
                { coinId: "bitcoin", symbol: "BTC", quantity: 1, avgBuyPrice: 50000 }
            ],
            save: jest.fn().mockResolvedValue(true),
        };
        Portfolio.findOne.mockResolvedValue(mockPortfolio);

        const res = await request(app)
            .post("/api/portfolio/sell")
            .send({ coinId: "bitcoin", quantity: 1 });

        expect(res.statusCode).toBe(200);
        expect(mockPortfolio.holdings).toHaveLength(0);
        expect(mockPortfolio.save).toHaveBeenCalled();
    });
});
