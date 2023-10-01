import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
const middleware = t.middleware;

// middleware to check if user is signed
const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    // anything passed in context (ctx) is accesible from our api end point
    ctx: {
      userId: user.id,
      user,
    },
  });
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
// allows to create API end point whether the user is authenticated or not
export const publicProcedure = t.procedure;
// to create API end point only if the user is authenticated
export const privateProcedure = t.procedure.use(isAuth);
