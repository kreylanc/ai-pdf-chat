import ChatWrapper from "@/components/chat/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};
async function page({ params }: Props) {
  const { slug } = params;

  const { getUser } = getKindeServerSession();
  const user = getUser();

  // validate if user is signed in.
  // redirect to auth-callback
  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${slug}`);

  const file = await db.file.findFirst({
    where: {
      id: slug,
      userId: user.id,
    },
  });

  if (!file) notFound();
  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] justify-content">
      <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2">
        {/* left side i.e. the pdf file display*/}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>
        {/* Right side i.e. the chat  */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-t-0 lg:border-l">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </main>
  );
}

export default page;
