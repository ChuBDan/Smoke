// Simple example of how to use the API service

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

// Example: Using API service in a component
const ExampleComponent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example: Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Example: Create user
  const createUser = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.users.create(userData);
      console.log("User created:", response.data);
      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to create user");
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  // Example: Login
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.auth.login(credentials);
      // Store the token
      localStorage.setItem("authToken", response.data.token);
      console.log("Login successful:", response.data);
    } catch (err) {
      setError(err.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>API Service Example</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div>
        <h3>Users ({users.length})</h3>
        {users.map((user) => (
          <div key={user.id}>
            {user.name} - {user.email}
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          createUser({ name: "Test User", email: "test@example.com" })
        }
      >
        Create Test User
      </button>
    </div>
  );
};

export default ExampleComponent;

/*
  API Usage Examples:

  1. Basic CRUD operations:
     - apiService.get('/endpoint')
     - apiService.post('/endpoint', data)
     - apiService.put('/endpoint', data)
     - apiService.delete('/endpoint')

  2. Authentication:
     - apiService.auth.login(credentials)
     - apiService.auth.register(userData)
     - apiService.auth.logout()
     - apiService.auth.getProfile()

  3. Users management:
     - apiService.users.getAll()
     - apiService.users.getMembers()
     - apiService.users.getCoaches()
     - apiService.users.getAdmins()
     - apiService.users.getById(id)
     - apiService.users.create(userData)
     - apiService.users.update(id, userData)
     - apiService.users.delete(id)

  4. Admin operations:
     - apiService.admin.getDashboard()
     - apiService.admin.getStats()
     - apiService.admin.getReports()
     - apiService.admin.getBadges()

  5. Coach operations:
     - apiService.coach.getDashboard()
     - apiService.coach.getAppointments()
     - apiService.coach.getClients()

  6. Appointments:
     - apiService.appointments.getAll()
     - apiService.appointments.getById(id)
     - apiService.appointments.create(appointmentData)
     - apiService.appointments.update(id, appointmentData)
     - apiService.appointments.cancel(id)

  7. Doctors:
     - apiService.doctors.getAll()
     - apiService.doctors.getById(id)
     - apiService.doctors.getBySpecialty(specialty)
*/
