import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";

const CoachLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Coach Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-800 text-white transition-all duration-300`}>
        <div className="p-4">
          <h2 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Coach Panel</h2>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mt-4 p-2 bg-blue-700 rounded hover:bg-blue-600"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
          <nav className="mt-8">
          <div className="px-4 py-2">
            <Link to="/coach/dashboard" className="block py-2 px-4 rounded hover:bg-blue-700">
              <span className={!sidebarOpen ? 'hidden' : ''}>Dashboard</span>
            </Link>
            <Link to="/coach/appointments" className="block py-2 px-4 rounded hover:bg-blue-700">
              <span className={!sidebarOpen ? 'hidden' : ''}>Appointments</span>
            </Link>
            <Link to="/coach/profile" className="block py-2 px-4 rounded hover:bg-blue-700">
              <span className={!sidebarOpen ? 'hidden' : ''}>Profile</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b p-4">
          <h1 className="text-2xl font-semibold text-gray-800">Coach Dashboard</h1>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoachLayout;
