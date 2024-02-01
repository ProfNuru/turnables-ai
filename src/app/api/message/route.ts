import { db } from "@/db";
import { openai } from "@/lib/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest, NextResponse } from "next/server";

import { OpenAIStream, StreamingTextResponse } from "ai";
import { isBefore } from "date-fns";

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  try {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const userId = user?.id;
    const enhanceWithExternalSource = false;

    if (!userId) return new Response("Unauthorized", { status: 401 });

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!dbUser) return new Response("Unauthorized", { status: 401 });

    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) return new Response("Not found", { status: 404 });

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId,
        fileId,
      },
    });

    // 1: vectorize message
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("turnables");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
      where: {
        fileId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg: any) => ({
      role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));

    const isSubscribed =
      dbUser.stripeCurrentPeriodEnd &&
      isBefore(new Date(), dbUser.stripeCurrentPeriodEnd)
        ? true
        : false;

    const response = await openai.chat.completions.create({
      model: isSubscribed ? "gpt-4-1106-preview" : "gpt-3.5-turbo", // "gpt-4-1106-preview",
      temperature: 0,
      stream: true,
      messages: [
        {
          role: "system",
          content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. ${
            !enhanceWithExternalSource &&
            "Do not use information outside of the context or document in your responses."
          }`,
        },
        {
          role: "user",
          content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
          ${
            !enhanceWithExternalSource &&
            "Do not use information outside of the context or document in your responses."
          }
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message: any) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
        },
      ],
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await db.message.create({
          data: {
            text: completion,
            isUserMessage: false,
            fileId,
            userId,
          },
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("[MESSAGE_ERROR]:", error);
    return new NextResponse("AI failed", { status: 500 });
  }
};
