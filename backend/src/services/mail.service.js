const { Client } = require("postmark");

function requireMailConfig() {
  const sender = process.env.SMTP_USER;
  const token = process.env.POSTMARK_API_KEY;
  if (!sender || !token) {
    const error = new Error(
      "POSTMARK_API_KEY and SMTP_USER are required for email delivery",
    );
    error.statusCode = 500;
    console.error("[Mailer] Error requiring mail config: ", error);
    throw error;
  }

  const client = new Client(token);
  return { sender, client };
}

async function sendMail(recipient, subject, message) {
  const { sender, client } = requireMailConfig();

  const response = await client.sendEmail({
    From: `PhinuxTV <${sender}>`,
    To: recipient,
    Subject: subject,
    HtmlBody: message,
  });

  if (response.ErrorCode !== 0) {
    const error = new Error(response.Message || "Error sending email");
    console.error("[Mailer] Error sending email: ", error);
    throw error;
  }

  return {
    message: "Email sent successfully",
    messageID: response.MessageID,
    recipient: response.To,
    submittedAt: response.SubmittedAt,
  };
}

module.exports = { sendMail };
