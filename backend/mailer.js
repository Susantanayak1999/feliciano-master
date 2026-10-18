// ============================================================
// MAILER — Brevo HTTP API (works on Render, no port blocks)
// ============================================================
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = "susantanayak01592@gmail.com";
const BREVO_SENDER_NAME = "Mixtape Kitchen";

if (!BREVO_API_KEY) {
    console.warn("⚠️ BREVO_API_KEY not set — emails will not send");
} else {
    console.log("✅ Mailer ready (Brevo API)");
}

// ---------- Helper: send via Brevo HTTP API ----------
async function brevoSend({ to, subject, html }) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || JSON.stringify(data));
    }
    return data;
}

// ------------------------------------------------------------
// 1. RESERVATION CONFIRMATION (Elegant Invitation Style)
// ------------------------------------------------------------
async function sendReservationEmail({ to, name, date, time, persons, reservationId }) {
    if (!BREVO_API_KEY) return { sent: false };

    const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; margin: 0;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
        
        <!-- Top Gold Accent -->
        <div style="height: 6px; background: linear-gradient(90deg, #c8a97e, #e8d4b8, #c8a97e);"></div>
        
        <!-- Header -->
        <div style="padding: 45px 40px 30px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #c8a97e; font-weight: 700; margin-bottom: 12px;">Mixtape Kitchen</div>
          <h1 style="font-family: Georgia, serif; color: #1a1a1a; margin: 0; font-size: 32px; font-weight: normal; line-height: 1.2;">You're Invited</h1>
          <p style="color: #666; font-size: 15px; margin-top: 10px;">Hi ${name}, your table is officially reserved.</p>
        </div>

        <!-- Ornamental Divider -->
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="display: inline-block; width: 40px; height: 1px; background-color: #e2e8f0; vertical-align: middle;"></span>
          <span style="display: inline-block; margin: 0 10px; color: #c8a97e; font-size: 16px; vertical-align: middle;">✦</span>
          <span style="display: inline-block; width: 40px; height: 1px; background-color: #e2e8f0; vertical-align: middle;"></span>
        </div>

        <!-- Ticket Details -->
        <div style="padding: 0 50px 40px;">
          <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Date</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Time</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Guests</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${persons} People</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Booking Ref</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #c8a97e;">#${String(reservationId).slice(-6).toUpperCase()}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #fafaf8; padding: 25px; text-align: center; border-top: 1px solid #f0f0f0;">
          <p style="color: #888; font-size: 12px; margin: 0;">Need to make changes? Call us at <strong style="color: #1a1a1a;">+91 98765 43210</strong></p>
          <p style="color: #aaa; font-size: 11px; margin-top: 6px;">We look forward to hosting you at Mixtape Kitchen.</p>
        </div>

      </div>
    </div>`;

    try {
        const data = await brevoSend({
            to,
            subject: `✨ Your Table is Confirmed — ${date} at ${time}`,
            html,
        });
        console.log("✅ Reservation email sent to", to, "→", data.messageId);
        return { sent: true, id: data.messageId };
    } catch (err) {
        console.error("❌ Reservation email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

// ------------------------------------------------------------
// 2. ORDER CONFIRMATION (Modern Receipt Style)
// ------------------------------------------------------------
async function sendOrderEmail({ to, name, items, amount, paymentId, orderId }) {
    if (!BREVO_API_KEY) return { sent: false };

    const itemRows = (items || []).map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px dashed #eee;">
          <strong style="color: #1a1a1a; font-size: 14px;">${item.name}</strong><br>
          <span style="color: #888; font-size: 12px;">Qty: ${item.quantity} × ₹${Number(item.price).toFixed(2)}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px dashed #eee; text-align: right; font-weight: 600; color: #c8a97e; vertical-align: bottom;">
          ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}
        </td>
      </tr>
    `).join("");

    const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; margin: 0;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
        
        <!-- Top Gold Accent -->
        <div style="height: 6px; background: linear-gradient(90deg, #c8a97e, #e8d4b8, #c8a97e);"></div>
        
        <!-- Header -->
        <div style="padding: 45px 40px 30px; text-align: center;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #c8a97e; font-weight: 700; margin-bottom: 12px;">Order Confirmed</div>
          <h1 style="font-family: Georgia, serif; color: #1a1a1a; margin: 0; font-size: 32px; font-weight: normal; line-height: 1.2;">Thank You, ${name}</h1>
          <p style="color: #666; font-size: 15px; margin-top: 10px;">We've received your order and are preparing it now.</p>
        </div>

        <!-- Receipt Body -->
        <div style="padding: 0 40px 40px;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
            ${itemRows}
          </table>
          
          <table style="width: 100%; font-size: 16px; margin-top: 10px;">
            <tr>
              <td style="font-weight: 700; color: #1a1a1a;">Total Paid</td>
              <td style="text-align: right; font-weight: 800; color: #c8a97e; font-size: 20px;">₹${Number(amount).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Order Meta -->
        <div style="background-color: #fafaf8; padding: 25px; text-align: center; border-top: 1px solid #f0f0f0;">
          <p style="color: #888; font-size: 12px; margin: 0 0 4px;">Payment ID: <span style="color: #1a1a1a;">${paymentId}</span></p>
          <p style="color: #888; font-size: 12px; margin: 0;">Order ID: <span style="color: #1a1a1a;">${orderId}</span></p>
        </div>

      </div>
    </div>`;

    try {
        const data = await brevoSend({
            to,
            subject: `Your Order is Confirmed — ₹${Number(amount).toFixed(2)}`,
            html,
        });
        console.log("✅ Order email sent to", to, "→", data.messageId);
        return { sent: true, id: data.messageId };
    } catch (err) {
        console.error("❌ Order email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

// ------------------------------------------------------------
// 3. RESERVATION STATUS UPDATE (Approved / Cancelled)
// ------------------------------------------------------------
async function sendReservationStatusEmail({ to, name, date, time, persons, status }) {
    if (!BREVO_API_KEY) return { sent: false };

    const isApproved = status === "approved";
    
    // Theme colors
    const color = isApproved ? "#2e7d32" : "#c62828";
    const bgLight = isApproved ? "#f0fdf4" : "#fef2f2";
    const icon = isApproved ? "✓" : "✕";
    
    const title = isApproved ? "Reservation Confirmed" : "Reservation Cancelled";
    const subtitle = isApproved ? "We look forward to serving you!" : "We're sorry to see you go.";
    
    const msg = isApproved 
        ? `Great news, ${name}! Your table for <strong>${persons} guests</strong> on <strong>${date}</strong> at <strong>${time}</strong> is officially confirmed.`
        : `Hi ${name}, unfortunately, we had to cancel your reservation for <strong>${persons} guests</strong> on <strong>${date}</strong>. If this was a mistake, please contact us immediately.`;

    const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; margin: 0;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
        
        <!-- Top Accent -->
        <div style="height: 6px; background-color: ${color};"></div>
        
        <!-- Icon Header -->
        <div style="padding: 45px 40px 20px; text-align: center;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background-color: ${bgLight}; color: ${color}; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px;">
            ${icon}
          </div>
          <h1 style="font-family: Georgia, serif; color: #1a1a1a; margin: 0; font-size: 28px; font-weight: normal; line-height: 1.2;">${title}</h1>
          <p style="color: #666; font-size: 15px; margin-top: 8px;">${subtitle}</p>
        </div>

        <!-- Message -->
        <div style="padding: 0 40px 30px; text-align: center;">
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">${msg}</p>
        </div>

        <!-- Details Box -->
        <div style="margin: 0 40px 40px; background-color: #fafaf8; border-radius: 12px; padding: 20px; border: 1px solid #eee;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #888;">Date</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888;">Time</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888;">Guests</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${persons}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #1a1a1a; color: #999; padding: 25px; font-size: 12px; text-align: center;">
          Need help? Call <a href="tel:+919876543210" style="color: #c8a97e; text-decoration: none;">+91 98765 43210</a>
        </div>

      </div>
    </div>`;

    try {
        const data = await brevoSend({
            to,
            subject: `${isApproved ? '✨' : '⚠️'} Reservation Update — ${title}`,
            html,
        });
        console.log("✅ Reservation Status email sent to", to, "→", data.messageId);
        return { sent: true, id: data.messageId };
    } catch (err) {
        console.error("❌ Reservation Status email failed:", err.message);
        return { sent: false, error: err.message };
    }
}

module.exports = { sendReservationEmail, sendOrderEmail, sendReservationStatusEmail };