import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import generateKeyAndUpdateUser from "./generateKeyAndUpddateUser";

export async function GET(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const userId = user?.id;

    const updatedUser = await generateKeyAndUpdateUser(userId || "");
    return NextResponse.json({ key: updatedUser.apiKey });
  } catch (error) {
    console.log("[API_KEY_ERROR]:", error);
    return new NextResponse("Failed to generate API key", { status: 500 });
  }
}
