import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";

type MessagesProps = {
  fileId: string;
};
function Messages({ fileId }: MessagesProps) {
  // query for infinite scrolling feature
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        // start position for next fetch
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      }
    );

  // the fetched data contain an array of messages and nextcursor
  // mapping the array to get the messages array only
  const messages = data?.pages.flatMap((page) => page.messages);
  // flatMap returns single dimenson array instead of nested array with map()

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </span>
    ),
  };
  const combinedMessages = [
    ...(true ? [loadingMessage] : []), // spread loading messages else an empty array
    ...(messages ?? []), // spread the fetched messages if it exists
  ];

  console.log(combinedMessages);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-green scrollbar-thumb-rounded scrollbar-track-green-lighter scroll-bar-w-2">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          // checking if previous message and current message is from the user or not
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          if (i === combinedMessages.length - 1) {
            return (
              <Message
                isNextMessageSamePerson={isNextMessageSamePerson}
                message={message}
                key={message.id}
              />
            );
          } else {
            return (
              <Message
                isNextMessageSamePerson={isNextMessageSamePerson}
                message={message}
                key={message.id}
              />
            );
          }
        })
      ) : isLoading ? (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="text-green-500" />
          <h3 className="font-semibold text-xl">You're all set</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default Messages;
