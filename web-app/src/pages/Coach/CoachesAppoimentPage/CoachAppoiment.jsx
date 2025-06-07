const CoachAppoiment = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointments</h1>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Today&apos;s Schedule
          </h2>
        </div>

        <div className="divide-y">
          {/* Appointment Item */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">John Doe</h3>
              <p className="text-sm text-gray-500">
                Smoking cessation consultation
              </p>
              <p className="text-sm text-gray-500">10:00 AM - 11:00 AM</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Join Call
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Reschedule
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Sarah Smith</h3>
              <p className="text-sm text-gray-500">Follow-up session</p>
              <p className="text-sm text-gray-500">2:00 PM - 3:00 PM</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Join Call
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Reschedule
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Mike Johnson</h3>
              <p className="text-sm text-gray-500">Initial assessment</p>
              <p className="text-sm text-gray-500">4:00 PM - 5:00 PM</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Join Call
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Reschedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachAppoiment;
