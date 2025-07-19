interface FeatureCardProps {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="text-left">
      <h3
        className="text-4xl md:text-5xl font-bold mb-6 font-display tracking-tight"
        style={{ color: "#00274C" }}
      >
        {title}
      </h3>
      <p className="text-gray-700 leading-relaxed font-sans text-2xl">
        {description}
      </p>
    </div>
  );
}
