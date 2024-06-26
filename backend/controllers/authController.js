const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashpassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      password: hashpassword,
    });
    // we save user to the session so we can access it anytime
    req.session.user = newUser;
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    const isCorrect = await bcrypt.compare(password, user.password);

    if (isCorrect) {
      // here we adding the user to the session data
      req.session.user = user;
      res.status(201).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "incorrect username or password",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "fail",
    });
  }
};
