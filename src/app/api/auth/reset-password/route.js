import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { verifyPasswordResetToken } from "@/utils/tokenUtils";
import { validatePasswordStrength } from "@/utils/passwordValidation";
import { sendPasswordChangedEmail } from "@/utils/emailService";
import { resetPasswordRateLimiter } from "@/utils/rateLimiter";

/**
 * POST /api/auth/reset-password
 * Handles password reset for customers (User model)
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

    // Find user with reset token
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Verify token and expiry
    const isValidToken = verifyPasswordResetToken(
      token,
      user.resetToken,
      user.resetTokenExpiry
    );

    if (!isValidToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { email: emailNormalized },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Invalidate all existing sessions for this user (security best practice)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(emailNormalized);
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error("Failed to send password changed email:", emailError);
    }

    return NextResponse.json({
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
