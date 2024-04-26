/**
 * checks that in the sessions object there is an user aattached to it
 * otherwise returns an error with an unauthorized message
 */
const protect = (req, res, next) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ status: "fail", message: "unauthorized" });
  }
  req.user = user;

  next();
};

module.exports = protect;
