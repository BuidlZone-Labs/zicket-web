"use client";

import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

export function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const faqs = [
    {
      question: "What makes Zicket unique?",
      answer:
        "Zicket is a privacy-first event platform built for fans. It lets you discover and attend events anonymously, while keeping your personal data secure. You only share what you choose.",
    },
    {
      question: "Do I need an account to get tickets?",
      answer:
        "No account required! You can browse and purchase tickets anonymously. We only collect the minimum information needed to deliver your tickets securely.",
    },
    {
      question: "Is my identity hidden when I attend events?",
      answer:
        "Yes, your personal identity remains private. Event organizers only receive the necessary information to verify your ticket, not your personal details.",
    },
    {
      question: "What kind of events are on Zicket?",
      answer:
        "Zicket hosts a wide variety of events including concerts, festivals, sports events, comedy shows, theater performances, and exclusive fan meetups.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section id="faqs" className="py-8 lg:py-20" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold mb-4 text-[#2C0A4A] dark:text-[#D7B5F5]">FAQs</h2>
          <p className="text-[#6C6C6C] text-[16px]">
            Everything you need to know about using Zicket—how it works, what
            makes it private, and how you can join or host your next event.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="p-6 transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex justify-between items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2 rounded-md"
                aria-expanded={openItem === index}
                aria-controls={`faq-panel-${index}`}
                id={`faq-trigger-${index}`}
              >
                <h3 className="font-semibold text-[#121212] dark:text-[#D7B5F5] text-[20px]">{faq.question}</h3>
                {openItem === index ? (
                  <span className="flex items-center bg-[#6917AF] rounded-full p-1" aria-hidden="true">
                    <Minus className="w-5 h-5 text-white transition-transform duration-200" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex items-center bg-[#6917AF] rounded-full p-1" aria-hidden="true">
                    <Plus className="w-5 h-5 text-white transition-transform duration-200" aria-hidden="true" />
                  </span>
                )}
              </button>
              {openItem === index && (
                <div id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-trigger-${index}`} className="overflow-hidden border-t py-6">
                  <p className="text-[#121212] dark:text-[#D7B5F5] text-[16px] animate-in slide-in-from-top-2 duration-200">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="mt-16 mx-auto flex border border-[#2C0A4A] dark:border-[#D7B5F5] rounded-full py-2 px-3 text-[#2C0A4a] dark:text-[#D7B5F5] cursor-pointer">
            View More <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
