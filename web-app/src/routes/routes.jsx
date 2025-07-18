import { Route, Routes } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/Home/HomePage";
import SmokingCessation from "@/pages/SmokingCessation/SmokingCessation";
import AboutUs from "@/common/About";
import Contact from "@/common/Contact";
import LoginForm from "@/features/auth/components/LoginForm";
import MyProfile from "@/features/auth/components/pages/UserProfile";
import PaymentHistory from "@/pages/Appointments/PaymentHistory";
import NotFound from "@/pages/NotFound";
import MembershipPage from "@/pages/Membership/Membership";
import SmokingStatusForm from "@/pages/SmokingStatusForm/SmokingStatusForm";

// Admin Pages
import DashboardPage from "@/pages/Admin/DashboardPage";
import UsersPage from "@/pages/Admin/UsersPage";
import BadgesPage from "@/pages/Admin/BadgesPage";
import PackagesPage from "@/pages/Admin/PackagesPage";
import AdminLoginPage from "@/pages/Admin/AdminLoginPage";
import { PaymentHistoryPage } from "@/features/admin/components";

// User Management Pages
import {
  MembersPage,
  CoachesPage,
  AdminsPage,
} from "@/features/admin/components";

// Coach Pages
import CoachLayout from "@/layouts/CoachLayout";
import CoachDashBoard from "@/pages/Coach/CoachesDBPage/CoachDashBoard";
import SmokingCessationProgress from "@/pages/SmokingCessationProgress/SmokingCessationProgress";
import VNPayReturn from "@/pages/VNPay/VNPayReturn";
import CoachMemberPlan from "@/pages/Coach/Plan/CoachMemberPlan";

const routes = (
  <Routes>
    {/* Main Application Routes with Navbar and Footer */}
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutUs />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<LoginForm />} />
      <Route path="profile" element={<MyProfile />} />
      <Route path="paymenthistory" element={<PaymentHistory />} />
      <Route path="membership" element={<MembershipPage />} />
      <Route path="smokingstatusform" element={<SmokingStatusForm />} />
      <Route path="smokingcessation" element={<SmokingCessation />} />
      <Route path="smokingprogress" element={<SmokingCessationProgress />} />
      <Route path="vnpay-return" element={<VNPayReturn />} />
    </Route>
    {/* Admin Routes - No Navbar/Footer */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="payments" element={<PaymentHistoryPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="users/members" element={<MembersPage />} />
      <Route path="users/coaches" element={<CoachesPage />} />
      <Route path="users/admins" element={<AdminsPage />} />
      <Route path="badges" element={<BadgesPage />} />
      <Route path="packages" element={<PackagesPage />} />
    </Route>
    {/* Admin Login Route - Standalone */}
    <Route path="/admin/login" element={<AdminLoginPage />} />
    {/* Coach Routes - No Navbar/Footer */}
    <Route path="/coach" element={<CoachLayout />}>
      <Route index element={<CoachDashBoard />} />
      <Route path="dashboard" element={<CoachDashBoard />} />
      <Route path="plan" element={<CoachMemberPlan />} />
      <Route path="plan/:memberId" element={<CoachMemberPlan />} />
    </Route>
    {/* 404 Not Found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
export default routes;
