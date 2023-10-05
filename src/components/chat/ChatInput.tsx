import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type Props = {
  isDisabled?: boolean;
};

function ChatInput({ isDisabled }: Props) {
  return (
    <div className="absolute w-full bottom-0 left-0">
      <form
        action=""
        className="flex flex-row gap-3 mx-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
      >
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
              />
              <Button
                className="absolute right-2 bottom-1.5"
                aria-label="send message"
                disabled={isDisabled}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
