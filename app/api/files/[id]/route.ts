import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

const DB = "kpmg_chatbot";
const COLLECTION = "files";

// DELETE /api/files/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DB);
    await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/files/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}