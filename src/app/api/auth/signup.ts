import { NextResponse } from "next/server";
import { signUp } from "@/services/userService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    await signUp(name, email, password);
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
