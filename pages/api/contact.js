import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Missing email or message" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `Contact Form <${process.env.SMTP_USER}>`,
      to: "prathik.saduneni@gmail.com",
      subject: `Contact Form Message from ${email}`,
      text: message,
      replyTo: email,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
