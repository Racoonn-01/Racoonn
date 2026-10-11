import { optimizeAppwriteImage } from "@/lib/optimizeImage";
import { motion } from 'framer-motion';
import { Wallet, Plane, CheckCircle, Heart, Award, Clock } from 'lucide-react';
import { UserProfile } from '@/store/authStore';
import Image from 'next/image';

export default function OverviewSection({ profile }: { profile: UserProfile | null }) {
  const stats = [
    { title: 'Upcoming Trips', value: '2', icon: Plane, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Completed Trips', value: '14', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Saved Hotels', value: '8', icon: Heart, color: 'text-brand-coral', bg: 'bg-brand-coral/10' },
    { title: 'Reward Points', value: '2,450', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Wallet Balance', value: '$150.00', icon: Wallet, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];

  const recentBooking = {
    hotel: 'The Ritz-Carlton, Bali',
    date: 'Oct 12 - Oct 16, 2026',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold mb-2">Overview</h2>
        <p className="text-gray-500">Welcome to your luxury travel dashboard, {profile?.name || 'Guest'}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.title}
            className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all flex flex-col items-start gap-4"
          >
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold font-heading text-brand-navy">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Recent Booking Card */}
        <div className="p-6 rounded-3xl border border-gray-100 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Next Destination</h3>
            <span className="px-3 py-1 bg-brand-coral/10 text-brand-coral text-xs font-bold rounded-full uppercase tracking-wider">
              {recentBooking.status}
            </span>
          </div>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
              <Image src={optimizeAppwriteImage(recentBooking.image)} alt="Hotel" fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-brand-navy mb-1">{recentBooking.hotel}</h4>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
                <Clock size={14} /> {recentBooking.date}
              </p>
              <button className="text-brand-coral text-sm font-bold text-left hover:underline">View Details</button>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="p-6 rounded-3xl border border-gray-100 shadow-sm bg-brand-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award size={100} />
          </div>
          <h3 className="font-bold text-lg mb-2 relative z-10">Profile Completion</h3>
          <p className="text-gray-300 text-sm mb-6 max-w-[80%] relative z-10">
            Complete your profile to unlock exclusive member rates and personalized recommendations.
          </p>
          
          <div className="relative z-10">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span>Progress</span>
              <span className="text-brand-coral">65%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-brand-coral rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
