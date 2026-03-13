import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const DB = "kpmg_chatbot";
const COLLECTION = "files";

// GET /api/files — get all files (admin) or user's files
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    const client = await clientPromise;
    const db = client.db(DB);

    // Admin sees all files, users see only their own
    const query = role === "admin" ? {} : { userId };

    const files = await db
      .collection(COLLECTION)
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();

    const formatted = files.map(({ _id, ...rest }) => ({
      _id: _id.toString(),
      ...rest,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/files error:", err);
    return NextResponse.json({ error: "Failed to load files" }, { status: 500 });
  }
}

// POST /api/files — save file metadata + base64 to MongoDB
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, username, name, type, size, base64 } = body;

    if (!userId || !name || !base64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB);

    const fileDoc = {
      userId,
      username,
      name,
      type,
      size,
      base64,        // store file as base64 string
      uploadedAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(fileDoc);

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...fileDoc,
    });
  } catch (err) {
    console.error("POST /api/files error:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}