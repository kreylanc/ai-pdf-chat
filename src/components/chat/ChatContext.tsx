import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  // default values for context
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

type Props = {
  fileId: string;
  children: ReactNode;
};
export const ChatContextProvider = ({ fileId, children }: Props) => {
  // declare useStates for message and loading state
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useContext();
  //   toast hook from shadcn
  const { toast } = useToast();

  const backupMessage = useRef("");

  // API endpoint using react-query mutation to POST message
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const res = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      return res.body;
    },
    onMutate: async ({ message }) => {
      // for optimistic update; as soon as the message is sent provide feedback
      // keeping track of the message if any error occurs
      backupMessage.current = message;
      setMessage(""); // clearing the state and message from the input field

      // cancel any other outgoing refetches
      await utils.getFileMessages.cancel();

      // get all cached data from the current infinite query
      const previousMessage = utils.getFileMessages.getInfiniteData();

      // update the cached data with new value for the feedback
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (data) => {
          if (!data) {
            // if there's no data return the object that react-query expects
            return {
              pages: [],
              pageParams: [],
            };
          }
          // spread the existing data
          let newPages = [...data.pages];

          // all the message object are stored in the first index
          /* Eg:
            [
              messages: [{}, {}]
            ]
          */
          let latestPage = newPages[0]!;

          // directly update the array with the new input message from the user
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            // and spread the rest of the messages
            ...latestPage.messages,
          ];

          // update the main array with the updated array
          newPages[0] = latestPage;

          return {
            ...data,
            pages: newPages,
          };
        }
      );

      setIsLoading(true);

      return {
        previousMessage:
          previousMessage?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      // ========= handling the AI response ============
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulated respone
      let accResponse = "";

      // read the stream
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkValue = decoder.decode(value);
        accResponse += chunkValue;

        // append the chunk to the cached data
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (data) => {
            if (!data) {
              return {
                pages: [],
                pageParams: [],
              };
            }
            // check if the last message is from the AI
            let isAIResponseCreated = data.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );

            // updating the pages with the response from AI for realtime text streaming
            let updatedPages = data.pages.map((page) => {
              // matches with the first index (the newest msg)
              if (page === data.pages[0]) {
                let updatedMessage;

                if (!isAIResponseCreated) {
                  // if its the first response from AI, append an object with new data
                  updatedMessage = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  // if the AI has already responded, append on it
                  updatedMessage = page.messages.map((message) => {
                    // map through the messages and find the
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }
                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessage,
                };
              }

              return page;
            });

            return { ...data, pages: updatedPages };
          }
        );
      }
    },
    onError: (_, __, context) => {
      // set message to the one backed up during onMutation
      setMessage(backupMessage.current);
      // roll back to previous messages
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessage ?? [] }
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      // invalidate the query wether the query failed or succeed to get the new data always
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
