const mongoose = require("mongoose");

const studentScoreSchema = new mongoose.Schema(
  {
    quizRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizRoom",
      required: true,
    },
    roomCode: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const StudentScore = mongoose.model("StudentScore", studentScoreSchema);
module.exports = StudentScore;
