import BillingForm from "@/components/BillingForm";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { addDays, addMonths, isBefore } from "date-fns";
import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const Page = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { reference: string };
}) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
    include: {
      File: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  const transactionReference = searchParams.reference;

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${transactionReference}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
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
        customer_id: transaction.data.customer.id.toString(),
        subscription_id: transaction.data.plan_object.id.toString(),
        transaction_reference: transactionReference,
      };

      //   Create subscription
      const newSubscription = await db.subscription.create({
        data: subscription,
      });

      // Set 1 month + 1 full day subscription
      const prevSubscriptionEnd = dbUser.stripeCurrentPeriodEnd;
      const newSubscriptionEndDate =
        prevSubscriptionEnd && isBefore(prevSubscriptionEnd, new Date())
          ? addDays(addMonths(new Date(), 1), 1)
          : prevSubscriptionEnd
          ? addDays(addMonths(prevSubscriptionEnd, 1), 1)
          : addDays(addMonths(new Date(), 1), 1);

      await db.user.update({
        where: {
          id: newSubscription.user_id,
        },
        data: {
          stripePriceId: newSubscription.plan,
          stripeCustomerId: newSubscription.customer_id.toString(),
          stripeSubscriptionId: newSubscription.plan,
          stripeCurrentPeriodEnd: newSubscriptionEndDate,
        },
      });
    }
  } catch (error) {
    console.log("No transaction:", error);
  }

  const subscriptionPlan: any = await getUserSubscriptionPlan();

  return (
    <BillingForm
      subscriptionPlan={subscriptionPlan}
      userKey={dbUser.apiKey}
      files={dbUser.File}
    />
  );
};

export default Page;
