require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendReservationEmail, sendOrderEmail } = require("./mailer");

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
// In-Memory OTP Store (for phone login)
// ============================================================
if (!global._otpStore) global._otpStore = {};

// ============================================================
// User Schema
// ============================================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    googleId: { type: String, default: null },
    phone: { type: String, default: null },
    picture: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
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
// Reservation Schema
// ============================================================
const reservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    persons: { type: String, required: true },
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
});
const Reservation = mongoose.model("Reservation", reservationSchema);

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
// Brevo Email Helper (HTTP API)
// ============================================================
async function brevoSend({ to, subject, html }) {
    if (!process.env.BREVO_API_KEY) {
        console.warn("⚠️ BREVO_API_KEY not set — email skipped");
        return null;
    }
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            sender: { name: "Mixtape Kitchen", email: "susantanayak01592@gmail.com" },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data));
    return data;
}

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
// FORGOT PASSWORD — Send reset link via Brevo API
// ============================================================
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: "Email required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success (prevents email enumeration)
        if (!user) {
            console.log("📧 Forgot-password for unknown email:", email);
            return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        console.log("🔑 Reset token for", email, ":", token);

        const resetUrl = `https://mixtape-kitchen.netlify.app/reset-password.html?token=${token}`;

        try {
            await brevoSend({
                to: user.email,
                subject: "Reset Your Password — Mixtape Kitchen",
                html: `
                <div style="font-family:'Poppins',Arial,sans-serif;background:#f6f2ea;padding:40px 20px;">
                  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
                    <div style="height:5px;background:linear-gradient(90deg,#c8a97e,#e8d4b8,#c8a97e);"></div>
                    <div style="padding:40px;text-align:center;">
                      <h1 style="font-family:Georgia,serif;color:#c8a97e;margin:0;font-size:30px;">Reset Password</h1>
                      <p style="color:#666;font-size:14px;margin-top:12px;">Hi ${user.name}, we received a request to reset your password.</p>
                      <a href="${resetUrl}" style="display:inline-block;margin-top:26px;padding:14px 32px;background:#c8a97e;color:#fff;text-decoration:none;border-radius:30px;font-weight:600;">Reset My Password</a>
                      <p style="color:#999;font-size:12px;margin-top:26px;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
                    </div>
                  </div>
                </div>`,
            });
            console.log("✅ Reset email sent to", email);
        } catch (e) {
            console.error("❌ Reset email failed:", e.message);
        }

        res.json({ success: true, message: "If that email exists, a reset link has been sent." });

    } catch (err) {
        console.error("❌ Forgot password error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// RESET PASSWORD — Verify token and set new password
// ============================================================
app.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, error: "Invalid input" });
        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, error: "Reset link is invalid or has expired." });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        console.log("✅ Password reset for", user.email);
        res.json({ success: true, message: "Password updated. Please sign in." });

    } catch (err) {
        console.error("❌ Reset password error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// GOOGLE LOGIN
// ============================================================
app.post("/google-login", async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            const randomPass = crypto.randomBytes(20).toString("hex");
            const hashed = await bcrypt.hash(randomPass, 10);

            user = await User.create({
                name: name || email.split("@")[0],
                email: email.toLowerCase(),
                password: hashed,
                googleId: googleId,
                picture: picture,
            });
            console.log("✅ Google signup:", email);
        } else {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
            console.log("✅ Google login:", email);
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (err) {
        console.error("❌ Google login error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// PHONE: SEND OTP
// ============================================================
app.post("/phone-send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.length < 8) {
            return res.status(400).json({ success: false, error: "Invalid phone number" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        global._otpStore[phone] = {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        };

        console.log(`📱 OTP for ${phone}: ${otp}`);

        res.json({
            success: true,
            message: "OTP sent (demo mode)",
            demoOtp: otp,
        });

    } catch (err) {
        console.error("❌ OTP send error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// PHONE: VERIFY OTP
// ============================================================
app.post("/phone-verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, error: "Phone and OTP required" });
        }

        const record = global._otpStore[phone];

        if (!record) {
            return res.status(400).json({ success: false, error: "No OTP requested for this number" });
        }

        if (Date.now() > record.expiresAt) {
            delete global._otpStore[phone];
            return res.status(400).json({ success: false, error: "OTP expired. Please request a new one." });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ success: false, error: "Invalid OTP" });
        }

        delete global._otpStore[phone];

        let user = await User.findOne({ phone: phone });

        if (user && user.name && !user.name.startsWith("Guest ")) {
            console.log("✅ Phone login (returning user):", phone);

            const token = generateToken(user._id);

            return res.json({
                success: true,
                needsName: false,
                token,
                user: { id: user._id, name: user.name, email: user.email },
            });
        }

        console.log("📝 Phone needs name:", phone);

        res.json({
            success: true,
            needsName: true,
            phone: phone,
        });

    } catch (err) {
        console.error("❌ Phone verify error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// PHONE: SAVE NAME
// ============================================================
app.post("/phone-save-name", async (req, res) => {
    try {
        const { phone, name } = req.body;

        if (!phone || !name || name.trim().length < 2) {
            return res.status(400).json({ success: false, error: "Please enter a valid name" });
        }

        const cleanName = name.trim().slice(0, 60);

        let user = await User.findOne({ phone: phone });

        if (!user) {
            const randomPass = crypto.randomBytes(20).toString("hex");
            const hashed = await bcrypt.hash(randomPass, 10);

            user = await User.create({
                name: cleanName,
                email: `phone_${phone}@mixtape.local`,
                password: hashed,
                phone: phone,
            });
            console.log("✅ Phone signup with name:", phone, "→", cleanName);
        } else {
            user.name = cleanName;
            await user.save();
            console.log("✅ Phone name updated:", phone, "→", cleanName);
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (err) {
        console.error("❌ Save name error:", err);
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

            let savedUser = null;
            let savedOrder = null;

            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (token) {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    savedOrder = await Order.create({
                        userId: decoded.userId,
                        items,
                        amount,
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,
                    });
                    savedUser = await User.findById(decoded.userId);
                    console.log("✅ Order saved to DB");
                }
            } catch (e) {
                console.warn("⚠️ Could not save order:", e.message);
            }

            if (savedUser && savedUser.email) {
                sendOrderEmail({
                    to: savedUser.email,
                    name: savedUser.name,
                    items: items || [],
                    amount: amount || 0,
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                }).catch((err) => console.error("Order email error:", err.message));
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
// RESERVATION: CREATE
// ============================================================
app.post("/reserve", async (req, res) => {
    try {
        const { name, email, phone, date, time, persons } = req.body;

        if (!name || !email || !phone || !date || !time || !persons) {
            return res.status(400).json({ success: false, error: "All fields required" });
        }

        let userId = null;
        try {
            const token = req.headers.authorization?.replace("Bearer ", "");
            if (token) {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
            }
        } catch (e) { /* guest booking is fine */ }

        const reservation = await Reservation.create({
            userId,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            date,
            time,
            persons,
        });

        console.log("✅ Reservation created:", reservation._id, name, date, time);

        sendReservationEmail({
            to: reservation.email,
            name: reservation.name,
            date: reservation.date,
            time: reservation.time,
            persons: reservation.persons,
            reservationId: reservation._id,
        }).catch((err) => console.error("Reservation email error:", err.message));

        res.json({
            success: true,
            message: "Reservation confirmed!",
            reservation: {
                id: reservation._id,
                name: reservation.name,
                date: reservation.date,
                time: reservation.time,
                persons: reservation.persons,
            },
        });
    } catch (err) {
        console.error("❌ Reservation error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// RESERVATION: MY RESERVATIONS
// ============================================================
app.get("/my-reservations", authMiddleware, async (req, res) => {
    try {
        const reservations = await Reservation
            .find({ userId: req.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, reservations });
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