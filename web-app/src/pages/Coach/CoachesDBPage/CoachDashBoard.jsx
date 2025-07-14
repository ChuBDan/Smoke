// src/pages/Coach/CoachesDBPage/CoachDashBoard.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getConsultationsByCoach } from "@/services/consultationApi";
import { parse } from "date-fns";
import { useNavigate } from "react-router-dom";

const CoachDashBoard = () => {
  const { coachId, token } = useSelector((state) => state.auth);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await getConsultationsByCoach(coachId, token);
        const now = new Date();
        const upcoming = (res?.consultations || []).filter((c) => {
          const end = parse(c.endDate, "dd-MM-yyyy HH:mm:ss", new Date());
          return end > now;
        });
        setConsultations(upcoming);
        setCurrentPage(1); 
      } catch (err) {
        console.error("Failed to fetch consultations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (coachId && token) fetchConsultations();
  }, [coachId, token]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = consultations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(consultations.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Dashboard</h1>
          <p className="text-gray-600">Manage your upcoming consultations and client sessions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Upcoming Sessions"
            value={consultations.length}
            color="blue"
            icon="📅"
          />
          <StatCard
            title="Today's Sessions"
            value={consultations.filter((c) => {
              const today = new Date().toDateString();
              const sessionDate = parse(c.startDate, "dd-MM-yyyy HH:mm:ss", new Date()).toDateString();
              return sessionDate === today;
            }).length}
            color="green"
            icon="🕐"
          />
          <StatCard
            title="This Week"
            value={consultations.filter((c) => {
              const sessionDate = parse(c.startDate, "dd-MM-yyyy HH:mm:ss", new Date());
              const oneWeekFromNow = new Date();
              oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
              return sessionDate <= oneWeekFromNow;
            }).length}
            color="purple"
            icon="📊"
          />
        </div>

        {/* Consultations Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Upcoming Consultations
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {consultations.length} sessions scheduled
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Updates
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                Loading consultations...
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming consultations
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Your schedule is clear. New consultation requests will appear here.
                </p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Meeting</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                              {item.member.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.member.fullName}</div>
                              <div className="text-sm text-gray-500">Client ID: {item.member.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">🟢</span>
                            <span className="font-medium">Start:</span> {item.startDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">🔴</span>
                            <span className="font-medium">End:</span> {item.endDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={item.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
                          >
                            📎 Join Meet
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              localStorage.setItem("selectedMemberId", item.member.id);
                              navigate("/coach/plan");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600"
                          >
                            📝 View Plan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`${colors.bg} ${colors.border} border-2 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

export default CoachDashBoard;
