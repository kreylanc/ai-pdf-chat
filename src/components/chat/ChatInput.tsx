import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ChatContext } from "./ChatContext";
import { useContext, useRef } from "react";
import { text } from "stream/consumers";

type Props = {
  isDisabled?: boolean;
};

function ChatInput({ isDisabled }: Props) {
  // spread the chatcontext
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="absolute w-full bottom-0 left-0">
      <div className="flex flex-row gap-3 mx-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex flex-1 h-full items-stretch md:flex-col">
          <div className="relative w-full flex flex-col flex-grow  p-4">
            <div className="relative flex items-center gap-2">
              <Textarea
                rows={1}
                maxRows={4}
                placeholder="Enter your question..."
                autoFocus
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-green scrollbar-thumb-rounded scrollbar-w-2 scrollbar-track-green-lighter"
                disabled={isDisabled}
                ref={textareaRef}
                onKeyDown={(e) => {
                  // send message when pressed Enter
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();

                    textareaRef.current?.focus();
                  }
                }}
                onChange={handleInputChange}
                value={message}
              />
              <Button
                className="absolute right-2 bottom-1.5"
                aria-label="send message"
                disabled={isDisabled || isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  addMessage();

                  textareaRef.current?.focus();
                }}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
