"use client";
import { cn } from "@/lib/utils";
import { Check, HelpCircle, Loader, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import emailjs from "@emailjs/browser";

const MessageDialogButton = ({
  customPlan,
}: {
  customPlan: {
    plan: String;
    tagline: String;
    quota: number;
    features: { text: String; footnote?: String; negative?: String }[];
  };
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState({ error: false, msg: "" });
  const [messageError, setMessageError] = useState({ error: false, msg: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (email.trim().length <= 0) {
      toast({
        title: "Invalid input",
        description: "E-mail is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (message.trim().length <= 0) {
      toast({
        title: "Invalid input",
        description: "Message is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        body: JSON.stringify({
          email,
          message,
        }),
      });
      if (response.ok) {
        toast({
          title: "Message sent",
          description: `We will get back to you shortly via your E-mail: ${email}`,
        });

        if (formRef) {
          console.log("E-mail", formRef);
          emailjs
            .sendForm(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
              formRef.current ? formRef.current : "",
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
            )
            .then(
              (result) => {
                console.log(result.text);
              },
              (error) => {
                console.log(error.text);
              }
            );
        }
        setEmail("");
        setMessage("");
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Check your internet connection and try again",
        variant: "destructive",
      });
    } finally {
      setEmailError({
        error: false,
        msg: "",
      });
      setMessageError({
        error: false,
        msg: "",
      });
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-white shadow-lg border-2 border-teal-600 shadow-blue-200 mt-12"
      )}
    >
      <div className="p-5">
        <h3 className="my-3 text-center font-display text-3xl font-bold">
          Looking for something different?
        </h3>
        <p className="text-gray-500">{customPlan.tagline}</p>
        <p className="my-5 font-display text-6xl font-semibold">
          LET&apos;S TALK
        </p>
      </div>

      <ul className="my-10 space-y-5 px-8">
        {customPlan.features.map(({ text, footnote, negative }, i) => (
          <li key={i} className="flex space-x-5">
            <div className="flex-shrink-0">
              {negative ? (
                <Minus className="h-6 w-6 text-gray-300" />
              ) : (
                <Check className="h-6 w-6 text-blue-500" />
              )}
            </div>
            {footnote ? (
              <div className="flex items-center space-x-1">
                <p
                  className={cn("text-gray-600", {
                    "text-gray-400": negative,
                  })}
                >
                  {text}
                </p>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="cursor-default ml-1.5">
                    <HelpCircle className="h-4 w-4 text-zinc-500" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-2">
                    {footnote}
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <p
                className={cn("text-gray-600", {
                  "text-gray-400": negative,
                })}
              >
                {text}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200" />
      <div className="p-5">
        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            if (!v) {
              setIsOpen(v);
            }
          }}
        >
          <DialogTrigger onClick={() => setIsOpen(true)} asChild>
            <Button>Send us a message</Button>
          </DialogTrigger>

          <DialogContent>
            <h1 className="my-3 font-display text-2xl font-bold">
              Tell us more about what you need
            </h1>
            <form
              ref={formRef}
              onSubmit={sendMessage}
              className="flex flex-col gap-8"
            >
              <div className="grid w-full items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="from_name"
                  name="from_name"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid w-full items-center gap-4">
                <Label htmlFor="email">Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px]"
                  id="message"
                  name="message"
                  placeholder="Briefly describe what you need..."
                ></Textarea>
              </div>
              <div className="grid w-full items-center gap-4">
                <Button disabled={loading} type="submit">
                  {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MessageDialogButton;
