import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

async function page() {
  // get user data from Kinde
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // check if user already exists
  // redirect user to auth-callback page with parameter of origin=dashboard to navigate back to dashboard
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  // query to fetch the user with the same id as Kinde's id in the database
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });
  // if no user redirect to auth-callback page
  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard subscriptionPlan={subscriptionPlan}></Dashboard>;
}

export default page;
