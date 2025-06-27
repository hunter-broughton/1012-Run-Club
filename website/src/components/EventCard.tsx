interface EventCardProps {
  badge: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

export default function EventCard({
  badge,
  title,
  description,
  date,
  location,
}: EventCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-l-4 border-opacity-100"
      style={{ borderLeftColor: "#FFCB05" }}
    >
      <div
        className="text-sm font-bold mb-3 font-sans tracking-wide"
        style={{ color: "#FFCB05" }}
      >
        {badge}
      </div>
      <h3
        className="text-2xl font-bold mb-4 font-display tracking-tight"
        style={{ color: "#00274C" }}
      >
        {title}
      </h3>
      <p className="text-gray-700 mb-6 font-sans text-lg leading-relaxed">
        {description}
      </p>
      <div className="space-y-2 text-gray-600 font-sans">
        <p>
          <span className="font-semibold">Date:</span> {date}
        </p>
        <p>
          <span className="font-semibold">Location:</span> {location}
        </p>
      </div>
    </div>
  );
}
