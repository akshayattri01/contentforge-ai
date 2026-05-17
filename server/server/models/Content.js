const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      minlength: [3, "Topic must be at least 3 characters long"],
      maxlength: [300, "Topic cannot exceed 300 characters"],
    },
    type: {
      type: String,
      required: [true, "Content type is required"],
      trim: true,
      lowercase: true,
    },
    tone: {
      type: String,
      required: [true, "Tone is required"],
      trim: true,
      lowercase: true,
    },
    generatedContent: {
      type: String,
      required: [true, "Generated content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

contentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Content", contentSchema);
