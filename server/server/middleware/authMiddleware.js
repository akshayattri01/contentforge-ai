const protect = async (req, res, next) => {
  req.user = { _id: "demo123" };
  next();
};

module.exports = { protect };