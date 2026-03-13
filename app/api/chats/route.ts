import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const DB = "kpmg_chatbot";
const COLLECTION = "chats";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB);

    const chats = await db.collection(COLLECTION).find({ userId }).sort({ updatedAt: -1 }).toArray();
    const formatted = chats.map(({ _id, ...rest }) => ({ _id: _id.toString(), ...rest }));
    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/chats error:", err);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB);

    
    await db.collection(COLLECTION).deleteMany({ userId: body.userId });

    const newChat = {
      userId: body.userId,
      title: body.title ?? "New Session",
      messages: body.messages ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(newChat);
    return NextResponse.json({ _id: result.insertedId.toString(), ...newChat });
  } catch (err) {
    console.error("POST /api/chats error:", err);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}