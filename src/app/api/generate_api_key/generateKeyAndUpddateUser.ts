import { db } from "@/db";
import { Prisma, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const generateKeyAndUpdateUser = async (userId: string): Promise<User> => {
  try {
    if (!userId) {
      throw "Unauthorized";
    }

    const newKey = uuidv4();

    const dbUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        apiKey: newKey,
      },
    });
    return dbUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // API key already exists. Regenerate
        return generateKeyAndUpdateUser(userId);
      }
    }
    throw "API key generation failed";
  }
};

export default generateKeyAndUpdateUser;
