"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

// Component for handing file dropzone
const UploadDropzone = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // destructure object
  const { startUpload } = useUploadThing("pdfUploader");

  // shadcn toaster hook
  const { toast } = useToast();

  // API to fetch the file
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  /* ===== Function that simulates the progress bar is increasing
   * ===== User Feedback purpose only
   */
  const startSimulatedProgress = () => {
    // to start the progress from zero everytime
    setUploadProgress(0);

    // repeat the function every 500ms and increase upload progress by 5
    // only until the file has not finished uploading
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        // if not finished uploading and progress has reached 95, stop the interval
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    return interval;
  };

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        // * Function that runs when user uploads a file
        setIsUploading(true);
        const progressInterval = startSimulatedProgress();

        // ============ Handle file upload ==============

        // ======= Call the API to upload PDF to the storage
        const res = await startUpload(acceptedFile);
        // console.log(permittedFileInfo?.config.pdf?.maxFileSize);

        // if no response then throw a toast alert
        if (!res) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        // destructure array
        const [fileResponse] = res;

        // return null if key property does not exist
        const key = fileResponse?.key;

        if (!key) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        // pass the key from the file uploaded
        startPolling({ key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <section
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-stone-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center gap-2"
            >
              <div className="flex flex-col items-center gap-2">
                <Cloud className="text-stone-700" />
                <p>
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className="text-sm text-stone-700">PDF (up to 4MB)</p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-sm bg-white flex items-center rounded-md overflow-hidden outline-1 outline-zinc-200 divide-x-2 divide-zinc-200 mt-2">
                  <div className="px-4 py-2 h-full grid place-items-center">
                    <File size={16} className="text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full max-w-sm mt-4 mx-auto">
                  <Progress
                    indicatorColor={uploadProgress === 100 ? "bg-blue-500" : ""}
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-300"
                  />

                  {uploadProgress === 100 ? (
                    <div className="flex gap-2 items-center justify-center mt-2 text-sm text-stone-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Redirecting...</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </section>
      )}
    </Dropzone>
  );
};

function UploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
}

export default UploadButton;
