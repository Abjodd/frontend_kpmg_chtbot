import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const DB = "kpmg_chatbot";
const COLLECTION = "chats";

// GET /api/chats — load all chats
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB);
    const chats = await db
      .collection(COLLECTION)
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    // Always return _id as a plain string so frontend can use it directly
    const formatted = chats.map(({ _id, ...rest }) => ({
      _id: _id.toString(),
      ...rest,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/chats error:", err);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}

// POST /api/chats — create a new chat
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db(DB);

    const newChat = {
      title: body.title ?? "New Conversation",
      messages: body.messages ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(newChat);

    // Return _id as plain string
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...newChat,
    });
  } catch (err) {
    console.error("POST /api/chats error:", err);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}