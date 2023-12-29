import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { email, message } = await req.json();

    if (!email || email.trim().length === 0) {
      return new Response("Email is required", { status: 400 });
    }
    if (!message || message.trim().length === 0) {
      return new Response("Message is required", { status: 400 });
    }

    const msg = await db.enquiry.create({
      data: {
        email,
        message,
      },
    });

    return NextResponse.json(msg);
  } catch (error) {
    console.log("[ENQUIRY_ERROR]:", error);
    return new NextResponse("Enquiry error", { status: 500 });
  }
};
