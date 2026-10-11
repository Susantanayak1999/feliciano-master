// ============================================================
// MAILER — Uses Resend (works over HTTPS, no port blocks)
// ============================================================
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set — emails will not send");
} else {
    console.log("✅ Mailer ready (Resend)");
}

// ------------------------------------------------------------
// 1. RESERVATION CONFIRMATION
// ------------------------------------------------------------
async function sendReservationEmail({ to, name, date, time, persons, reservationId }) {
    if (!process.env.RESEND_API_KEY) return { sent: false };

    const html = `
    <div style="font-family:'Poppins',Arial,sans-serif;background:#f6f2ea;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.08);">
        <div style="height:5px;background:linear-gradient(90deg,#c8a97e,#e8d4b8,#c8a97e);"></div>
        <div style="padding:40px;text-align:center;">
          <h1 style="font-family:Georgia,serif;color:#c8a97e;margin:0;font-size:34px;">Table Confirmed!</h1>
          <p style="color:#888;font-size:14px;">Hi ${name}, your reservation is confirmed.</p>
        </div>
        <div style="padding:0 40px 30px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#999;">Name</td><td style="text-align:right;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Date</td><td style="text-align:right;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Time</td><td style="text-align:right;font-weight:600;">${time}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Guests</td><td style="text-align:right;font-weight:600;">${persons}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Booking ID</td><td style="text-align:right;font-weight:600;">#${String(reservationId).slice(-6).toUpperCase()}</td></tr>
          </table>
        </div>
        <div style="background:#1a1a1a;color:#999;padding:20px;font-size:12px;text-align:center;">
          Need help? Call +91 98765 43210
        </div>
      </div>
    </div>`;

    try {
        const info = await resend.emails.send({
            from: "Mixtape Kitchen <onboarding@resend.dev>",
            to: [to],
            subject: `Your Reservation is Confirmed — ${date} at ${time}`,
            html,
        });
        console.log("✅ Reservation email sent to", to, "→", info.id);
        return { sent: true, id: info.id };
    } catch (err) {
        console.error("❌ Reservation email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

// ------------------------------------------------------------
// 2. ORDER CONFIRMATION (after payment)
// ------------------------------------------------------------
async function sendOrderEmail({ to, name, items, amount, paymentId, orderId }) {
    if (!process.env.RESEND_API_KEY) return { sent: false };

    const itemRows = (items || []).map(item => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px dashed #eee;">
          <strong>${item.name}</strong><br>
          <span style="color:#999;font-size:12px;">Qty: ${item.quantity} × ₹${Number(item.price).toFixed(2)}</span>
        </td>
        <td style="text-align:right;font-weight:600;color:#c8a97e;">
          ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}
        </td>
      </tr>
    `).join("");

    const html = `
    <div style="font-family:'Poppins',Arial,sans-serif;background:#f6f2ea;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
        <div style="height:5px;background:linear-gradient(90deg,#c8a97e,#e8d4b8,#c8a97e);"></div>
        <div style="padding:40px;text-align:center;">
          <h1 style="font-family:Georgia,serif;color:#c8a97e;margin:0;font-size:34px;">Order Confirmed!</h1>
          <p style="color:#888;font-size:14px;">Hi ${name}, thanks for your order.</p>
        </div>
        <div style="padding:0 40px 30px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${itemRows}
            <tr><td style="padding-top:14px;font-weight:700;">Total</td><td style="padding-top:14px;text-align:right;font-weight:800;color:#c8a97e;">₹${Number(amount).toFixed(2)}</td></tr>
          </table>
          <p style="font-size:13px;color:#777;margin-top:20px;">
            Payment ID: ${paymentId}<br>Order ID: ${orderId}
          </p>
        </div>
      </div>
    </div>`;

    try {
        const info = await resend.emails.send({
            from: "Mixtape Kitchen <onboarding@resend.dev>",
            to: [to],
            subject: `Your Order is Confirmed — ₹${Number(amount).toFixed(2)}`,
            html,
        });
        console.log("✅ Order email sent to", to, "→", info.id);
        return { sent: true, id: info.id };
    } catch (err) {
        console.error("❌ Order email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

module.exports = { sendReservationEmail, sendOrderEmail };