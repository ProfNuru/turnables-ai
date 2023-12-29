import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { apiKey: string; fileId: string } }
) => {
  // public API endpoint for fetching messages associated with file

  try {
    const dbUser = await db.user.findFirst({
      where: {
        apiKey: params.apiKey,
      },
    });
    if (!dbUser) return new Response("Unauthorized", { status: 401 });

    const file = await db.file.findFirst({
      where: {
        id: params.fileId,
        userId: dbUser.id,
      },
      include: {
        messages: {
          select: {
            id: true,
            text: true,
            isUserMessage: true,
            fileId: true,
          },
        },
      },
    });

    if (!file) return new Response("Invalid file ID", { status: 404 });

    return NextResponse.json({
      messages: file.messages,
      file: {
        title: file.name,
        id: file.id,
        url: file.url,
      },
    });
  } catch (error) {
    console.log("[MESSAGES_FETCH_ERROR]:", error);
    return new NextResponse("AI failed", { status: 500 });
  }
};
