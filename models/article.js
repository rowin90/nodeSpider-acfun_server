const mongoose = require("mongoose");
const { Schema } = mongoose;

const articleSchema = new Schema({
  acfunId: String,
  content: Array,
  originalContent: String,
  createdAt: { type: Number, default: Date.now().valueOf() },
  originCreatedAt: String,
  title: String,
  tags: [
    {
      name: String,
      value: String,
      score: Number
    }
  ],
  coverImage: String,
  description: String,
  commentCount: String
});

const articleModel = mongoose.model("article", articleSchema);
module.exports = {
  model: articleModel
};
