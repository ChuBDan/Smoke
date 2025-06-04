import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/Home/HomePage";
import Doctors from "@/pages/Doctors/Doctors";
import AboutUs from "@/common/About";
import Contact from "@/common/Contact";
import LoginForm from "@/features/auth/components/LoginForm";
import MyProfile from "@/features/auth/components/pages/UserProfile";
import MyAppointments from "@/pages/Appointments/Appointments";
const routes = (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/doctors" element={<Doctors />} />
    <Route path="/doctors/:speciality" element={<Doctors />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/login" element={<LoginForm />} />
    <Route path="/profile" element={<MyProfile/>} />
    <Route path="/my-appointments" element={<MyAppointments/>} />
  </Routes>
);
export default routes;
