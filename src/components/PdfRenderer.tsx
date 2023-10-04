"use client";

import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { pdfjs } from "react-pdf";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullScreen from "./PdfFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

type PdfRendererProps = {
  url: string;
};

function PdfRenderer({ url }: PdfRendererProps) {
  const { toast } = useToast();

  // declare useStates
  const [totalPage, setTotalPage] = useState<number>(); // total number of pages in the document
  const [currentPage, setCurrentPage] = useState(1); // current page user is at
  const [scale, setScale] = useState(1); // zoom scale of the document
  const [rotate, setRotate] = useState(0); // rotation value of the document
  const [renderedScale, setRenderedScale] = useState<number | null>(null); // currently rendered value of the PDF

  // if rendered value doesnt match with zoom scale that means the page is loading/re-rendering to zoom
  const isLoading = renderedScale !== scale;

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
        {/* Change page section */}
        <div className="flex items-center gap-1.5">
          {/* button to decrease page number */}
          <Button
            disabled={currentPage <= 1}
            aria-label="previous page"
            variant="ghost"
            onClick={() => {
              // decrease page only if it is greater than 1
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              // state updates arent immediate so still need to subtract
              setValue("page", String(currentPage - 1));
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
              setValue("page", String(currentPage + 1));
            }}
          >
            <ChevronDown size={16} />
          </Button>
        </div>
        {/* Zoom in/out */}
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" variant="ghost" aria-label="zoom">
                <Search size={18} />
                {scale * 100}%
                <ChevronDown size={14} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            aria-label="rotate 90 degree"
            onClick={() => setRotate((prev) => prev + 90)}
          >
            <RotateCw size={16} />
          </Button>

          <PdfFullScreen fileUrl={url} />
        </div>
      </div>

      {/* Section to render PDF  */}
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              {/* to fix the filckering white screen when pdf is zoomed in/out */}
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currentPage}
                  scale={renderedScale}
                  rotate={rotate}
                  key={"@" + renderedScale}
                />
              ) : null}
              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotate}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

export default PdfRenderer;
