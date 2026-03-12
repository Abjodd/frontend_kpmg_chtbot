import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

const DB = "kpmg_chatbot";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB);

    const user = await db.collection("users").findOne({
      username: username.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}