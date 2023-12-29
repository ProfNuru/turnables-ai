"use client";

import { ArrowRight } from "lucide-react";
import { buttonVariants } from "./ui/button";
// import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

const UpgradeButton = ({
  planLink,
  text,
}: {
  planLink: string | null | undefined;
  text?: string;
}) => {
  return (
    <Link
      href={"#"}
      className={buttonVariants({
        className: "w-full",
      })}
    >
      {text ? text : "Coming soon"} <ArrowRight className="h-5 w-5 ml-1.5" />
    </Link>
  );
};

export default UpgradeButton;
