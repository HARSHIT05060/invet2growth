import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import MobileTabBar from "@/components/layout/MobileTabBar";
import MaintenanceGate from "@/components/layout/MaintenanceGate";
import AlertWatcher from "@/components/market/AlertWatcher";

export default function SiteLayout({ children }) {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <MaintenanceGate>{children}</MaintenanceGate>
      </main>
      <Footer />
      <MobileTabBar />
      <AlertWatcher />
    </>
  );
}
