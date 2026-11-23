import { create } from 'zustand';
import { formatDisplayDate } from '../utils/dateUtils';

export interface PropertyFilterState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  rooms: number;
  destination: string;
  setCheckIn: (date: string) => void;
  setCheckOut: (date: string) => void;
  setAdults: (count: number) => void;
  setChildren: (count: number) => void;
  setInfants: (count: number) => void;
  setPets: (count: number) => void;
  setRooms: (count: number) => void;
  setDestination: (dest: string) => void;
  setFilters: (filters: Partial<PropertyFilterState>) => void;
  reset: () => void;
}

const getDefaultCheckIn = () => {
  const d = new Date();
  return formatDisplayDate(d);
};

const getDefaultCheckOut = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDisplayDate(d);
};

const initialState = {
  checkIn: getDefaultCheckIn(),
  checkOut: getDefaultCheckOut(),
  adults: 2,
  children: 0,
  infants: 0,
  pets: 0,
  rooms: 1,
  destination: '',
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
  setDestination: (dest) => set({ destination: dest }),
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  reset: () =>
    set({
      checkIn: getDefaultCheckIn(),
      checkOut: getDefaultCheckOut(),
      adults: 2,
      children: 0,
      infants: 0,
      pets: 0,
      rooms: 1,
      destination: '',
    }),
}));
