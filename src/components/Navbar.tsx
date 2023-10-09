import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";

function Navbar() {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 w-full z-30 bg-white/75 drop-shadow-sm backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            PDF Chat Bot
          </Link>
          <ul className="hidden items-center gap-4 sm:flex">
            <li>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Pricing
              </Link>
            </li>
            <li>
              <LoginLink
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </LoginLink>
            </li>
            <li>
              <RegisterLink className={buttonVariants({ size: "sm" })}>
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </RegisterLink>
            </li>
          </ul>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}

export default Navbar;
