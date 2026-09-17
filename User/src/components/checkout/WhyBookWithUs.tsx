import { CheckCircle, Shield, ThumbsUp } from "lucide-react";

export function WhyBookWithUs() {
  const features = [
    {
      title: "Best Price Guarantee",
      description: "Find a lower price? We'll match it or refund the difference.",
      icon: ThumbsUp,
    },
    {
      title: "Verified Properties",
      description: "Every hotel is vetted for quality, safety, and comfort.",
      icon: CheckCircle,
    },
    {
      title: "Secure Booking",
      description: "Your data and payment are protected with bank-grade encryption.",
      icon: Shield,
    },
  ];

  return (
    <div className="py-6">
      <h3 className="text-lg font-bold text-brand-navy mb-4">Why Book with Racoonn</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-[#DCE8F5] shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#F8D6D8] flex items-center justify-center mb-3">
              <feature.icon className="w-5 h-5 text-brand-coral" />
            </div>
            <h4 className="font-bold text-brand-navy text-sm mb-1">{feature.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
