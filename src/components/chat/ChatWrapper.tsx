"use client";

import { trpc } from "@/app/_trpc/client";
import Messages from "./Messages";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import ChatInput from "./ChatInput";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

type ChatWrapperProps = {
  fileId: string;
};

function ChatWrapper({ fileId }: ChatWrapperProps) {
  // query to fetch file upload status
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      id: fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );

  if (isLoading) {
    return (
      <div className="relative min-h-full bg-zinc-50 w-full items-center justify-center flex flex-col divide-y divide-zinc-200">
        <div className="flex flex-col justify-center items-center gap-1.5 mb-28">
          <Loader2 className="animate-spin text-green-500" size={28} />
          <h2 className="font-semibold text-xl ">Loading...</h2>
          <p className="text-zinc-700 text-sm">We are preparing your PDF.</p>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  }
  if (data?.status === "PROCESSING") {
    return (
      <div className="relative min-h-full bg-zinc-50 w-full items-center justify-center flex flex-col divide-y divide-zinc-200">
        <div className="flex flex-col justify-center items-center gap-1.5 mb-28">
          <Loader2 className="animate-spin text-green-500" size={28} />
          <h2 className="font-semibold text-xl ">Processing PDF...</h2>
          <p className="text-zinc-700 text-sm">This won&apos;t take long.</p>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  }

  if (data?.status === "FAILED") {
    return (
      <div className="relative min-h-full bg-zinc-50 w-full items-center justify-center flex flex-col divide-y divide-zinc-200">
        <div className="flex flex-col justify-center items-center gap-1.5 mb-28">
          <XCircle className="text-red-500" size={28} />
          <h2 className="font-semibold text-xl ">Error loading PDF...</h2>
          <p className="text-zinc-700 text-sm">
            Your <span className="font-semibold">free</span> plan doesn&apos;t
            support.
          </p>
          <Link
            className={buttonVariants({
              variant: "link",
              size: "sm",
              className: "mt-4",
            })}
            href="/dashboard"
          >
            <ChevronLeft size={16} className="mr-1.5" />
            Return Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex flex-1 flex-col justify-between mb-28">
          <Messages fileId={fileId} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
}

export default ChatWrapper;
