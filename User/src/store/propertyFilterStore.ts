import { create } from 'zustand';

interface PropertyFilterState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  rooms: number;
  setCheckIn: (date: string) => void;
  setCheckOut: (date: string) => void;
  setAdults: (count: number) => void;
  setChildren: (count: number) => void;
  setInfants: (count: number) => void;
  setPets: (count: number) => void;
  setRooms: (count: number) => void;
  reset: () => void;
}

const getDefaultCheckIn = () => new Date().toISOString().split('T')[0];
const getDefaultCheckOut = () => new Date(Date.now() + 86400000).toISOString().split('T')[0];

const initialState = {
  checkIn: getDefaultCheckIn(),
  checkOut: getDefaultCheckOut(),
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  rooms: 1,
};

export const usePropertyFilterStore = create<PropertyFilterState>((set) => ({
  ...initialState,
  setCheckIn: (date) => set({ checkIn: date }),
  setCheckOut: (date) => set({ checkOut: date }),
  setAdults: (count) => set({ adults: count }),
  setChildren: (count) => set({ children: count }),
  setInfants: (count) => set({ infants: count }),
  setPets: (count) => set({ pets: count }),
  setRooms: (count) => set({ rooms: count }),
  reset: () => set({
    checkIn: getDefaultCheckIn(),
    checkOut: getDefaultCheckOut(),
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
    rooms: 1,
  }),
}));
