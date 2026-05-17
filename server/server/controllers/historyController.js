const mongoose = require("mongoose");
const Content = require("../models/Content");

const getHistory = async (req, res, next) => {
  try {
    const history = await Content.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid history item id");
    }

    const content = await Content.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!content) {
      res.status(404);
      throw new Error("History item not found");
    }

    await content.deleteOne();

    res.status(200).json({
      success: true,
      message: "History item deleted successfully",
      id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  deleteHistory,
};
