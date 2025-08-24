const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  date: { type: String, default: Date.now },
});

module.exports = mongoose.model("Url", urlSchema);
