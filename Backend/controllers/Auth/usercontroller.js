import jwt from "jsonwebtoken";
import User from "../../models/usermodel.js";

const buildToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    let resolvedRole = "user";
    if (role && role !== "user") {
      if (
        process.env.ADMIN_REGISTRATION_SECRET &&
        adminSecret === process.env.ADMIN_REGISTRATION_SECRET
      ) {
        resolvedRole = role;
      } else {
        return res.status(403).json({
          success: false,
          message: "Only standard users can self-register without admin approval.",
        });
      }
    }

    const user = await User.create({
      username,
      email,
      password,
      role: resolvedRole,
    });

    const token = buildToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +isOtpVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = buildToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) =>
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });

export const verifyOtp = async (_req, res) =>
  res.status(200).json({
    success: true,
    message: "OTP verification is currently optional for JWT auth.",
  });
