"use client";

import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';
import type { Guest, Reservation } from '@/lib/types';

interface AppState {
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

  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, reservation: Partial<Omit<Reservation, 'id'>>) => void;
  deleteReservation: (id: string) => void;
  
  editingReservation: Reservation | null;
  isReservationDialogOpen: boolean;
  openReservationDialog: (reservation?: Reservation | null) => void;
  closeReservationDialog: () => void;
}

// Custom storage implementation to handle Date objects
const storage: PersistStorage<AppState> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    const parsed = JSON.parse(str);

    if (parsed.state) {
      if (Array.isArray(parsed.state.guests)) {
        parsed.state.guests = parsed.state.guests.map((g: any) => ({
          ...g,
          visitDate: new Date(g.visitDate),
        }));
      }
      if (Array.isArray(parsed.state.reservations)) {
        parsed.state.reservations = parsed.state.reservations.map((r: any) => ({
          ...r,
          dateOfEvent: new Date(r.dateOfEvent),
        }));
      }
    }

    return parsed;
  },
  setItem: (name, newValue) => {
    localStorage.setItem(name, JSON.stringify(newValue));
  },
  removeItem: (name) => localStorage.removeItem(name),
}


export const useGuestStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Guest management
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
      
      // Insights dialog
      isInsightsDialogOpen: false,
      openInsightsDialog: () => set({ isInsightsDialogOpen: true }),
      closeInsightsDialog: () => set({ isInsightsDialogOpen: false }),

      // Reservation management
      reservations: [],
      addReservation: (reservation) =>
        set((state) => ({
          reservations: [...state.reservations, { ...reservation, id: crypto.randomUUID(), status: 'upcoming' }].sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime()),
        })),
      updateReservation: (id, updatedData) =>
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, ...updatedData } : reservation
          ).sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime()),
        })),
      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id),
        })),
      editingReservation: null,
      isReservationDialogOpen: false,
      openReservationDialog: (reservation = null) => set({ editingReservation: reservation, isReservationDialogOpen: true }),
      closeReservationDialog: () => set({ isReservationDialogOpen: false, editingReservation: null }),
    }),
    {
      name: 'embertable-storage', // Changed name to avoid conflicts with old structure
      storage,
    }
  )
);
