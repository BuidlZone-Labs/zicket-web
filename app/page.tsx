// import { Header } from "./newComponents/header"
import { HeroSection } from "./newComponents/hero-section";
import { HowItWorks } from "./newComponents/how-it-works";
import { NoSignupsSection } from "./newComponents/no-signups-section";
// import { TrendingEvents } from "./newComponents/trending-events";
import EventSlider from "./components/EventSlider";
import { PowerfulTools } from "./newComponents/powerful-tools";
import { FAQSection } from "./newComponents/faq-section";
import { HostInPeace } from "./newComponents/host-in-peace";
import { TrendingNews } from "./newComponents/trending-news";
import { QRCodeModalExample } from "./components/QRCodeModalExample";
import { TicketCancellationModalExample } from "./components/TicketCancellationModalExample";
// import { Footer } from "@/components/footer"
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#141414]">
      <HeroSection />
      <HowItWorks />
      <NoSignupsSection />
      {/* <TrendingEvents /> */}
      <EventSlider />
      <PowerfulTools />
      <FAQSection />
      <HostInPeace />
      <TrendingNews />
      {/* Modal demos - Remove after testing */}
      <div className="py-10 flex flex-wrap gap-8 justify-center">
        <QRCodeModalExample />
        <TicketCancellationModalExample />
      </div>
    </div>
  );
}
