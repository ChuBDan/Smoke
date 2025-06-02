import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/Home/HomePage";
import Doctors from "@/pages/Doctors/Doctors";
const routes = (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/doctors" element={<Doctors />} />
    <Route path="/doctors/:speciality" element={<Doctors />} />
  </Routes>
);
export default routes;
