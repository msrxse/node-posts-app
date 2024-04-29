const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
let RedisStore = require("connect-redis")(session);
const postModel = require("./models/postModel");

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

// express app
const app = express();
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
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
// allows form body to be attached to req object
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Just trust what nginx does give you in their headers!
// See http://expressjs.com/en/guide/behind-proxies.html
app.enable("trust proxy");

app.use(cors({}));

// cookie settings in express-session npm page
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      resave: false,
      saveUninitialized: false,
      secure: false,
      httpOnly: true,
      maxAge: 3600000, // 1h. shorten for testing if needed
    },
  })
);

// body body to be included in requests
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h2>Health check</h2>");
  console.log("yeah it ran");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

// listen for requests
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

// this routes are for the node website
// ideally this would be a React app using the above API endpoints instead
app.get("/", (req, res) => {
  res.redirect("/posts");
});

app.get("/posts", (req, res) => {
  postModel
    .find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "Home", blogs: result });
    })
    .catch((err) => console.log(err));
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/posts/create", (req, res) => {
  res.render("create", { title: "Create a new blog" });
});

app.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  postModel
    .findById(id)
    .then((result) => {
      res.render("details", { title: "Blog Details", blog: result });
    })
    .catch((err) => console.log(err));
});

app.post("/posts", (req, res) => {
  // express.urlencoded middleware allows req.body to have the form fields
  const post = new postModel(req.body);

  post
    .save()
    .then((result) => {
      res.redirect("posts");
    })
    .catch((err) => console.log(err));
});

app.delete("/posts/:id", (req, res) => {
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

// 404 page
app.use((req, res) => {
  res.render("404", { title: "404" });
});
