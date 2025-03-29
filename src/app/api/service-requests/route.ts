import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ServiceRequest from "@/models/ServiceRequest";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { serviceTitle, message, requesterName, providerName } = body;

    if (!serviceTitle || !message || !requesterName || !providerName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const request = await ServiceRequest.create({ serviceTitle, message, requesterName, providerName });
    return NextResponse.json({ message: "Request sent", request }, { status: 201 });
  } catch (error) {
    console.error("Service Request Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const requester = req.nextUrl.searchParams.get("requester");
    const provider = req.nextUrl.searchParams.get("provider");

    const filter: any = {};
    if (requester) filter.requesterName = requester;
    if (provider) filter.providerName = provider;

    const requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
