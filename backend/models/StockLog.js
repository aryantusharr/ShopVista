const mongoose = require("mongoose");

const stockLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantityAdjusted: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockLog", stockLogSchema);
