import { initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
// allows to create API end point whether the user is authenticated or not
export const publicProcedure = t.procedure;
