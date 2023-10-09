import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const { getUser } = getKindeServerSession();
      const user = getUser();

      // If you throw, the user will not be able to upload
      if (!user || !user.id) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          url: file.url,
          userId: metadata.userId,
          uploadStatus: "PROCESSING",
        },
      });

      /*  vectorize and index entire document
       *** Use OpenAI model to vectorize the document
       *** Integrating pinecone and langchain to store the vector
       */
      try {
        const res = await fetch(file.url);
        const blob = await res.blob();

        // Using langChain PDFloader to convert PDF to a LangChain 'Document'
        const loader = new PDFLoader(blob);
        // The load() function is then used for loading data as the Document
        const docs = await loader.load();

        const pagesAmt = docs.length;

        // initialize client instance with the index name from the app console
        const pineconeIndex = pinecone.index("pdf-chat-bot");

        /* Generate vector number of the PDF
         initialize OpenAI embedding with the api key */
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPEN_API_KEY,
        });

        // Index the document to Pinecone DB with openAi embedding
        await PineconeStore.fromDocuments(docs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        // If no error is thrown, updates the upload status of file to SUCCESS in the database
        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (error) {
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
