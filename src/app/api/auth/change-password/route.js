import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { validatePasswordStrength } from "@/utils/passwordValidation";
import { sendPasswordChangedEmail } from "@/utils/emailService";

/**
 * POST /api/auth/change-password
 * Handles password change for authenticated customers (User model)
 * Requires valid session
 */
export async function POST(request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Old password and new password are required" },
        { status: 400 }
      );
    }

    // Prevent using the same password
    if (oldPassword === newPassword) {
      return NextResponse.json(
        { message: "New password must be different from old password" },
        { status: 400 }
      );
    }

    // Validate new password strength
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

    const emailNormalized = session.user.email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "User not found or invalid account type" },
        { status: 404 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email: emailNormalized },
      data: {
        password: hashedPassword,
      },
    });

    // Invalidate all existing sessions for security
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
      message: "Password changed successfully. Please log in again with your new password.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 }
    );
  }
}
