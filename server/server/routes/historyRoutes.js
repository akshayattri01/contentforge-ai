const express = require("express");
const {
  getHistory,
  deleteHistory,
} = require("../controllers/historyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getHistory);
router.delete("/:id", protect, deleteHistory);

module.exports = router;
