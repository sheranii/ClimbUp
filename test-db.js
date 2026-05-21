const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("Connected to MongoDB!"); process.exit(0); })
  .catch((err) => { console.error("Failed:", err.message); process.exit(1); });
