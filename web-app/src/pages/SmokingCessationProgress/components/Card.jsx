/* eslint-disable react/prop-types */
// Card component
const Card = ({ title, subtitle, value }) => (
  <div className="border border-blue-200 rounded-xl overflow-hidden shadow hover:shadow-md transition">
    <div className="bg-blue-50 p-4">
      <p className="text-gray-900 text-lg font-medium">{title}</p>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span>{subtitle}</span>
      </div>
      <p className="text-gray-900 text-xl font-semibold">{value}</p>
    </div>
  </div>
)

export default Card;
