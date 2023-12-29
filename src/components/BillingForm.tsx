"use client";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import { useToast } from "./ui/use-toast";
import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
// import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import UpgradeButton from "./UpgradeButton";
import { PLANS } from "@/config/stripe";
import { Copy, Loader } from "lucide-react";
import { useState } from "react";

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
  userKey?: string | null;
  files?: any[];
}

const BillingForm = ({
  subscriptionPlan,
  userKey,
  files,
}: BillingFormProps) => {
  const [generatingAPI, setGeneratingAPI] = useState(false);
  const [apiKey, setApiKey] = useState<String | null>(userKey || null);
  const { toast } = useToast();

  const generateNewApiKey = async () => {
    setGeneratingAPI(true);
    try {
      const response = await fetch("/api/generate_api_key");
      if (!response.ok) {
        setGeneratingAPI(false);
        return toast({
          title: "There was a problem generating your API key. ",
          description:
            "Please report this problem to the admin at admin@turnables-ai.com",
          variant: "destructive",
        });
      }
      const key = await response.json();
      setApiKey(key.key);
    } catch (error) {
      return toast({
        title: "There was a problem generating your API key. ",
        description: "Check your network and try again",
        variant: "destructive",
      });
    } finally {
      setGeneratingAPI(false);
    }
  };

  const copyApiKey = (txt: String | null) => {
    if (txt) {
      const k = `${txt}`;
      navigator.clipboard.writeText(k);
      toast({
        title: "Copied",
      });
    }
  };

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12 flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the{" "}
              <strong>
                {subscriptionPlan.isSubscribed
                  ? // @ts-ignore
                    subscriptionPlan.name.toLowerCase() === "pro+"
                    ? "PRO PLUS"
                    : "PRO"
                  : "FREE"}
              </strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            {!subscriptionPlan.isSubscribed && (
              <UpgradeButton
                planLink={PLANS.find((p) => p.slug === "pro")?.paymentLink}
              />
            )}

            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {"Your plan expires on "}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
        <UpgradeButton
          text="Extend subscription by 1 month"
          planLink={PLANS.find((p) => p.slug === "pro")?.paymentLink}
        />
      </form>
    </MaxWidthWrapper>
  );
};

export default BillingForm;
