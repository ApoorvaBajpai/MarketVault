const Portfolio = require("../models/Portfolio");
const admin = require("../config/firebaseAdmin");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

const existingPortfolio = await Portfolio.findOne({ uid: decodedToken.uid });

if (!existingPortfolio) {
  await Portfolio.create({
    uid: decodedToken.uid,
    holdings: [],
  });
}

next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
