import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  // Initialize Resend inside the handler to avoid build-time errors
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // Parse the request body to get the form data
    const { name, email, subject, message } = await req.json();

    // Basic validation to ensure all fields are present
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // Using the default Resend address
      to: ["wuyang1010@gmail.com"], // Changed to your verified Resend account email for testing
      subject: `New Message from ${name}: ${subject}`,
      replyTo: email, // Corrected property name to camelCase
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p>You have received a new message from your portfolio's contact form.</p>
          <hr>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="padding: 10px; border-left: 4px solid #ccc; margin-left: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </p>
          <hr>
          <p style="font-size: 0.9em; color: #888;">This email was sent from the contact form on your portfolio website.</p>
        </div>
      `,
    });

    // If there was an error sending the email, return an error response
    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send message." },
        { status: 500 }
      );
    }

    // If the email was sent successfully, return a success response
    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (err) {
    // Handle any other errors that might occur
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
