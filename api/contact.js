const { Resend } = require("resend");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_FROM_EMAIL = "noreply@pennysaver.online";
const DEFAULT_TO_EMAIL = "aqsaaltaf01@gmail.com";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPlainText(name, email, subject, message) {
  return [
    "New message from your portfolio contact form",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
    "",
    `Reply to this person at: ${email}`,
  ].join("\n");
}

function buildHtmlEmail(name, email, subject, message) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#b1b493;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">New Contact Form Message</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#333;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 12px;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin:0 0 12px;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
              <p style="margin:0 0 12px;"><strong>Subject:</strong> ${safeSubject}</p>
              <p style="margin:0 0 8px;"><strong>Message:</strong></p>
              <p style="margin:0;white-space:pre-wrap;">${safeMessage}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;color:#999;font-size:12px;">
              Reply to ${safeName} at ${safeEmail}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;

  if (!apiKey || !fromEmail) {
    return json(res, 500, { error: "Email service is not configured" });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: "Invalid request body" });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const description = String(body.description || "").trim();

  if (!name) {
    return json(res, 400, { error: "Name is required" });
  }

  if (!email) {
    return json(res, 400, { error: "Email is required" });
  }

  if (!subject) {
    return json(res, 400, { error: "Subject is required" });
  }

  if (!description) {
    return json(res, 400, { error: "Message is required" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return json(res, 400, { error: "Please enter a valid email address" });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: `Aqsa Altaf Portfolio <${fromEmail}>`,
      to: [toEmail],
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: buildHtmlEmail(name, email, subject, description),
      text: buildPlainText(name, email, subject, description),
    });

    if (error) {
      console.error("Resend error:", error);
      return json(res, 500, { error: mapResendError(error) });
    }

    return json(res, 200, { success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return json(res, 500, { error: "Failed to send message. Please try again." });
  }
};

function mapResendError(error) {
  const message = error?.message || "";

  if (/domain is not verified/i.test(message)) {
    return "Sender domain is not verified in Resend. Verify pennysaver.online first.";
  }

  if (/only send testing emails to your own email/i.test(message)) {
    return "Resend free plan: verify your domain or send to your Resend account email only.";
  }

  return message || "Failed to send message. Please try again.";
}
