import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, message } = await req.json();
    if (!email || !message) {
      return new Response(JSON.stringify({ error: "Missing email or message" }), { status: 400 });
    }

    // Configure your SMTP transport (replace with your credentials)
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return new Response(JSON.stringify({ error: "Failed to send message" }), { status: 500 });
  }
}
