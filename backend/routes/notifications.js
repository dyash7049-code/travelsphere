const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios');

// ===== EMAIL TRANSPORTER =====
let emailTransporter = null;
let senderEmail = '';

const initEmailTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    emailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
    senderEmail = user;
    console.log(`📧 Email ready with Gmail: ${user}`);
    console.log(`   Password: ${pass.substring(0,4)}****`);
    return;
  }

  // Fallback: Ethereal (test emails viewable online)
  try {
    const testAccount = await nodemailer.createTestAccount();
    emailTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
      tls: { rejectUnauthorized: false },
    });
    senderEmail = testAccount.user;
    console.log(`📧 Email using Ethereal test: ${testAccount.user}`);
    console.log(`   ⚠️  Emails won't reach real inboxes! Set EMAIL_USER & EMAIL_PASS in .env for real delivery.`);
  } catch (err) {
    console.warn('⚠️  Email setup failed:', err.message);
  }
};

initEmailTransporter();

// ===== EMAIL HTML TEMPLATE =====
const generateEmailHtml = (data) => {
  const { bookingId, itemName, type, route, formattedDate, travellerCount, formattedPrice } = data;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#10b981,#059669,#047857);padding:48px 32px;text-align:center;">
    <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:32px;">✅</div>
    <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Booking Confirmed!</h1>
    <p style="color:#a7f3d0;margin:8px 0 0;font-size:15px;">Your trip has been booked successfully</p>
  </div>
  <div style="padding:32px;">
    <div style="background:#f8fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">📋 Booking ID</td>
        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:800;color:#2563eb;font-size:18px;">${bookingId}</td></tr>
        <tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">🎫 Service</td>
        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;font-size:15px;">${itemName} (${type})</td></tr>
        ${route ? `<tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">🛤️ Route</td>
        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;font-size:15px;">${route}</td></tr>` : ''}
        <tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">📅 Date</td>
        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;font-size:15px;">${formattedDate}</td></tr>
        <tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">👥 Travellers</td>
        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;font-size:15px;">${travellerCount}</td></tr>
        <tr><td style="padding:14px 0;color:#64748b;font-size:14px;">💰 Amount Paid</td>
        <td style="padding:14px 0;text-align:right;font-weight:800;color:#10b981;font-size:24px;">₹${formattedPrice}</td></tr>
      </table>
    </div>
    <div style="margin-top:20px;padding:16px 20px;background:#eff6ff;border-radius:12px;border-left:4px solid #3b82f6;">
      <p style="margin:0;color:#1e40af;font-size:13px;"><strong>📱 Important:</strong> Carry a valid government ID proof matching the traveller name.</p>
    </div>
    <div style="margin-top:20px;text-align:center;padding:16px;">
      <p style="color:#94a3b8;font-size:13px;margin:0;">Need help? Contact us at</p>
      <p style="color:#3b82f6;font-size:14px;margin:4px 0 0;font-weight:600;">support@travelsphere.in | 1800-123-4567</p>
    </div>
  </div>
  <div style="background:#1e293b;padding:24px 32px;text-align:center;">
    <p style="color:#f8fafc;font-size:16px;margin:0 0 4px;font-weight:700;">Travel<span style="color:#f97316;">Sphere</span></p>
    <p style="color:#64748b;font-size:11px;margin:0;">© ${new Date().getFullYear()} TravelSphere. All rights reserved.</p>
  </div>
</div>
</body></html>`;
};

// ===== SEND BOOKING CONFIRMATION =====
router.post('/send-confirmation', async (req, res) => {
  const { bookingId, type, itemName, source, destination, date, price, travellers, contactEmail, contactPhone } = req.body;

  const results = { email: 'skipped', sms: 'skipped', whatsapp: 'skipped' };

  const route = source && destination ? `${source} → ${destination}` : (source || destination || '');
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  const travellerCount = travellers?.length || 1;
  const formattedPrice = Number(price).toLocaleString('en-IN');

  // ===== 1. SEND EMAIL =====
  if (contactEmail && emailTransporter) {
    try {
      const emailHtml = generateEmailHtml({ bookingId, itemName, type, route, formattedDate, travellerCount, formattedPrice });

      const info = await emailTransporter.sendMail({
        from: `"TravelSphere" <${senderEmail}>`,
        to: contactEmail,
        subject: `✅ Booking Confirmed - ${bookingId} | TravelSphere`,
        html: emailHtml,
      });

      results.email = 'sent';
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        results.emailPreview = previewUrl;
        console.log(`📧 Email sent! Preview: ${previewUrl}`);
      } else {
        console.log(`📧 Email delivered to ${contactEmail}`);
      }
    } catch (err) {
      console.error('Email error:', err.message);
      results.email = 'failed';
    }
  }

  // ===== 2. SEND SMS =====
  if (contactPhone) {
    let smsSent = false;

    // Method 1: Twilio (free $15.50 trial credits, ~500 SMS)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (twilioSid && twilioAuth && twilioPhone) {
      try {
        const twilio = require('twilio')(twilioSid, twilioAuth);
        const smsBody = `TravelSphere Booking Confirmed!\n\nBooking ID: ${bookingId}\nService: ${itemName}\n${route ? 'Route: ' + route + '\n' : ''}Date: ${formattedDate}\nAmount: Rs.${formattedPrice}\n\nCarry valid ID. Support: 1800-123-4567`;
        
        await twilio.messages.create({
          body: smsBody,
          from: twilioPhone,
          to: `+91${contactPhone}`,
        });
        results.sms = 'sent';
        smsSent = true;
        console.log(`📱 SMS sent to +91${contactPhone} via Twilio`);
      } catch (err) {
        console.log('📱 Twilio SMS error:', err.message);
      }
    }

    // Method 2: Fast2SMS fallback
    if (!smsSent) {
      const fast2smsKey = process.env.FAST2SMS_API_KEY;
      if (fast2smsKey) {
        try {
          const smsRes = await axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=q&message=TravelSphere+Booking+${bookingId}+confirmed.+${encodeURIComponent(itemName)}.+Rs.${formattedPrice}&flash=0&numbers=${contactPhone}`);
          if (smsRes.data && smsRes.data.return === true) {
            results.sms = 'sent';
            smsSent = true;
            console.log(`📱 SMS sent to ${contactPhone} via Fast2SMS`);
          }
        } catch (err) {
          console.log('📱 Fast2SMS error:', err.response?.data?.message || err.message);
        }
      }
    }

    if (!smsSent) {
      results.sms = 'failed';
      console.log('📱 SMS failed. Configure TWILIO or recharge Fast2SMS wallet.');
    }
  }

  // ===== 3. WhatsApp =====
  if (contactPhone) {
    const waText = `✅ *TravelSphere Booking Confirmed!*\n\n📋 *Booking ID:* ${bookingId}\n🎫 *Service:* ${itemName}\n${route ? '🛤️ *Route:* ' + route + '\n' : ''}📅 *Date:* ${formattedDate}\n👥 *Travellers:* ${travellerCount}\n💰 *Amount Paid:* ₹${formattedPrice}\n\nThank you for choosing TravelSphere! ✈️🌍\nSupport: support@travelsphere.in`;

    // Try Twilio WhatsApp sandbox
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    if (twilioSid && twilioAuth) {
      try {
        const twilio = require('twilio')(twilioSid, twilioAuth);
        await twilio.messages.create({
          body: waText,
          from: 'whatsapp:+14155238886',
          to: `whatsapp:+91${contactPhone}`,
        });
        results.whatsapp = 'sent';
        console.log(`💬 WhatsApp sent to +91${contactPhone} via Twilio`);
      } catch (err) {
        console.log('💬 Twilio WhatsApp error:', err.message);
        // Fallback to wa.me link
        const waMessage = encodeURIComponent(waText);
        results.whatsapp = `https://wa.me/91${contactPhone}?text=${waMessage}`;
      }
    } else {
      const waMessage = encodeURIComponent(waText);
      results.whatsapp = `https://wa.me/91${contactPhone}?text=${waMessage}`;
    }
  }

  console.log('📊 Notification results:', JSON.stringify(results, null, 2));
  res.json({ success: true, message: 'Notifications processed', results });
});

module.exports = router;
