import { db } from "@/db";
import { Prisma, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const generateKeyAndUpdateUser = async (userId: string): Promise<User> => {
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
};

export default generateKeyAndUpdateUser;
