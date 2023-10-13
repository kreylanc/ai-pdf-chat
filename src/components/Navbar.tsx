import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";

function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  return (
    <nav className="sticky h-14 inset-x-0 top-0 w-full z-30 bg-white/75 drop-shadow-sm backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="flex font-semibold z-40">
            PDF Chat Bot
          </Link>

          <MobileNav isAuth={!!user} />
          <ul className="hidden items-center gap-4 sm:flex">
            {!user ? (
              <>
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
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <UserAccountNav
                    email={user.email ?? ""}
                    name={
                      !user.given_name || !user.family_name
                        ? "Your Account"
                        : `${user.given_name} ${user.family_name}`
                    }
                    imageUrl={user.picture ?? ""}
                  />
                </li>
              </>
            )}
          </ul>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}

export default Navbar;
