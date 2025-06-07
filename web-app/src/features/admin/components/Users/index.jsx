import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const UsersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user lands on /admin/users, redirect to members by default
    if (location.pathname === "/admin/users") {
      navigate("/admin/users/members", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Users Management</h1>
      <p>Redirecting to Members page...</p>
    </div>
  );
};

export default UsersPage;
