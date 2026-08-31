import dynamic from "next/dynamic";
import { HeroSection } from "../newComponents/hero-section";
import { HowItWorks } from "../newComponents/how-it-works";
import { NoSignupsSection } from "../newComponents/no-signups-section";
import { PowerfulTools } from "../newComponents/powerful-tools";
import { FAQSection } from "../newComponents/faq-section";
import { HostInPeace } from "../newComponents/host-in-peace";
import EventSliderSkeleton from "../components/EventSliderSkeleton";
import { TrendingNewsSkeleton } from "../newComponents/trending-news-skeleton";

const EventSlider = dynamic(() => import("../components/EventSlider"), {
  loading: () => <EventSliderSkeleton />,
});

const TrendingNews = dynamic(
  () => import("../newComponents/trending-news").then((mod) => mod.TrendingNews),
  {
    loading: () => <TrendingNewsSkeleton />,
  }
);

const QRCodeModalExample = dynamic(
  () => import("../components/QRCodeModalExample").then((mod) => mod.QRCodeModalExample)
);

const TicketCancellationModalExample = dynamic(
  () =>
    import("../components/TicketCancellationModalExample").then(
      (mod) => mod.TicketCancellationModalExample
    )
);
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
