import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req: NextRequest) => {
  // ========= endpoint for asking a question to the pdf file =============

  // get the body response from API
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();

  // rename the id property from user object to userId
  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  // zod schema validator for sending message
  // if the received body response is not valid with the zod schema, an error is thrown
  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not Found", { status: 404 });

  // Add the message to the DB
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // Vectorize the message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_API_KEY,
  });

  // initialize client instance with the index name from the app console
  const pineconeIndex = pinecone.index("pdf-chat-bot");

  // ======== Search the vector DB to find the similar vector to the sent message
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4); // 4 is the number of similar responses

  // get the last 6 messages from the DB
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  // format the messages according to OpenAI API; content and role is required
  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  // create reponse with the provided context
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        \n----------------\n
  
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
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

  // using vercel ai to stream the UI; display part of the generated response instead of waiting for the whole response to be generated

  // convert the response to text-stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          userId,
          fileId,
        },
      });
    },
  });
  // Return with the readable stream to use in Client
  return new StreamingTextResponse(stream);
};
