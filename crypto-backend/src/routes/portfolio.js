const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const Portfolio = require("../models/Portfolio");

// GET user portfolio
router.get("/", authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ uid: req.user.uid });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});

// BUY coin
router.post("/buy", authMiddleware, async (req, res) => {
  const { coinId, symbol, quantity, price } = req.body;

  if (!coinId || !symbol || !quantity || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    console.log("BUY API HIT");
    console.log("USER:", req.user);
    console.log("BODY:", req.body);

    const portfolio = await Portfolio.findOne({ uid: req.user.uid });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const existingCoin = portfolio.holdings.find(
      (c) => c.coinId === coinId
    );

    if (existingCoin) {
      const totalCost =
        existingCoin.avgBuyPrice * existingCoin.quantity +
        price * quantity;

      const totalQty = existingCoin.quantity + quantity;

      existingCoin.avgBuyPrice = totalCost / totalQty;
      existingCoin.quantity = totalQty;
    } else {
      portfolio.holdings.push({
        coinId,
        symbol,
        quantity,
        avgBuyPrice: price,
      });
    }

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to buy coin" });
  }
});

// SELL coin
router.post("/sell", authMiddleware, async (req, res) => {
  const { coinId, quantity } = req.body;

  if (!coinId || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const portfolio = await Portfolio.findOne({ uid: req.user.uid });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const existingCoin = portfolio.holdings.find(
      (c) => c.coinId === coinId
    );

    if (!existingCoin) {
      return res.status(400).json({ message: "Coin not found in portfolio" });
    }

    if (quantity > existingCoin.quantity) {
      return res.status(400).json({ message: "Insufficient quantity" });
    }

    existingCoin.quantity -= quantity;

    if (existingCoin.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter(
        (c) => c.coinId !== coinId
      );
    }

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: "Failed to sell coin" });
  }
});

// REMOVE coin completely
router.delete("/remove/:coinId", authMiddleware, async (req, res) => {
  const { coinId } = req.params;

  try {
    const portfolio = await Portfolio.findOne({ uid: req.user.uid });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    portfolio.holdings = portfolio.holdings.filter(
      (c) => c.coinId !== coinId
    );

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove coin" });
  }
});

// CLEAR portfolio
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ uid: req.user.uid });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    portfolio.holdings = [];
    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: "Failed to clear portfolio" });
  }
});

module.exports = router;
