import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import ClubsSection from "@/components/ClubsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <EventsSection />
      <ClubsSection />
      <Footer />
    </div>
  );
};

export default Index;
