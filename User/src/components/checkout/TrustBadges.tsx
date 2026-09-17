import { Lock, Star, Building2, HeadphonesIcon } from "lucide-react";

export function TrustBadges() {
  const badges = [
    { text: "Secure Payment", icon: Lock },
    { text: "4.9/5 Guest Rating", icon: Star },
    { text: "10,000+ Partner Hotels", icon: Building2 },
    { text: "24/7 Customer Support", icon: HeadphonesIcon },
  ];

  return (
    <div className="bg-brand-navy rounded-xl shadow-sm p-6 text-white overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-brand-coral/20 rounded-full blur-2xl pointer-events-none" />
      
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Lock className="w-5 h-5 text-brand-coral" /> Travel with Confidence
      </h3>
      
      <div className="space-y-3 relative z-10">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <badge.icon className="w-3.5 h-3.5 text-brand-coral" />
            </div>
            <span className="text-sm font-medium text-[#DCE8F5]">{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
