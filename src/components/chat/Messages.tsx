import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { useIntersectionObserver } from "../hooks/useIntersectionObeserver";

type MessagesProps = {
  fileId: string;
};
function Messages({ fileId }: MessagesProps) {
  const { isLoading: isLoadingAI } = useContext(ChatContext);
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
    ...(isLoadingAI ? [loadingMessage] : []), // spread loading messages else an empty array
    ...(messages ?? []), // spread the fetched messages if it exists
  ];

  // ========= for infinite scrolling

  // observing if the user has scrolled to the last message
  const containerRef = useRef<HTMLDivElement | null>(null); // containing div for obeserver root
  const lastMessageRef = useRef<HTMLDivElement | null>(null); // the last div that has been loaded
  const entry = useIntersectionObserver(lastMessageRef, {
    root: containerRef.current,
  });

  useEffect(() => {
    const isVisible = !!entry?.isIntersecting; // true if user reached the ref element

    if (isVisible) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <div
      ref={containerRef}
      className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-green scrollbar-thumb-rounded scrollbar-track-green-lighter scrollbar-w-2"
    >
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          // checking if previous message and current message is from the user or not
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          if (i === combinedMessages.length - 1) {
            // for the last message pass a ref to observe intersection point
            return (
              <Message
                ref={lastMessageRef}
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
          <h3 className="font-semibold text-xl">You&apos;re all set</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default Messages;
