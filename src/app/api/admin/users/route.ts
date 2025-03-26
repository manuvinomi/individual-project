import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find({}, { password: 0 }); // Exclude passwords

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
