require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// MongoDB Connection
// ============================================================
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("✅ MongoDB connected"))
        .catch(err => console.error("❌ MongoDB error:", err.message));
} else {
    console.warn("⚠️ MONGO_URI not set — user auth will not work");
}

// ============================================================
// User Schema
// ============================================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// ============================================================
// Order Schema
// ============================================================
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: Array,
    amount: Number,
    paymentId: String,
    orderId: String,
    createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);

// ============================================================
// JWT Helpers
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || "mixtape-kitchen-secret";

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, error: "No token" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid token" });
    }
}

// ============================================================
// Razorpay
// ============================================================
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================
// Health Check
// ============================================================
app.get("/", (req, res) => {
    res.json({ status: "Mixtape Kitchen backend running 🎵" });
});

// ============================================================
// SIGNUP
// ============================================================
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: "All fields required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: "Password must be 6+ characters" });
        }
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, error: "Email already registered" });
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashed,
        });
        const token = generateToken(user._id);
        console.log("✅ Signup:", email);
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// LOGIN
// ============================================================
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password required" });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ success: false, error: "Invalid email or password" });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, error: "Invalid email or password" });
        const token = generateToken(user._id);
        console.log("✅ Login:", email);
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// ME
// ============================================================
app.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ success: false, error: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// CREATE ORDER
// ============================================================
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", items = [] } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: "Invalid amount" });
        }
        const amountInPaise = Math.round(Number(amount) * 100);
        if (amountInPaise < 100) {
            return res.status(400).json({ success: false, error: "Amount must be at least ₹1" });
        }
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency,
            receipt: "rcpt_" + Date.now(),
            notes: { itemCount: items.length, source: "Mixtape Kitchen" },
        });
        console.log("✅ Order created:", order.id, "₹" + (order.amount / 100));
        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("❌ Create order error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// VERIFY PAYMENT
// ============================================================
app.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, amount } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
        if (expectedSignature === razorpay_signature) {
            console.log("✅ Payment verified:", razorpay_payment_id);
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (token) {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    await Order.create({
                        userId: decoded.userId,
                        items,
                        amount,
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,
                    });
                    console.log("✅ Order saved to DB");
                }
            } catch (e) {
                console.warn("⚠️ Could not save order:", e.message);
            }
            return res.json({ success: true, payment_id: razorpay_payment_id });
        }
        return res.status(400).json({ success: false, error: "Invalid signature" });
    } catch (err) {
        console.error("❌ Verify error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// MY ORDERS
// ============================================================
app.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// Start Server
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Mixtape Kitchen backend running at http://localhost:${PORT}`);
});