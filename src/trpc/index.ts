import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

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
  // API to fetch file from DB
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
  // API to get file upload status
  getFileUploadStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      // const assertion, value of status is PENDING and read only
      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        // variable of number with range of 1-100, can be null too
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      // cursor determines where the user has scrolled and refetch the older msgs
      const { fileId, cursor } = input;
      // determines how many messages are fetched
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      // if DB has more msgs than set limit
      if (messages.length > limit) {
        // get the last item of the messages
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return { messages, nextCursor };
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

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl("/dashboard/billing");

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
