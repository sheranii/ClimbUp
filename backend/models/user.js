const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Your game stats (KEEP THESE 🔥)
    climbCoins: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    topicsChosen: { type: [String], default: [] }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports= User;