"use client";

import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ticketSchema } from "@/lib/validations/ticket-schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FormValues = z.infer<typeof ticketSchema>;

const TicketInfo = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(ticketSchema) as any,

    defaultValues: {
      name: "",
      age: 0,
      eventId: "",

      txHash: null,
      txStatus: "idle",
      txUpdatedAt: null,
      txError: null,
      ticketId: null,
      pricePaid: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form Data:", data);

    form.reset();
    alert("Ticket booked successfully!");
  };

  const eventType = "FREE";

  return (
    <section className="border lg:w-3/5 border-[#E9E9E9] rounded-md p-4">
      <h1 className="text-2xl mb-8 font-semibold text-[#1F1F1F] pb-4 border-b border-[#E9E9E9]">
        Ticket Info
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 mt-6"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#7D7D7D] font-medium pb-1">
                  Enter your name
                </FormLabel>
                <FormControl>
                  <Input placeholder="E.g John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#7D7D7D] font-medium pb-1">
                  Your age
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="E.g 18"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Footer */}
          <footer className="space-y-6 mt-8">
            <div className="rounded-full py-3 px-5 flex items-center gap-3 bg-[#F2FFF2]">
              <Image
                src="/warning.svg"
                alt="warning"
                height={14}
                width={14}
              />

              <p className="font-medium text-xs text-[#0ABA2A]">
                Secure and instant payment
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="rounded-full w-full flex items-center justify-center gap-2"
            >
              <Image
                src="/security-password.svg"
                alt="secure password"
                height={20}
                width={20}
              />

              {eventType === "FREE"
                ? "Verify & Attend"
                : "Connect wallet to purchase"}
            </Button>
          </footer>
        </form>
      </Form>
    </section>
  );
};

export default TicketInfo;