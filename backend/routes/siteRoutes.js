const express = require("express");
const postModel = require("../models/postModel");
const router = express.Router();

router.get("/", (req, res) => {
  postModel
    .find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "Home", blogs: result });
    })
    .catch((err) => console.log(err));
});

router.get("/create", (req, res) => {
  res.render("create", { title: "Create a new blog" });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  postModel
    .findById(id)
    .then((result) => {
      res.render("details", { title: "Blog Details", blog: result });
    })
    .catch((err) => console.log(err));
});

router.post("/", (req, res) => {
  // express.urlencoded middleware allows req.body to have the form fields
  const post = new postModel(req.body);

  post
    .save()
    .then((result) => {
      res.redirect("posts");
    })
    .catch((err) => console.log(err));
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  // we dont redirect here, instead
  // we send json-data back to browser with a redirect property
  postModel
    .findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/posts" });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
