import Image from "next/image";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* HERO Section */}
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <h1 className="max-w-4xl text-5xl font-bold mt-6 lg:text-6xl">
          Chat with your <span className="text-green-600">documents</span> in
          seconds
        </h1>
        <p className="mt-6 max-w-prose text-stone-700 sm:text-lg">
          PDF Chat Bot allows you to have conversations with your PDF documents.
          Simply upload your file and start asking questions right away.
        </p>
        <Link
          className={buttonVariants({ size: "lg", className: "mt-4" })}
          href="/"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>

      {/* Product Showcase Section */}
      <section>
        <div className="relative isolate">
          {/* Gradient blob in the background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          {/* Product Image */}
          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src="/dashboard-preview.jpg"
                    width={1364}
                    height={866}
                    quality={100}
                    alt="product preview"
                    className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Stacking Gradient blob in the background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="font-semibold text-3xl md:text-4xl">
              Start chatting in minutes
            </h2>
            <p className="mt-4 text-stone-700">
              Chatting to your PDF files has been easier with PDF Chat Bot
            </p>
          </div>
        </div>

        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0 md:px-6">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 pl-4 border-gray-300 border-l-4 md:border-l-0 md:border-t-2 md:pt-4 md:pl-0">
              <span className="text-sm text-green-600">Step 1</span>
              <strong className="text-xl font-semibold">
                Sign up for an account
              </strong>
              <span>
                Either starting out with a free plan or choose our{" "}
                <Link href="/pricing" className="underline text-blue-600">
                  pro plan
                </Link>
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 pl-4 border-gray-300 border-l-4 md:border-l-0 md:border-t-2 md:pt-4 md:pl-0">
              <span className="text-sm text-green-600">Step 2</span>
              <strong className="text-xl font-semibold">
                Upload your PDF file
              </strong>
              <span>
                We&apos;ll process your file and make it ready for you to chat
                with
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 pl-4 border-gray-300 border-l-4 md:border-l-0 md:border-t-2 md:pt-4 md:pl-0">
              <span className="text-sm text-green-600">Step 3</span>
              <strong className="text-xl font-semibold">
                Start asking questions
              </strong>
              <span>
                It&apos;s that simple. Try out today- it really takes less than
                a minute.
              </span>
            </div>
          </li>
        </ol>
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src="/file-upload-preview.jpg"
                width={1419}
                height={732}
                quality={100}
                alt="uploading document preview"
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
