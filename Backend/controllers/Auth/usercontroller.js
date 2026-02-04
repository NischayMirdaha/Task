import User from "../../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Ensure .env is loaded first

/* =========================
   Validate environment variables
========================= */
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("ERROR: EMAIL_USER or EMAIL_PASS not set in .env");
  process.exit(1);
}

/* =========================
   Email Transporter
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be App Password
  },
});

// verify smtp on startup
transporter.verify((err, success) => {
  if (err) console.error("SMTP ERROR:", err);
  else console.log("SMTP READY ✅");
});

/* =========================
   Generate OTP
========================= */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

/* =========================
   Register User (Send OTP)
========================= */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // SEND OTP EMAIL
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: "Verify your account",
        html: `<h2>Your OTP: ${otp}</h2>`,
      });

      console.log("EMAIL SENT:", info.response);
    } catch (mailErr) {
      console.error("EMAIL FAILED:", mailErr);
      return res.status(500).json({
        message: "Failed to send OTP email",
        error: mailErr.message,
      });
    }

    // CREATE USER
    await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      isOtpVerified: false,
    });

    res.status(201).json({ message: "User registered. OTP sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   Verify OTP
========================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otp +isOtpVerified");
    if (!user || user.otp !== Number(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    user.isOtpVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* =========================
   Login User
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +isOtpVerified");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isOtpVerified)
      return res.status(401).json({ message: "Verify email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};