import { Outlet } from "react-router-dom";
import Navbar from "@/common/Navbar";
import Footer from "@/common/Footer";

const MainLayout = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
