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
// import { Footer } from "@/components/footer"
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f6f0fb]">
      <HeroSection />
      <HowItWorks />
      <NoSignupsSection />
      {/* <TrendingEvents /> */}
      <EventSlider />
      <PowerfulTools />
      <FAQSection />
      <HostInPeace />
      <TrendingNews />
      
      {/* QR Code Modal Test - Remove after testing */}
      <div className="py-10">
        <QRCodeModalExample />
      </div>
    </div>
  );
}
