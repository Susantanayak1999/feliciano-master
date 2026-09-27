require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/", (req, res) => {
    res.json({ status: "Feliciano Razorpay backend running ✅" });
});

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
            notes: { itemCount: items.length, source: "Feliciano Cart" },
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

app.post("/verify-payment", (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
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
            return res.json({ success: true, payment_id: razorpay_payment_id });
        }
        return res.status(400).json({ success: false, error: "Invalid signature" });
    } catch (err) {
        console.error("❌ Verify error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
});