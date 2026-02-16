import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { validatePasswordStrength } from "@/utils/passwordValidation";
import { sendPasswordChangedEmail } from "@/utils/emailService";

/**
 * POST /api/seller/change-password
 * Handles password change for authenticated sellers
 * Note: This requires seller authentication (implement your auth check)
 */
export async function POST(request) {
  try {
    const { email, oldPassword, newPassword } = await request.json();

    // Note: In production, get email from authenticated session
    // For now, requiring email in request body
    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Email, old password, and new password are required" },
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

    const emailNormalized = email.trim().toLowerCase();

    // Find seller
    const seller = await prisma.seller.findUnique({
      where: { email: emailNormalized },
    });

    if (!seller) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, seller.password);

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.seller.update({
      where: { email: emailNormalized },
      data: {
        password: hashedPassword,
      },
    });

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(emailNormalized);
    } catch (emailError) {
      console.error("Failed to send password changed email:", emailError);
    }

    return NextResponse.json({
      message: "Password changed successfully. Please log in again with your new password.",
    });
  } catch (error) {
    console.error("Seller change password error:", error);
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 }
    );
  }
}
