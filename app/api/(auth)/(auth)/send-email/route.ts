import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, otp, type } = await request.json();

    if (!to || !otp) {
      return NextResponse.json(
        { success: false, detail: "Missing 'to' or 'otp' fields in request body." },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD?.replace(/\s+/g, "");

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        { success: false, detail: "SMTP credentials (EMAIL_USER/EMAIL_PASSWORD) missing in .env." },
        { status: 500 }
      );
    }

    // Explicit SMTP configuration for maximum reliability
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Upgrades to secure STARTTLS automatically
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    let subject = "";
    let htmlContent = "";

    if (type === "reset") {
      subject = `Reset your FastAuth Password: ${otp}`;
      htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 20px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; border: 1px solid #27272a; border-radius: 12px; background-color: #18181b; padding: 30px;">
                    <h2 style="color: #ef4444; margin-bottom: 20px;">Password Reset Request</h2>
                    <p style="font-size: 16px; color: #a1a1aa;">Hello,</p>
                    <p style="font-size: 16px; color: #a1a1aa;">We received a request to reset your password. Use the verification code below to authorize the change:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #ffffff; background-color: #09090b; padding: 15px; border-radius: 8px; margin: 30px 0; border: 1px solid #3f3f46;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #ef4444; font-weight: 500;">If you did not request a password reset, please secure your account immediately.</p>
                    <p style="font-size: 13px; color: #71717a; margin-top: 20px;">This code will expire in 15 minutes.</p>
                </div>
            </body>
        </html>
      `;
    } else {
      subject = `Verify your FastAuth Account: ${otp}`;
      htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 20px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; border: 1px solid #27272a; border-radius: 12px; background-color: #18181b; padding: 30px;">
                    <h2 style="color: #6366f1; margin-bottom: 20px;">FastAuth Verification</h2>
                    <p style="font-size: 16px; color: #a1a1aa;">Hello,</p>
                    <p style="font-size: 16px; color: #a1a1aa;">Thank you for registering. Use the security code below to verify your account:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #ffffff; background-color: #09090b; padding: 15px; border-radius: 8px; margin: 30px 0; border: 1px solid #3f3f46;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #71717a;">This verification code is valid for 1 hour. If you didn't request this code, you can ignore this email.</p>
                </div>
            </body>
        </html>
      `;
    }

    const mailOptions = {
      from: `"FastAuth App" <${emailUser}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Email sent successfully via Nodemailer" });
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return NextResponse.json(
      { success: false, detail: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
