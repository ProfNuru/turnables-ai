import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { reference: string };
}) => {
  const transactionReference = searchParams.reference;

  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${transactionReference}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // notice the Bearer before your token
        },
      }
    );
    const transaction = await response.json();

    if (transaction.status && transaction.data.status === "success") {
      const subscription = {
        plan: transaction.data.plan,
        date_paid: transaction.data.transaction_date,
        email: transaction.data.customer.email,
        first_name: transaction.data.customer.first_name,
        last_name: transaction.data.customer.last_name,
        user_id: dbUser.id,
        payment_method: transaction.data.channel,
        payment_page: transaction.data.metadata.referrer,
        amount: transaction.data.amount,
        customer_id: transaction.data.customer.id,
        subscription_id: transaction.data.plan_object.id,
      };

      //   Create subscription

      // Update user's current subscription end date
    }

    console.log("Transaction:", transaction);
  } catch (error) {
    console.log("Transaction error:", error);
  }

  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
