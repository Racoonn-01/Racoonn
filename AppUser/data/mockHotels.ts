import { REAL_STAY_IMAGES } from '../constants/RealImages';

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
    name: 'Himashray Luxury Stay',
    location: 'Mukteshwar, Uttarakhand',
    rating: 4.9,
    reviews: 1240,
    price: 3500,
    image: REAL_STAY_IMAGES[0],
  },
  {
    id: 'h2',
    name: 'Himdarshan Home Stay',
    location: 'Nainital, Uttarakhand',
    rating: 5.0,
    reviews: 892,
    price: 4200,
    image: REAL_STAY_IMAGES[1],
  },
  {
    id: 'h3',
    name: 'Hotel Yoga',
    location: 'Rishikesh, Uttarakhand',
    rating: 4.8,
    reviews: 3105,
    price: 2500,
    image: REAL_STAY_IMAGES[2],
  },
  {
    id: 'h4',
    name: 'Valley View Retreat Stays',
    location: 'Dehradun, Uttarakhand',
    rating: 4.8,
    reviews: 890,
    price: 3800,
    image: REAL_STAY_IMAGES[3],
    status: 'pending',
  },
  {
    id: 'h5',
    name: 'Hotel Gold Green',
    location: 'Haldwani, Uttarakhand',
    rating: 4.9,
    reviews: 420,
    price: 2800,
    image: REAL_STAY_IMAGES[4],
  },
  {
    id: 'h6',
    name: 'Royal Hotel',
    location: 'Mussoorie, Uttarakhand',
    rating: 4.6,
    reviews: 3890,
    price: 4500,
    image: REAL_STAY_IMAGES[5],
  }
];
