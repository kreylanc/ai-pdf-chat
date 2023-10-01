"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

function page() {
  // useRouter to change the routes back to the origin
  const router = useRouter();

  // read the url query parameters
  const searchParams = useSearchParams();
  // gets dashboard from ?origin=dashboard
  const origin = searchParams.get("origin");

  trpc.authCallback.useQuery(undefined, {
    // if authoriation is successfull
    onSuccess: ({ success }) => {
      if (success) {
        // if origin exists route to origin else to dashboard
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
    // if authorization failed
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        // route user to sign in page
        router.push("/sign-in");
      }
    },
    retry: true,
    retryDelay: 500,
  });
  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-stone-800" />
        <h1 className="font-semibold text-xl">Setting up your account...</h1>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
}

export default page;
