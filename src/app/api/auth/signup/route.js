import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { validatePasswordStrength } from "@/utils/passwordValidation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
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
    
    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: emailNormalized,
        phone,
        address,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 });

  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}