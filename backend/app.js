const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONO_PORT,
} = require("./config/config");

const postRouter = require("./routes/postRoutes");

// express app
const app = express();
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONO_PORT}/?authSource=admin`;
// connect DB
// ip-address = name-of-container (you can refer to the IP with the name of the container)

// Mongoose tries every 30 seconds but anyway we retry if failed (not best practice!)
// Dont rely on Docker to ensure DB is up!
const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("successfully connected to DB"))
    .catch((err) => {
      console.log(err);
      // will wait 5 secs before trying again
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// register view engine
app.set("view engine", "ejs");

// middleware and static files
app.use(express.static("public"));
app.use(morgan("dev"));
// body body to be included in requests
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h2>Health check</h2>");
});
app.use("/api/v1/posts", postRouter);

const port = process.env.PORT || 3000;
// listen for requests
app.listen(port, () => console.log(`listening on port ${port}`));

// app.get("/", (req, res) => {
//   const blogs = [
//     {
//       title: "Yoshi finds eggs!!!",
//       snippet: "Lorem ipsum dolor sit amet consectetur",
//     },
//     {
//       title: "Mario finds stars",
//       snippet: "Lorem ipsum dolor sit amet consectetur",
//     },
//     {
//       title: "How to defeat bowser",
//       snippet: "Lorem ipsum dolor sit amet consectetur",
//     },
//   ];
//   res.render("index", { title: "Home", blogs });
// });

// app.get("/about", (req, res) => {
//   res.render("about", { title: "About" });
// });

// app.get("/blogs/create", (req, res) => {
//   res.render("create", { title: "Create a new blog" });
// });

// // 404 page
// app.use((req, res) => {
//   res.render("404", { title: "404" });
// });
