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

// ============================================================
// 🚀 1. CAPTURE RAW BODY (MUST BE BEFORE ROUTES)
// ============================================================
app.use(express.json({
    verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/razorpay-webhook')) {
            req.rawBody = buf;
        }
    }
}));

// ============================================================
// 🚀 2. RAZORPAY WEBHOOK ROUTE
// ============================================================
app.post("/razorpay-webhook", async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error("❌ RAZORPAY_WEBHOOK_SECRET is not set in .env");
            return res.status(200).json({ status: "ok" }); 
        }

        const signature = req.headers["x-razorpay-signature"];
        const body = req.rawBody; 

        if (!body) {
            console.error("❌ Webhook Body is null.");
            return res.status(200).json({ status: "ok" });
        }

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("❌ Invalid Webhook Signature");
            return res.status(200).json({ status: "ok" });
        }

        // 2. Parse Payload
        const payload = JSON.parse(body.toString());
        const event = payload.event;

        console.log(`🔔 Webhook Received: ${event}`);

        // 3. Handle ANY payment related event
        if (event === "payment.captured" || event === "payment.authorized" || event === "order.paid") {
            let paymentEntity = null;
            
            if (payload.payload.payment) {
                paymentEntity = payload.payload.payment.entity;
            } else if (payload.payload.order) {
                paymentEntity = payload.payload.order.entity;
            }

            if (paymentEntity) {
                const orderId = paymentEntity.order_id || paymentEntity.id;
                const paymentId = paymentEntity.id || "N/A";
                const amount = (paymentEntity.amount / 100).toFixed(2);

                console.log(`✅ Webhook: Processing Payment for Order: ${orderId}, Amount: ₹${amount}`);

                // Email Alert to Admin
                try {
                    await brevoSend({
                        to: "adminsusanta@gmail.com",
                        subject: `💰 New Payment Received: ₹${amount}`,
                        html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f6f9;">
                            <div style="background: #fff; padding: 20px; border-radius: 10px; border-left: 5px solid #2e7d32;">
                                <h2 style="color: #2e7d32; margin-top: 0;">Payment Successful!</h2>
                                <p><strong>Event:</strong> ${event}</p>
                                <p><strong>Order ID:</strong> ${orderId}</p>
                                <p><strong>Payment ID:</strong> ${paymentId}</p>
                                <p><strong>Amount:</strong> ₹${amount}</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 12px; color: #888;">This is an automated notification from your Razorpay Webhook.</p>
                            </div>
                        </div>`
                    });
                    console.log("✅ Admin email sent.");
                } catch (emailErr) {
                    console.error("❌ Email failed:", emailErr.message);
                }

                // Check DB
                const existingOrder = await Order.findOne({ orderId: orderId });
                if (existingOrder) {
                    console.log(`✅ Webhook confirmed: Order ${orderId} is in DB.`);
                    if (existingOrder.status !== "Confirmed") {
                        existingOrder.status = "Confirmed";
                        await existingOrder.save();
                    }
                } else {
                    console.warn(`⚠️ Webhook: Order ${orderId} not found in DB yet.`);
                }
            }
        } else {
            console.log(`ℹ️ Ignoring event: ${event}`);
        }

        // 4. ALWAYS return 200 OK
        res.status(200).json({ status: "ok" });

    } catch (err) {
        console.error("❌ Webhook processing error:", err);
        res.status(200).json({ status: "ok" });
    }
});

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
    role: { type: String, default: "user" },
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
    deliveryAddress: Object,
    status: { type: String, default: "Confirmed" },
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
// MenuItem Schema
// ============================================================
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, required: true },
    type: { type: String, enum: ["veg", "non-veg"], default: "veg" },
    ingredients: { type: [String], default: [] },
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

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

async function adminMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, error: "No token" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, error: "Access denied. Admin only." });
        }
        req.userId = user._id;
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
// Brevo Email Helper
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
// Health Check & Admin Setup
// ============================================================
app.get("/", (req, res) => {
    res.json({ status: "Mixtape Kitchen backend running 🎵" });
});

app.get("/admin/setup-susanta", async (req, res) => {
    try {
        let user = await User.findOne({ email: "adminsusanta@gmail.com" });
        if (!user) {
            const hashed = await bcrypt.hash("admin123", 10);
            user = await User.create({
                name: "Admin Susanta",
                email: "adminsusanta@gmail.com",
                password: hashed,
                role: "admin"
            });
            return res.send("✅ Success! Admin account created. Email: adminsusanta@gmail.com | Password: admin123");
        } else {
            user.role = "admin";
            await user.save();
            return res.send("✅ Success! Existing user adminsusanta@gmail.com is now an Admin.");
        }
    } catch (err) {
        res.send("❌ Error: " + err.message);
    }
});

// ============================================================
// AUTH ROUTES
// ============================================================
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, error: "All fields required" });
        if (password.length < 6) return res.status(400).json({ success: false, error: "Password must be 6+ characters" });
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ success: false, error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email: email.toLowerCase(), password: hashed });
        const token = generateToken(user._id);

        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: "Email and password required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ success: false, error: "Invalid email or password" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, error: "Invalid email or password" });

        const token = generateToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/google-login", async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;
        if (!email || !googleId) return res.status(400).json({ success: false, error: "Missing fields" });

        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            const randomPass = crypto.randomBytes(20).toString("hex");
            const hashed = await bcrypt.hash(randomPass, 10);
            user = await User.create({ name: name || email.split("@")[0], email: email.toLowerCase(), password: hashed, googleId, picture });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = generateToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/phone-send-otp", async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || phone.length < 8) return res.status(400).json({ success: false, error: "Invalid phone number" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        global._otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
        console.log(`📱 OTP for ${phone}: ${otp}`);
        res.json({ success: true, message: "OTP sent", demoOtp: otp });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/phone-verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ success: false, error: "Phone and OTP required" });

        const record = global._otpStore[phone];
        if (!record) return res.status(400).json({ success: false, error: "No OTP requested" });
        if (Date.now() > record.expiresAt) { delete global._otpStore[phone]; return res.status(400).json({ success: false, error: "OTP expired" }); }
        if (record.otp !== otp) return res.status(400).json({ success: false, error: "Invalid OTP" });

        delete global._otpStore[phone];
        let user = await User.findOne({ phone: phone });

        if (user && user.name && !user.name.startsWith("Guest ")) {
            const token = generateToken(user._id);
            return res.json({ success: true, needsName: false, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
        }
        res.json({ success: true, needsName: true, phone: phone });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/phone-save-name", async (req, res) => {
    try {
        const { phone, name } = req.body;
        if (!phone || !name || name.trim().length < 2) return res.status(400).json({ success: false, error: "Valid name required" });

        const cleanName = name.trim().slice(0, 60);
        let user = await User.findOne({ phone: phone });

        if (!user) {
            const randomPass = crypto.randomBytes(20).toString("hex");
            const hashed = await bcrypt.hash(randomPass, 10);
            user = await User.create({ name: cleanName, email: `phone_${phone}@mixtape.local`, password: hashed, phone });
        } else {
            user.name = cleanName;
            await user.save();
        }

        const token = generateToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: "Email required" });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.json({ success: true, message: "If that email exists, a reset link has been sent." });

        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
        await user.save();

        const resetUrl = `https://mixtape-kitchen.netlify.app/reset-password.html?token=${token}`;
        try {
            await brevoSend({
                to: user.email,
                subject: "Reset Your Password — Mixtape Kitchen",
                html: `<div style="font-family:'Poppins',Arial,sans-serif;background:#f6f2ea;padding:40px 20px;"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="height:5px;background:linear-gradient(90deg,#c8a97e,#e8d4b8,#c8a97e);"></div><div style="padding:40px;text-align:center;"><h1 style="font-family:Georgia,serif;color:#c8a97e;margin:0;font-size:30px;">Reset Password</h1><p style="color:#666;font-size:14px;margin-top:12px;">Hi ${user.name}, we received a request to reset your password.</p><a href="${resetUrl}" style="display:inline-block;margin-top:26px;padding:14px 32px;background:#c8a97e;color:#fff;text-decoration:none;border-radius:30px;font-weight:600;">Reset My Password</a><p style="color:#999;font-size:12px;margin-top:26px;">This link expires in 30 minutes.</p></div></div></div>`,
            });
        } catch (e) { console.error("❌ Reset email failed:", e.message); }
        res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 6) return res.status(400).json({ success: false, error: "Invalid input" });
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, error: "Reset link is invalid or has expired." });
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        res.json({ success: true, message: "Password updated. Please sign in." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

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
// MENU ROUTES
// ============================================================
app.get("/menu", async (req, res) => {
    try {
        const items = await MenuItem.find({ available: true }).sort({ category: 1, name: 1 });
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🚀 ADMIN: UPDATE MENU ITEM (Protected)
app.put("/admin/menu/:id", adminMiddleware, async (req, res) => {
    try {
        const { name, price, description, image, category, type } = req.body;
        
        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id, 
            { name, price, description, image, category, type },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ success: false, error: "Item not found" });
        
        console.log("✅ Menu item updated:", updatedItem.name);
        res.json({ success: true, item: updatedItem });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🚀 ADMIN: ADD NEW MENU ITEM (Protected)
app.post("/admin/menu/add", adminMiddleware, async (req, res) => {
    try {
        const { name, description, price, image, category, type, ingredients } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ success: false, error: "Name, price, category required" });
        }
        const item = await MenuItem.create({
            name: name.trim(),
            description: (description || "").trim(),
            price: Number(price),
            image: image || "",
            category: category.trim(),
            type: type === "non-veg" ? "non-veg" : "veg",
            ingredients: Array.isArray(ingredients) ? ingredients : [],
        });
        console.log("✅ Menu item added:", item.name);
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🚀 ADMIN: DELETE MENU ITEM (Protected)
app.delete("/admin/menu/:id", adminMiddleware, async (req, res) => {
    try {
        const deleted = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: "Item not found" });
        }
        console.log("🗑️ Menu item deleted:", deleted.name);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// ORDER ROUTES
// ============================================================
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", items = [] } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ success: false, error: "Invalid amount" });
        const amountInPaise = Math.round(Number(amount) * 100);
        if (amountInPaise < 100) return res.status(400).json({ success: false, error: "Amount must be at least ₹1" });

        const order = await razorpay.orders.create({
            amount: amountInPaise, currency, receipt: "rcpt_" + Date.now(),
            notes: { itemCount: items.length, source: "Mixtape Kitchen" },
        });

        res.json({ success: true, order_id: order.id, amount: order.amount, currency: order.currency, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, amount, deliveryAddress } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, error: "Missing fields" });

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

        if (expectedSignature === razorpay_signature) {
            let savedUser = null;
            let savedOrder = null;
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (token) {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    savedOrder = await Order.create({
                        userId: decoded.userId, items, amount,
                        paymentId: razorpay_payment_id, orderId: razorpay_order_id, deliveryAddress: deliveryAddress,
                    });
                    savedUser = await User.findById(decoded.userId);
                }
            } catch (e) { console.warn("⚠️ Could not save order:", e.message); }

            if (savedUser && savedUser.email) {
                sendOrderEmail({
                    to: savedUser.email, name: savedUser.name, items: items || [],
                    amount: amount || 0, paymentId: razorpay_payment_id, orderId: razorpay_order_id,
                }).catch((err) => console.error("Order email error:", err.message));
            }
            return res.json({ success: true, payment_id: razorpay_payment_id });
        }
        return res.status(400).json({ success: false, error: "Invalid signature" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// RESERVATION ROUTES
// ============================================================
app.post("/reserve", async (req, res) => {
    try {
        const { name, email, phone, date, time, persons } = req.body;
        if (!name || !email || !phone || !date || !time || !persons) return res.status(400).json({ success: false, error: "All fields required" });

        let userId = null;
        try {
            const token = req.headers.authorization?.replace("Bearer ", "");
            if (token) { const decoded = jwt.verify(token, JWT_SECRET); userId = decoded.userId; }
        } catch (e) { }

        const reservation = await Reservation.create({ userId, name: name.trim(), email: email.trim(), phone: phone.trim(), date, time, persons });

        sendReservationEmail({
            to: reservation.email, name: reservation.name, date: reservation.date,
            time: reservation.time, persons: reservation.persons, reservationId: reservation._id,
        }).catch((err) => console.error("Reservation email error:", err.message));

        res.json({ success: true, message: "Reservation confirmed!", reservation: { id: reservation._id, name: reservation.name, date: reservation.date, time: reservation.time, persons: reservation.persons } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/my-reservations", authMiddleware, async (req, res) => {
    try {
        const reservations = await Reservation.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, reservations });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================
// ADMIN ROUTES
// ============================================================
app.get("/admin/orders", adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put("/admin/orders/:id/status", adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/admin/reservations", adminMiddleware, async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
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