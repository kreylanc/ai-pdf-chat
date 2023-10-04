"use client";

import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { pdfjs } from "react-pdf";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

type PdfRendererProps = {
  url: string;
};

function PdfRenderer({ url }: PdfRendererProps) {
  const { toast } = useToast();

  const [totalPage, setTotalPage] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);

  // Zod validation for input field
  const PageInputValidator = z.object({
    page: z
      .string()
      // input received is ofc in String, so converting it to a Number and comparing
      .refine((num) => Number(num) > 0 && Number(num) <= totalPage!, {
        message: "Invalid page number",
      }),
  });
  // extract the zod schema into a Typescript
  type TPageInputValidator = z.infer<typeof PageInputValidator>;

  // ========= React Hook Form ===========
  // pass the type to the useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TPageInputValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(PageInputValidator),
  });

  // to resize the pdf element
  const { width, ref } = useResizeDetector();

  // function will only run if the input passes the validation scheme
  const handlePageSubmit = ({ page }: TPageInputValidator) => {
    setCurrentPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* Top Menu Bar for functionalities*/}
      <div className="h-14 w-full border-b border-stone-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          {/* button to decrease page number */}
          <Button
            disabled={currentPage <= 1}
            aria-label="previous page"
            variant="ghost"
            onClick={() => {
              // decrease page only if it is greater than 1
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
            }}
          >
            <ChevronUp size={16} />
          </Button>
          {/* Field for user to input page number */}
          <div className="flex items-center text-stone-700 gap-2">
            <Input
              {...register("page")}
              type="number"
              max={totalPage}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <span className="">/</span>
            <span>{totalPage ?? "x"}</span>
          </div>
          {/* button to increase page number */}
          <Button
            disabled={totalPage === undefined || currentPage === totalPage}
            aria-label="next page"
            variant="ghost"
            onClick={() => {
              // increase page only if it is not greater than total page number
              setCurrentPage((prev) =>
                prev + 1 > totalPage! ? totalPage! : prev + 1
              );
            }}
          >
            <ChevronDown size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <div ref={ref}>
          <Document
            file={url}
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
            <Page width={width ? width : 1} pageNumber={currentPage} />
          </Document>
        </div>
      </div>
    </div>
  );
}

export default PdfRenderer;
