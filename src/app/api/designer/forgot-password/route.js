import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPasswordResetToken } from "@/utils/tokenUtils";
import { sendPasswordResetEmail } from "@/utils/emailService";
import { forgotPasswordRateLimiter } from "@/utils/rateLimiter";

/**
 * POST /api/designer/forgot-password
 * Handles password reset requests for designers
 */
export async function POST(request) {
  try {
    // Apply rate limiting
    try {
      forgotPasswordRateLimiter(request);
    } catch (rateLimitError) {
      return NextResponse.json(
        { message: rateLimitError.message },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();

    // Find designer
    const designer = await prisma.designer.findUnique({
      where: { email: emailNormalized },
    });

    // Security: Don't reveal if designer exists or not
    if (!designer) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate secure reset token
    const { token, hashedToken, expiry } = createPasswordResetToken(15);

    // Store hashed token in database
    await prisma.designer.update({
      where: { email: emailNormalized },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/designer/reset-password?token=${token}&email=${encodeURIComponent(emailNormalized)}`;

    // Send email
    await sendPasswordResetEmail(emailNormalized, resetLink, 15);

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Designer forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
