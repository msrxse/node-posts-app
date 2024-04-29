const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Post must have title"],
    },
    snippet: {
      type: String,
      require: [true, "Post must have snippet"],
    },
    body: {
      type: String,
      require: [true, "Post must have title"],
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
