import { create } from "zustand";

const useBookingStore = create((set) => ({
  bookingItemData: [],
  setBookingItemData: (data) => set({ bookingItemData: data }),
}));

export default useBookingStore;
