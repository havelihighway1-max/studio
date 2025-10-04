"use client";

import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';
import type { Guest } from '@/lib/types';

interface GuestState {
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, guest: Partial<Omit<Guest, 'id'>>) => void;
  deleteGuest: (id: string) => void;
  getFeedback: () => string[];
  
  editingGuest: Guest | null;
  isGuestDialogOpen: boolean;
  openGuestDialog: (guest?: Guest | null) => void;
  closeGuestDialog: () => void;

  isInsightsDialogOpen: boolean;
  openInsightsDialog: () => void;
  closeInsightsDialog: () => void;
}

const storage: PersistStorage<GuestState> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const { state } = JSON.parse(str);
    return {
      state: {
        ...state,
        guests: state.guests.map((g: Guest) => ({
          ...g,
          visitDate: new Date(g.visitDate),
        })),
      },
    };
  },
  setItem: (name, newValue) => {
    localStorage.setItem(name, JSON.stringify(newValue));
  },
  removeItem: (name) => localStorage.removeItem(name),
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      guests: [],
      addGuest: (guest) =>
        set((state) => ({
          guests: [...state.guests, { ...guest, id: crypto.randomUUID() }].sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime()),
        })),
      updateGuest: (id, updatedData) =>
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === id ? { ...guest, ...updatedData } : guest
          ).sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime()),
        })),
      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id),
        })),
      getFeedback: () => {
        return get().guests
          .map((guest) => guest.feedback)
          .filter((feedback): feedback is string => !!feedback && feedback.trim() !== '');
      },
      editingGuest: null,
      isGuestDialogOpen: false,
      openGuestDialog: (guest = null) => set({ editingGuest: guest, isGuestDialogOpen: true }),
      closeGuestDialog: () => set({ isGuestDialogOpen: false, editingGuest: null }),
      
      isInsightsDialogOpen: false,
      openInsightsDialog: () => set({ isInsightsDialogOpen: true }),
      closeInsightsDialog: () => set({ isInsightsDialogOpen: false }),
    }),
    {
      name: 'embertable-guest-storage',
      storage,
    }
  )
);
