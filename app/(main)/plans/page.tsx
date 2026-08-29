import React from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For organizers hosting occasional private events.",
    features: ["Up to 50 attendees", "Anonymous browsing", "Basic email invites"],
  },
  {
    name: "Pro",
    price: "$29/mo",
    description: "For organizers running events regularly.",
    features: ["Unlimited attendees", "Priority verification", "Custom branding", "Analytics dashboard"],
  },
  {
    name: "Enterprise",
    price: "Contact us",
    description: "For organizations with advanced privacy needs.",
    features: ["Dedicated support", "Custom integrations", "SLA guarantees"],
  },
];

export default function PlansPage() {
  return (
    <div className="bg-white dark:bg-[#0D0D0D] min-h-screen py-12 lg:py-20 px-8 md:px-12 lg:px-30">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-[#1E1E1E] dark:text-white text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
          Plans &amp; Pricing
        </h1>
        <p className="mt-3 text-center font-medium text-[#1E1E1E] dark:text-gray-300 max-w-2xl mx-auto">
          Choose the plan that fits how you host events on Zicket.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border border-[#E4E4E4] dark:border-gray-700 rounded-2xl p-8 flex flex-col"
            >
              <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-white">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-[#6917AF] dark:text-[#D7B5F5]">{plan.price}</p>
              <p className="mt-3 text-sm text-[#1E1E1E] dark:text-gray-300">{plan.description}</p>
              <ul className="mt-6 space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-[#1E1E1E] dark:text-gray-300">
                    • {feature}
                  </li>
                ))}
              </ul>
              
                href="/auth/login"
                className="mt-8 text-center px-6 py-3 border border-[#8F37DA] bg-gradient-to-b from-[#5E4BF3] to-[#9109D0] text-white rounded-full font-bold"
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
