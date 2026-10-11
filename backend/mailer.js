// ============================================================
// MAILER — Sends confirmation emails (Reservation + Order)
// ============================================================
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((err) => {
    if (err) console.warn("⚠️ Mailer not configured:", err.message);
    else console.log("✅ Mailer ready");
});

// ------------------------------------------------------------
// 1. RESERVATION CONFIRMATION EMAIL
// ------------------------------------------------------------
async function sendReservationEmail({ to, name, date, time, persons, reservationId }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ Email not configured — skipping reservation email");
        return { sent: false };
    }

    const html = `
    <div style="font-family:'Poppins',Arial,sans-serif;background:#f6f2ea;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.08);">
        <div style="height:5px;background:linear-gradient(90deg,#c8a97e,#e8d4b8,#c8a97e);"></div>

        <div style="padding:40px 40px 10px;text-align:center;">
          <div style="display:inline-block;width:70px;height:70px;border-radius:50%;background:rgba(200,169,126,0.15);line-height:70px;font-size:34px;">✓</div>
          <h1 style="font-family:Georgia,serif;font-size:34px;color:#c8a97e;margin:18px 0 6px;font-weight:normal;">Table Confirmed!</h1>
          <p style="color:#888;font-size:14px;margin:0;">Hi ${name || "there"}, your reservation at Mixtape Kitchen is confirmed.</p>
        </div>

        <div style="padding:30px 40px;">
          <div style="background:linear-gradient(160deg,#fdfaf5 0%,#f8f3ea 100%);border:1px dashed rgba(200,169,126,0.5);border-radius:12px;padding:20px 24px;">
            <table style="width:100%;font-size:14px;color:#1a1a1a;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;">Name</td><td style="padding:8px 0;text-align:right;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;">Date</td><td style="padding:8px 0;text-align:right;font-weight:600;">${date}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;">Time</td><td style="padding:8px 0;text-align:right;font-weight:600;">${time}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;">Guests</td><td style="padding:8px 0;text-align:right;font-weight:600;">${persons}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;">Booking ID</td><td style="padding:8px 0;text-align:right;font-weight:600;">#${String(reservationId).slice(-6).toUpperCase()}</td></tr>
            </table>
          </div>

          <div style="margin-top:26px;font-size:14px;color:#555;line-height:1.6;">
            <strong style="color:#1a1a1a;">Where to find us:</strong><br>
            123 Melody Lane, Bandra West,<br>Mumbai 400050
          </div>
        </div>

        <div style="background:#1a1a1a;color:#999;padding:22px 40px;font-size:12px;text-align:center;">
          Need help? Reply to this email or call us at +91 98765 43210.
        </div>
      </div>
    </div>`;

    try {
        const info = await transporter.sendMail({
            from: `"Mixtape Kitchen" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your Reservation is Confirmed — ${date} at ${time}`,
            html,
        });
        console.log("✅ Reservation email sent:", info.messageId);
        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌ Reservation email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

// ------------------------------------------------------------
// 2. ORDER CONFIRMATION EMAIL (after payment)
// ------------------------------------------------------------
async function sendOrderEmail({ to, name, items, amount, paymentId, orderId }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ Email not configured — skipping order email");
        return { sent: false };
    }

    const itemRows = (items || []).map(item => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px dashed #eee;">
          <strong style="color:#1a1a1a;">${item.name}</strong><br>
          <span style="color:#999;font-size:12px;">Qty: ${item.quantity} × ₹${Number(item.price).toFixed(2)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px dashed #eee;text-align:right;font-weight:600;color:#c8a97e;">
          ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}
        </td>
      </tr>
    `).join("");

    const html = `
    <div style="font-family:'Poppins',Arial,sans-serif;background:#f6f2ea;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.08);">

        <div style="height:5px;background:linear-gradient(90deg,#c8a97e,#e8d4b8,#c8a97e);"></div>

        <div style="padding:40px 40px 10px;text-align:center;">
          <div style="display:inline-block;width:70px;height:70px;border-radius:50%;background:rgba(200,169,126,0.15);line-height:70px;font-size:34px;">✓</div>
          <h1 style="font-family:Georgia,serif;font-size:34px;color:#c8a97e;margin:18px 0 6px;font-weight:normal;">Order Confirmed!</h1>
          <p style="color:#888;font-size:14px;margin:0;">Hi ${name || "there"}, thanks for your order. We're preparing it now.</p>
        </div>

        <div style="padding:30px 40px;">
          <div style="background:linear-gradient(160deg,#fdfaf5 0%,#f8f3ea 100%);border:1px dashed rgba(200,169,126,0.5);border-radius:12px;padding:20px 24px;">
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              ${itemRows}
              <tr>
                <td style="padding-top:14px;font-size:16px;font-weight:700;color:#1a1a1a;">Total Paid</td>
                <td style="padding-top:14px;text-align:right;font-size:18px;font-weight:800;color:#c8a97e;">₹${Number(amount).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top:22px;font-size:13px;color:#777;line-height:1.7;">
            <strong style="color:#1a1a1a;">Payment ID:</strong> ${paymentId}<br>
            <strong style="color:#1a1a1a;">Order ID:</strong> ${orderId}
          </div>

          <div style="margin-top:22px;font-size:13px;color:#777;line-height:1.7;">
            <strong style="color:#1a1a1a;">Delivery address:</strong><br>
            123 Melody Lane, Bandra West,<br>Mumbai 400050
          </div>
        </div>

        <div style="background:#1a1a1a;color:#999;padding:22px 40px;font-size:12px;text-align:center;">
          Questions? Reply to this email or call +91 98765 43210.
        </div>
      </div>
    </div>`;

    try {
        const info = await transporter.sendMail({
            from: `"Mixtape Kitchen" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your Order is Confirmed — ₹${Number(amount).toFixed(2)}`,
            html,
        });
        console.log("✅ Order email sent:", info.messageId);
        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌ Order email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

module.exports = { sendReservationEmail, sendOrderEmail };