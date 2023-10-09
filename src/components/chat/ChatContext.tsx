import { ReactNode, createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";

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

  //   toast hook from shadcn
  const { toast } = useToast();

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
