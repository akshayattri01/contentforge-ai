const protect = async (req, res, next) => {
  req.user = { _id: "demo123" };
  next();
  return;
};

module.exports = { protect };