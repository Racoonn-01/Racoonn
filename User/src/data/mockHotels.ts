export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  status?: string;
}

export const mockHotels: Hotel[] = [
  {
    id: 'h1',
    name: 'The Ritz-Carlton, Bali',
    location: 'Nusa Dua, Bali',
    rating: 4.9,
    reviews: 1240,
    price: 350,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'h2',
    name: 'Waldorf Astoria Maldives',
    location: 'Maldives',
    rating: 5.0,
    reviews: 892,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'h3',
    name: 'Burj Al Arab Jumeirah',
    location: 'Dubai, UAE',
    rating: 4.8,
    reviews: 3105,
    price: 1500,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'h4',
    name: 'Marina Bay Sands',
    location: 'Singapore',
    rating: 4.8,
    reviews: 890,
    price: 420,
    image: 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'pending',
  },
  {
    id: 'h5',
    name: 'Aman Tokyo',
    location: 'Tokyo, Japan',
    rating: 4.9,
    reviews: 420,
    price: 950,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c0d509af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'h6',
    name: 'The Plaza',
    location: 'New York City, USA',
    rating: 4.6,
    reviews: 3890,
    price: 650,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];
