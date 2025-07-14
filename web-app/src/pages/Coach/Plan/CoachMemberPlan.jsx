import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPlansByMember,
  getPlanWeeks,
  updatePlanDay,
  updatePlanPhase,
  updateCoping,
} from "@/services/planApi";

const CoachMemberPlan = () => {
  const { memberId: routeMemberId } = useParams();
  const navigate = useNavigate();
  const memberId = routeMemberId || localStorage.getItem("selectedMemberId");

  const [plan, setPlan] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("phases");

  const [open, setOpen] = useState(false);
  const [editType, setEditType] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (!memberId) {
      toast.error("No member selected");
      navigate("/coach/dashboard");
      return;
    }

    localStorage.setItem("selectedMemberId", memberId);

    const fetchData = async () => {
      try {
        const res = await getPlansByMember(memberId);

        if (!res.plan) {
          toast.error("No plan found");
          return setLoading(false);
        }

        const mergedPlan = {
          ...res.plan,
          planPhases: res.planPhases || [],
          copingMechanisms: res.copingMechanisms || [],
        };

        setPlan(mergedPlan);

        const weekRes = await getPlanWeeks(res.plan.id);
        const normalizedWeeks = (weekRes.planWeeks || []).map((w) => ({
          ...w,
          days: w.days || [],
        }));

        setWeeks(normalizedWeeks);
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch plan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, navigate]);

  const openEdit = (type, target, data) => {
    setEditType(type);
    setEditTarget(target);
    setDraft(data);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      let dataToUpdate = { ...draft };

      if (editType === "phase" && typeof draft.strategies === "string") {
        dataToUpdate.strategies = draft.strategies
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (editType === "day") {
        const { weekIdx, dayIdx } = editTarget;
        const weekId = weeks[weekIdx].id;
        const dayId = weeks[weekIdx].days[dayIdx].id;
        await updatePlanDay(weekId, dayId, dataToUpdate);
      } else if (editType === "phase") {
        await updatePlanPhase(editTarget.id, dataToUpdate);
      } else if (editType === "coping") {
        await updateCoping(editTarget.id, plan.id, dataToUpdate);
      }

      toast.success("Updated successfully");
      window.location.reload();
    } catch (e) {
      toast.error("Update failed");
      console.error(e);
    } finally {
      setOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plan found</h3>
          <p className="text-gray-500">This member doesn't have a plan yet.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "phases", label: "Phases", count: plan.planPhases?.length || 0 },
    { id: "weeks", label: "Schedule", count: weeks.length },
    { id: "coping", label: "Coping", count: plan.copingMechanisms?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">
                {plan.member?.fullName}'s Plan
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "phases" && (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Treatment Phases</h2>
              <div className="space-y-4">
                {(plan.planPhases || []).map((p, i) => (
                  <div key={p.id || i} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                          {p.weekRange}
                        </span>
                        <h3 className="font-medium text-gray-900">{p.goal}</h3>
                      </div>
                      <button
                        onClick={() =>
                          openEdit("phase", { id: p.id }, {
                            goal: p.goal,
                            strategies: (p.strategies || []).join("\n"),
                          })
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                    {p.strategies?.length > 0 && (
                      <div className="bg-gray-50 rounded p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Strategies:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {p.strategies.map((s, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "weeks" && (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Weekly Schedule</h2>
              <div className="space-y-6">
                {weeks.map((w, wi) => (
                  <div key={w.id || wi} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Week {w.weekNumber}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(w.days || []).map((d, di) => (
                        <div key={d.id || di} className="bg-gray-50 rounded p-3 hover:bg-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-700">Day {d.dayNumber}</span>
                            <button
                              onClick={() =>
                                openEdit("day", { weekIdx: wi, dayIdx: di }, {
                                  goal: d.goal,
                                  task: d.task,
                                  tip: d.tip,
                                })
                              }
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Edit
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{d.goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "coping" && (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Coping Mechanisms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(plan.copingMechanisms || []).map((c, i) => (
                  <div key={c.id || i} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700 flex-1 mr-3">{c.content}</p>
                      <button
                        onClick={() => openEdit("coping", { id: c.id }, { content: c.content })}
                        className="text-blue-600 hover:text-blue-700 text-sm flex-shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" onClose={() => setOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Edit {editType}
                </Dialog.Title>
                <div className="space-y-4">
                  {Object.keys(draft).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key}
                      </label>
                      <textarea
                        rows={key === "strategies" ? 4 : 2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={draft[key]}
                        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CoachMemberPlan;