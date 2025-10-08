
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';
import type { Guest, Reservation, Table, WaitingGuest } from '@/lib/types';

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

  tables: Table[];
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, table: Partial<Omit<Table, 'id'>>) => void;
  deleteTable: (id: string) => void;
  setTables: (tables: Omit<Table, 'id'>[]) => void;

  editingTable: Table | null;
  isTableDialogOpen: boolean;
  openTableDialog: (table?: Table | null) => void;
  closeTableDialog: () => void;

  waitingGuests: WaitingGuest[];
  addWaitingGuest: (guest: Omit<WaitingGuest, 'id' | 'tokenNumber' | 'createdAt' | 'status'>) => void;
  updateWaitingGuest: (id: string, data: Partial<Omit<WaitingGuest, 'id'>>) => void;
  deleteWaitingGuest: (id: string) => void;
  getNextTokenNumber: () => number;

  editingWaitingGuest: WaitingGuest | null;
  isWaitingGuestDialogOpen: boolean;
  openWaitingGuestDialog: (guest?: WaitingGuest | null) => void;
  closeWaitingGuestDialog: () => void;
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
      if (Array.isArray(parsed.state.waitingGuests)) {
        parsed.state.waitingGuests = parsed.state.waitingGuests.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
        }));
      }
    }

    return parsed;
  },
  setItem: (name, newValue) => {
    // Prevent storing React event objects
    const stateToStore = { ...newValue.state };
    const newEditingGuest = stateToStore.editingGuest ? { ...stateToStore.editingGuest } : null;
    const newEditingReservation = stateToStore.editingReservation ? { ...stateToStore.editingReservation } : null;
    const newEditingTable = stateToStore.editingTable ? { ...stateToStore.editingTable } : null;
    const newEditingWaitingGuest = stateToStore.editingWaitingGuest ? { ...stateToStore.editingWaitingGuest } : null;

    if (newEditingGuest) {
      // @ts-ignore
      delete newEditingGuest.nativeEvent;
    }
    if (newEditingReservation) {
       // @ts-ignore
      delete newEditingReservation.nativeEvent;
    }
    if (newEditingTable) {
       // @ts-ignore
      delete newEditingTable.nativeEvent;
    }
    if (newEditingWaitingGuest) {
       // @ts-ignore
      delete newEditingWaitingGuest.nativeEvent;
    }

    const cleanedState = {
      ...stateToStore,
      editingGuest: newEditingGuest,
      editingReservation: newEditingReservation,
      editingTable: newEditingTable,
      editingWaitingGuest: newEditingWaitingGuest,
    };
    
    localStorage.setItem(name, JSON.stringify({ ...newValue, state: cleanedState }));
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
          reservations: [...state.reservations, { ...reservation, id: crypto.randomUUID(), checkedIn: false }].sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime()),
        })),
      updateReservation: (id, updatedData) =>
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, ...updatedData } : reservation
          ).sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime()),
        })),
      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id),
        })),
      editingReservation: null,
      isReservationDialogOpen: false,
      openReservationDialog: (reservation = null) => set({ editingReservation: reservation, isReservationDialogOpen: true }),
      closeReservationDialog: () => set({ isReservationDialogOpen: false, editingReservation: null }),

      // Table management
      tables: [],
      addTable: (table) =>
        set((state) => ({
          tables: [...state.tables, { ...table, id: crypto.randomUUID() }].sort((a, b) => a.name.localeCompare(b.name)),
        })),
      updateTable: (id, updatedData) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id ? { ...table, ...updatedData } : table
          ).sort((a, b) => a.name.localeCompare(b.name)),
        })),
      deleteTable: (id) =>
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== id),
        })),
      setTables: (tables) => set({ tables: tables.map(t => ({...t, id: crypto.randomUUID()})).sort((a, b) => a.name.localeCompare(b.name)) }),
      editingTable: null,
      isTableDialogOpen: false,
      openTableDialog: (table = null) => set({ editingTable: table, isTableDialogOpen: true }),
      closeTableDialog: () => set({ isTableDialogOpen: false, editingTable: null }),

      // Waiting list management
      waitingGuests: [],
      addWaitingGuest: (guest) => {
        const newGuest = {
          ...guest,
          id: crypto.randomUUID(),
          tokenNumber: get().getNextTokenNumber(),
          createdAt: new Date(),
          status: 'waiting' as const,
        };
        set((state) => ({
          waitingGuests: [...state.waitingGuests, newGuest],
        }));
      },
      updateWaitingGuest: (id, data) =>
        set((state) => ({
          waitingGuests: state.waitingGuests.map((guest) =>
            guest.id === id ? { ...guest, ...data } : guest
          ),
        })),
      deleteWaitingGuest: (id) =>
        set((state) => ({
          waitingGuests: state.waitingGuests.filter((guest) => guest.id !== id),
        })),
      getNextTokenNumber: () => {
        const waitingGuests = get().waitingGuests;
        if (waitingGuests.length === 0) {
          return 1;
        }
        const maxToken = Math.max(...waitingGuests.map(g => g.tokenNumber));
        return maxToken + 1;
      },
      editingWaitingGuest: null,
      isWaitingGuestDialogOpen: false,
      openWaitingGuestDialog: (guest = null) => set({ editingWaitingGuest: guest, isWaitingGuestDialogOpen: true }),
      closeWaitingGuestDialog: () => set({ isWaitingGuestDialogOpen: false, editingWaitingGuest: null }),

    }),
    {
      name: 'embertable-storage',
      storage,
    }
  )
);
