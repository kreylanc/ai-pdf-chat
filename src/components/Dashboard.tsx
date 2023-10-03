"use client";
import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";

function Dashboard() {
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  /*   hook to manage the cached data
        using it to invalidate the query when a file is deleted
        so the UI gets refreshed automatically with new queried data
    */
  const utils = trpc.useContext();

  /*  to call getUserFiles API to fetch all the files in the DB
    rename the returned data to 'files, isLoading from react-query 
  */
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  // to call the delateFile API
  // rename the mutate to deleteFile
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      // when the file is deleted the getUserFiles query is marked invalidated
      // and the data is fetched again
      utils.getUserFiles.invalidate();
    },
    // when the action is happening set the deletingFile value to the file id
    // this is to reference the id and display a loader for the UI matching ID
    onMutate: ({ id }) => {
      setDeletingFile(id);
    },
    // when the action is finished set back to null
    onSettled: () => {
      setDeletingFile(null);
    },
  });
  return (
    <main className="mx-auto max-w-7xl px-2 md:p-10">
      <div className="mt-8 flex flex-col gap-2 items-start justify-between md:flex-row">
        <h1 className="font-bold text-5xl lg:text-6xl mb-3">My Files</h1>
        <UploadButton></UploadButton>
      </div>

      {/* Display all the files user has uploaded */}
      {files && files.length !== 0 ? (
        <ul className="grid grid-cols-1 mt-8 divide-y divide-zinc-200 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* first sort the array using the createdAt datetime value
           * if value is +ve, a gets replaced by b
           * if -ve, a remains in the same position
           */}
          {files
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            // after the array is sorted according to created Date map the new array
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 items-center bg-white divide-y divide-gray-200 rounded-lg shadow transition hover:shadow-md"
              >
                <Link href={`/dashboard/${file.id}`} className="flex gap-2">
                  <div className="flex py-4 px-6 w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                    <h2 className="flex-1 truncate text-lg font-medium space-x-3">
                      {file.name}
                    </h2>
                  </div>
                </Link>

                <div className="grid grid-cols-3 px-6 place-items-center py-2 text-sm">
                  <div className="flex gap-2 items-center">
                    <Plus size={16} />
                    <p>
                      {/* Format: Sep 2023 */}
                      {new Date(file.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <MessageSquare size={16} />
                    Message
                  </div>
                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size="sm"
                    variant="destructive"
                    className="w-full"
                  >
                    {/* if the state value matches file id display a spinning loader instead */}
                    {deletingFile === file.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash size={16} />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        // if there are no files in the DB show this UI
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-stone-800" />
          <h2 className="font-semibold text-xl">
            You haven't uploaded any files yet.
          </h2>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
