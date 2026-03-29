import { connectDB } from '@/lib/mongodb';

export async function GET(Request: Request) {
  await connectDB();

  return Response.json({ message: "Working" });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb/client";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await users.insertOne({
      email,
      passwordHash,
      base_currency_code: "USD",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    // Helpful error message while you're wiring up Atlas/Mongo credentials.
    console.error("Signup error:", err);
    const message =
      err instanceof Error ? err.message : "Signup failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

