import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isBefore } from "date-fns";
/*
 ** @todo: Remove Stripe import
 */
// import Stripe from "stripe";

/*
 ** @todo: Remove stripe
 */
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
//   apiVersion: "2023-08-16",
//   typescript: true,
// });

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    // const stripePlan = await stripe.subscriptions.retrieve(
    //   dbUser.stripeSubscriptionId
    // )
    isCanceled =
      dbUser.stripeCurrentPeriodEnd &&
      isBefore(dbUser.stripeCurrentPeriodEnd, new Date())
        ? true
        : false;
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
