import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(request) {
    try {
        const { email, otp, newPassword } = await request.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { message: "Email, OTP, and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const emailNormalized = email.trim().toLowerCase();

        // 1. Find the verified OTP record
        const record = await prisma.sellerOtp.findFirst({
            where: {
                email: emailNormalized,
                verified: true,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!record) {
            return NextResponse.json(
                { message: "OTP not verified or expired. Please start again." },
                { status: 400 }
            );
        }

        // 2. Double-check OTP hash matches
        if (record.otpHash !== hashOtp(otp)) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        }

        // 3. Find the seller
        const seller = await prisma.seller.findUnique({
            where: { email: emailNormalized },
        });

        if (!seller) {
            return NextResponse.json(
                { message: "No seller account found with this email" },
                { status: 404 }
            );
        }

        // 4. Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.seller.update({
            where: { email: emailNormalized },
            data: { password: hashedPassword },
        });

        // 5. Delete the used OTP record
        await prisma.sellerOtp.delete({ where: { id: record.id } });

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("SELLER RESET PASSWORD ERROR:", err);
        return NextResponse.json(
            { message: "Failed to reset password" },
            { status: 500 }
        );
    }
}
