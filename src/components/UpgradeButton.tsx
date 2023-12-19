"use client";

import { ArrowRight } from "lucide-react";
import { buttonVariants } from "./ui/button";
// import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

const UpgradeButton = () => {
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
