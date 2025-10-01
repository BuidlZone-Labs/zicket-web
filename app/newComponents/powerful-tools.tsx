import Image from "next/image";
import {
  BarChart3,
  Calendar,
  Zap,
  Users,
  Settings,
  Globe,
  Lock,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { image } from "framer-motion/client";

export function PowerfulTools() {
  const tools = [
    {
      image: "/Group.svg?height=200&width=300",
      title: "Web3 & Crypto Meetups",
    },
    { image: "/Career.svg?height=200&width=300", title: "Career & Innovation" },
    { image: "Art.svg?height=200&width=300", title: "Art & Digital Culture" },
    {
      image: "/Group (1).svg?height=200&width=300",
      title: "Music & Nightlife",
    },
    {
      image: "/Wellness.svg?height=200&width=300",
      title: "Wellness & Retreats",
    },
    { image: "/Vector.svg?height=200&width=300", title: "Talks & Panels" },
    {
      image: "/Workshop.svg?height=200&width=300",
      title: "Workshops & Builder Labs",
    },
    {
      image: "/Event.svg?height=200&width=300",
      title: "Social & Underground Vibes",
    },
  ];

  return (
    <section className="py-8 lg:py-20 bg-white">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-center items-center gap-10">
        <div className="w-full">
          <h2 className="text-[24px] md:text-[40px] md:text-left text-center text-[#2C0A4A] font-bold mb-4">
            Powerful Tools for
            <br />
            Public or Private Events.
          </h2>
          <p className="text-[#6C6C6C] text-[16px] md:text-left text-center">
            Privacy-first event hosting and ticketing. Build a More Private,
            Trusted Space for your community of fans.
          </p>
          <button className="mt-16 flex border border-[#2C0A4A] md:mx-0 mx-auto rounded-full py-2 px-3 text-[#2C0A4a] cursor-pointer">
            Explore Events <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <div className="w-[110px] h-[110px] flex justify-center items-center border border-[#797979] rounded-lg shadow-md hover:shadow-lg transition-shadow mb-4">
                <Image
                  width={60}
                  height={60}
                  src={
                    typeof tool.image === "string"
                      ? tool.image
                      : "/placeholder.svg"
                  }
                  alt={tool.title}
                  className="w-[60px] h-[60px] object-cover rounded-lg"
                />
              </div>
              <h3 className="text-[11px]">{tool.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
