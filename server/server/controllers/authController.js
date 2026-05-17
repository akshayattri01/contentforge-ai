const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters long");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409);
      throw new Error("User already exists with this email");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
};
