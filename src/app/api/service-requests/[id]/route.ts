import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ServiceRequest from "@/models/ServiceRequest";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { status } = await req.json();

    if (!["Accepted", "Declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await ServiceRequest.findByIdAndUpdate(params.id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Request updated", request: updated });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
