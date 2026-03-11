import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

const DB = "kpmg_chatbot";
const COLLECTION = "chats";

// PATCH /api/chats/[id] — update messages or title
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db(DB);

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (body.messages !== undefined) updateFields.messages = body.messages;
    if (body.title !== undefined) updateFields.title = body.title;

    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/chats/[id] error:", err);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

// DELETE /api/chats/[id] — delete a chat
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DB);

    await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/chats/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}