const fs = require('fs');

const staticPackages = [
  { 
    id: 1, 
    title: 'Char Dham Yatra', 
    location: 'Uttarakhand', 
    duration: '6 Days / 5 Nights', 
    features: 'Meals | Stay | Transfer', 
    price: '₹18,999', 
    badge: 'Bestseller',
    badgeColor: 'text-brand-coral',
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 2, 
    title: 'Nainital & Jim Corbett', 
    location: 'Uttarakhand', 
    duration: '4 Days / 3 Nights', 
    features: 'Meals | Stay | Safari', 
    price: '₹12,499', 
    badge: 'Popular',
    badgeColor: 'text-blue-500',
    images: [
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625449281218-cbb6183f0aec?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 3, 
    title: 'Auli Skiing Adventure', 
    location: 'Uttarakhand', 
    duration: '5 Days / 4 Nights', 
    features: 'Meals | Stay | Activities', 
    price: '₹16,999', 
    badge: 'New',
    badgeColor: 'text-green-500',
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 4, 
    title: 'Maldives Escape', 
    location: 'International', 
    duration: '5 Days / 4 Nights', 
    features: 'Meals | Stay | Transfer', 
    price: '₹49,999', 
    badge: 'Trending',
    badgeColor: 'text-orange-500',
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 5, 
    title: 'Kashmir Valley Tour', 
    location: 'Jammu & Kashmir', 
    duration: '6 Days / 5 Nights', 
    features: 'Meals | Stay | Shikara Ride', 
    price: '₹22,499', 
    badge: 'Popular',
    badgeColor: 'text-blue-500',
    images: [
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 6, 
    title: 'Goa Beach Holiday', 
    location: 'Goa', 
    duration: '4 Days / 3 Nights', 
    features: 'Meals | Stay | Water Sports', 
    price: '₹14,999', 
    badge: 'Trending',
    badgeColor: 'text-orange-500',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534080537060-159d332dc331?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 7, 
    title: 'Manali Snow Trek', 
    location: 'Himachal', 
    duration: '5 Days / 4 Nights', 
    features: 'Meals | Stay | Trekking', 
    price: '₹11,999', 
    badge: 'New',
    badgeColor: 'text-green-500',
    images: [
      'https://images.unsplash.com/photo-1623910350785-520e5dbb0918?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605649487212-4d43be61795f?q=80&w=800&auto=format&fit=crop'
    ]
  },
  { 
    id: 8, 
    title: 'Dubai City Tour', 
    location: 'International', 
    duration: '5 Days / 4 Nights', 
    features: 'Meals | Stay | Desert Safari', 
    price: '₹39,999', 
    badge: 'Bestseller',
    badgeColor: 'text-brand-coral',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582672060624-cb814c4033b0?q=80&w=800&auto=format&fit=crop'
    ]
  }
];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  const fetch = (await import('node-fetch')).default;
  
  const res = await fetch("http://localhost:3001/api/cms/packages");
  const data = await res.json();
  let livePackages = [];
  if (data.success) {
      livePackages = data.packages;
  }
  
  for (const pkg of staticPackages) {
      const exists = livePackages.some(lp => lp.title === pkg.title || lp.title === "Char Dham Yatra" && pkg.title === "Char Dham Yatra");
      // Special check since Char Dham Yatra is already there
      if (!exists && pkg.title !== "Char Dham Yatra") {
          const numericPrice = parseInt(pkg.price.replace(/[^\d]/g, ''));
          const newPkg = {
              id: "static_" + pkg.id,
              title: pkg.title,
              slug: generateSlug(pkg.title),
              location: pkg.location,
              duration: pkg.duration,
              status: "published",
              images: pkg.images,
              overview: "Enjoy a wonderful trip with our " + pkg.title + " package.",
              highlights: pkg.features.split(" | "),
              included: ["Accommodation", "Meals as per itinerary", "Transfers"],
              excluded: ["Flights", "Personal expenses", "Travel insurance"],
              pricing: [
                  {
                      id: "price_" + Date.now() + Math.floor(Math.random() * 1000),
                      minPersons: 1,
                      maxPersons: 2,
                      pricePerPerson: numericPrice
                  }
              ],
              hotelOptions: [],
              itinerary: [
                  {
                      id: "itin_" + Date.now() + Math.floor(Math.random() * 1000),
                      dayNumber: 1,
                      title: "Arrival",
                      activities: ["Check-in", "Leisure time"],
                      meals: ["Dinner"],
                      stay: "Hotel"
                  }
              ]
          };
          livePackages.push(newPkg);
      }
  }
  
  console.log("Pushing " + livePackages.length + " packages to CMS...");
  const postRes = await fetch("http://localhost:3001/api/cms/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packages: livePackages })
  });
  
  console.log("POST Status:", postRes.status);
  const text = await postRes.text();
  console.log("POST Response text:", text.substring(0, 200));
}
run();
