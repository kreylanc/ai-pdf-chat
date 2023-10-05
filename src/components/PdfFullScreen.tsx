import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ExpandIcon, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";
import { useToast } from "./ui/use-toast";

type PdfFullscreenProps = {
  fileUrl: string;
};

function PdfFullScreen({ fileUrl }: PdfFullscreenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [totalPage, setTotalPage] = useState<number>(); // total number of pages in the document

  const { width, ref } = useResizeDetector();

  const { toast } = useToast();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
        asChild
      >
        <Button variant="ghost" aria-label="fullscreen">
          <ExpandIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              file={fileUrl}
              className="max-h-full"
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 animate-spin" />
                </div>
              }
              onLoadSuccess={({ numPages }) => {
                setTotalPage(numPages);
              }}
              onLoadError={() => {
                toast({
                  description: "Error loading PDF",
                  variant: "destructive",
                });
              }}
            >
              {/* create array with length of totalPages, fill all position with 0 as the value is not important and only using to map
               */}
              {new Array(totalPage).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}

export default PdfFullScreen;
