"use client";

import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

const UpgradeButton = () => {
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url ?? "/dashboard/billing";
    },
  });

  const subscriptionPage = "https://paystack.com/pay/turnables-ai-pro";

  return (
    <Link
      href={subscriptionPage}
      className={buttonVariants({
        className: "w-full",
      })}
    >
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Link>
  );
};

export default UpgradeButton;
