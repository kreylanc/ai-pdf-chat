import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

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
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
