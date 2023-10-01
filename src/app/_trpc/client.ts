import { AppRouter } from "@/trpc";
import { createTRPCReact } from "@trpc/react-query";

// to create typesafe API, need to pass a type
// we get this from AppRouter in trpc -> index.ts
export const trpc = createTRPCReact<AppRouter>({});
