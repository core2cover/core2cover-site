import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { verifyPasswordResetToken } from "@/utils/tokenUtils";
import { validatePasswordStrength } from "@/utils/passwordValidation";
import { sendPasswordChangedEmail } from "@/utils/emailService";
import { resetPasswordRateLimiter } from "@/utils/rateLimiter";

/**
 * POST /api/designer/reset-password
 * Handles password reset for designers
 */
export async function POST(request) {
  try {
    // Apply rate limiting
    try {
      resetPasswordRateLimiter(request);
    } catch (rateLimitError) {
      return NextResponse.json(
        { message: rateLimitError.message },
        { status: 429 }
      );
    }

    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { message: "Token, email, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          message: "Password does not meet requirements", 
          errors: passwordValidation.errors 
        },
        { status: 400 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();

    // Find designer with reset token
    const designer = await prisma.designer.findUnique({
      where: { email: emailNormalized },
    });

    if (!designer || !designer.resetToken || !designer.resetTokenExpiry) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Verify token and expiry
    const isValidToken = verifyPasswordResetToken(
      token,
      designer.resetToken,
      designer.resetTokenExpiry
    );

    if (!isValidToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update passwordHash and clear reset token
    await prisma.designer.update({
      where: { email: emailNormalized },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(emailNormalized);
    } catch (emailError) {
      console.error("Failed to send password changed email:", emailError);
    }

    return NextResponse.json({
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Designer reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
