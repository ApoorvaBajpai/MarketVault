const express = require("express");
const cors = require("cors");
require("dotenv").config();

const coinsRoutes = require("./routes/coins");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/coins", coinsRoutes);

app.get("/", (req, res) => {
  res.send("Crypto Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
