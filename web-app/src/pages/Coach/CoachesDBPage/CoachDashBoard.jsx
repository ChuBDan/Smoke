const CoachDashBoard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Coach Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Clients
          </h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            This Week&apos;s Sessions
          </h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Success Rate
          </h3>
          <p className="text-3xl font-bold text-purple-600">78%</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Session with John Doe completed</span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>New client Sarah Smith registered</span>
            <span className="text-sm text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Weekly report generated</span>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashBoard;
