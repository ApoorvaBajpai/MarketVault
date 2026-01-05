const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema(
  {
    coinId: { type: String, required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    holdings: [HoldingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);
