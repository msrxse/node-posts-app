const postModel = require("../models/postModel");

const post_index = (req, res) => {
  postModel
    .find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("posts/index", { blogs: result, title: "All blogs" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const post_details = (req, res) => {
  const id = req.params.id;
  postModel
    .findById(id)
    .then((result) => {
      res.render("posts/details", { blog: result, title: "Blog Details" });
    })
    .catch((err) => {
      res.status(404).render("404", { title: "Blog not found" });
      console.log(err);
    });
};

const post_create_get = (req, res) => {
  res.render("posts/create", { title: "Create a new blog" });
};

const post_create_post = (req, res) => {
  // express.urlencoded middleware allows req.body to have the form fields
  const blog = new postModel(req.body);

  blog
    .save()
    .then((result) => {
      res.redirect("/posts");
    })
    .catch((err) => {
      console.log(err);
    });
};

const post_delete = (req, res) => {
  const id = req.params.id;
  // we dont redirect here, instead
  // we send json-data back to browser with a redirect property
  postModel
    .findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/posts" });
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  post_index,
  post_details,
  post_create_get,
  post_create_post,
  post_delete,
};
