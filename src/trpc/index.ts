import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    // get user data from Kinde
    const { getUser } = getKindeServerSession();
    const user = getUser();

    // Thro error check if user is not signed in
    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // check if user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        // pass kinde's user id
        id: user.id,
      },
    });
    // check if user is not in the database i.e. first time user
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // query to fetch file where the userId matches
    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  // Query to fetch file from DB
  getFile: privateProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      // check file where the key matches with the input key and current signed userId
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });
      // if not found throw NOT FOUND error
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
  // using zod to validate the data type for input
  deleteFile: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // spread the ctx
      const { userId } = ctx;

      // query where a file with the provided id and with signed user exists in DB
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      // if doesnt exist throw not found error
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // if exists then delete from DB
      await db.file.delete({
        where: {
          id: input.id,
          userId,
        },
      });

      return file;
    }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
