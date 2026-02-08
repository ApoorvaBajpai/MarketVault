require("dotenv").config();
const portfolioRoutes = require("./routes/portfolio");
const connectDB = require("../config/db");

const express = require("express");
const cors = require("cors");

const coinsRoutes = require("./routes/coins");
const newsRoutes = require("./routes/news");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/coins", coinsRoutes);
app.use("/api/news", newsRoutes);

app.get("/", (req, res) => {
  res.send("Crypto Backend Running");
});

const PORT = process.env.PORT || 5000;
connectDB();

app.use("/api/portfolio", portfolioRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
