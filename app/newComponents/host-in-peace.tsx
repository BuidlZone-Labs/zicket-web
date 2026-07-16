import { ArrowUpRight } from "lucide-react";
export function HostInPeace() {
  return (
    <section className="py-8 lg:py-20 bg-white dark:bg-[#141414]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-[30px] md:text-[40px] text-[#2C0A4A] dark:text-[#D7B5F5] font-bold mb-4">
          Host in Peace. No
          <br />
          Spreadsheets or Stalkers.
        </h2>
        <p className="text-[#6C6C6C] text-[16px] mb-8">
          Zicket gives creators and organizers tools to launch, ticket, <br />
          and manage events without compromising guest privacy.
        </p>
        <button className="flex mx-auto border border-[#2C0A4A] dark:border-[#D7B5F5] rounded-full py-2 px-3 text-[#2C0A4a] dark:text-[#D7B5F5] cursor-pointer">
          Host An Event <ArrowUpRight className="w-5 h-5"/>
        </button>
      </div>
    </section>
  );
}
