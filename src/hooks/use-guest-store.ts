
"use client";

import { create } from 'zustand';
import { Guest, Reservation, Table, WaitingGuest } from '@/lib/types';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc, writeBatch, getFirestore, getDocs, query, orderBy } from 'firebase/firestore';

interface AppState {
  // Local state properties
  editingGuest: Partial<Guest> | null;
  isGuestDialogOpen: boolean;
  editingReservation: Partial<Reservation> | null;
  isReservationDialogOpen: boolean;
  editingTable: Partial<Table> | null;
  isTableDialogOpen: boolean;
  editingWaitingGuest: Partial<WaitingGuest> | null;
  isWaitingGuestDialogOpen: boolean;

  // UI control functions
  openGuestDialog: (guest?: Partial<Guest> | null) => void;
  closeGuestDialog: () => void;
  openReservationDialog: (reservation?: Partial<Reservation> | null) => void;
  closeReservationDialog: () => void;
  openTableDialog: (table?: Partial<Table> | null) => void;
  closeTableDialog: () => void;
  openWaitingGuestDialog: (guest?: Partial<WaitingGuest> | null) => void;
  closeWaitingGuestDialog: () => void;
  openInsightsDialog: () => void;
  closeInsightsDialog: () => void;
  isInsightsDialogOpen: boolean;
  
  // Firestore actions
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, guest: Partial<Omit<Guest, 'id'>>) => void;
  deleteGuest: (id: string) => void;
  
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, reservation: Partial<Omit<Reservation, 'id'>>) => void;
  deleteReservation: (id: string) => void;
  
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, table: Partial<Omit<Table, 'id'>>) => void;
  deleteTable: (id: string) => void;
  setTables: (tables: Omit<Table, 'id'>[]) => Promise<void>;

  addWaitingGuest: (guest: Omit<WaitingGuest, 'id' | 'createdAt' | 'status' | 'tokenNumber'>) => void;
  updateWaitingGuest: (id: string, data: Partial<Omit<WaitingGuest, 'id'>>) => void;
  deleteWaitingGuest: (id: string) => void;
}

const getDb = () => getFirestore();

export const useGuestStore = create<AppState>((set, get) => ({
  editingGuest: null,
  isGuestDialogOpen: false,
  editingReservation: null,
  isReservationDialogOpen: false,
  editingTable: null,
  isTableDialogOpen: false,
  editingWaitingGuest: null,
  isWaitingGuestDialogOpen: false,
  isInsightsDialogOpen: false,

  openGuestDialog: (guest = null) => set({ editingGuest: guest, isGuestDialogOpen: true }),
  closeGuestDialog: () => set({ isGuestDialogOpen: false, editingGuest: null }),
  openReservationDialog: (reservation = null) => set({ editingReservation: reservation, isReservationDialogOpen: true }),
  closeReservationDialog: () => set({ isReservationDialogOpen: false, editingReservation: null }),
  openTableDialog: (table = null) => set({ editingTable: table, isTableDialogOpen: true }),
  closeTableDialog: () => set({ isTableDialogOpen: false, editingTable: null }),
  openWaitingGuestDialog: (guest = null) => set({ editingWaitingGuest: guest, isWaitingGuestDialogOpen: true }),
  closeWaitingGuestDialog: () => set({ isWaitingGuestDialogOpen: false, editingWaitingGuest: null }),
  openInsightsDialog: () => set({ isInsightsDialogOpen: true }),
  closeInsightsDialog: () => set({ isInsightsDialogOpen: false }),
  
  addGuest: (guest) => {
    const firestore = getDb();
    const guestWithId = { ...guest, id: crypto.randomUUID() };
    const docRef = doc(firestore, "guests", guestWithId.id);
    setDocumentNonBlocking(docRef, guestWithId, {});
  },
  updateGuest: (id, updatedData) => {
    const firestore = getDb();
    const docRef = doc(firestore, "guests", id);
    setDocumentNonBlocking(docRef, updatedData, { merge: true });
  },
  deleteGuest: (id) => {
    const firestore = getDb();
    const docRef = doc(firestore, "guests", id);
    deleteDocumentNonBlocking(docRef);
  },
  addReservation: (reservation) => {
    const firestore = getDb();
    const reservationWithId = { ...reservation, id: crypto.randomUUID() };
    const docRef = doc(firestore, "reservations", reservationWithId.id);
    setDocumentNonBlocking(docRef, reservationWithId, {});
  },
  updateReservation: (id, updatedData) => {
    const firestore = getDb();
    const docRef = doc(firestore, "reservations", id);
    setDocumentNonBlocking(docRef, updatedData, { merge: true });
  },
  deleteReservation: (id) => {
    const firestore = getDb();
    const docRef = doc(firestore, "reservations", id);
    deleteDocumentNonBlocking(docRef);
  },
  addTable: (table) => {
    const firestore = getDb();
    const tableWithId = { ...table, id: crypto.randomUUID() };
    const docRef = doc(firestore, "tables", tableWithId.id);
    setDocumentNonBlocking(docRef, tableWithId, {});
  },
  updateTable: (id, updatedData) => {
    const firestore = getDb();
    const docRef = doc(firestore, "tables", id);
    setDocumentNonBlocking(docRef, updatedData, { merge: true });
  },
  deleteTable: (id) => {
    const firestore = getDb();
    const docRef = doc(firestore, "tables", id);
    deleteDocumentNonBlocking(docRef);
  },
  setTables: async (tables) => {
      const firestore = getDb();
      const batch = writeBatch(firestore);
      tables.forEach(table => {
          const tableWithId = { ...table, id: crypto.randomUUID() };
          const docRef = doc(firestore, "tables", tableWithId.id);
          batch.set(docRef, tableWithId);
      });
      await batch.commit();
  },
  addWaitingGuest: async (guest) => {
    const firestore = getDb();
    const waitingGuestsCollection = collection(firestore, 'waitingGuests');
    const q = query(waitingGuestsCollection, orderBy('tokenNumber', 'desc'));
    const querySnapshot = await getDocs(q);
    const lastGuest = querySnapshot.docs[0]?.data() as WaitingGuest;
    const nextToken = (lastGuest?.tokenNumber || 0) + 1;

    const newGuest = {
        ...guest,
        id: crypto.randomUUID(),
        tokenNumber: nextToken,
        createdAt: new Date(),
        status: 'waiting' as const,
    };
    const docRef = doc(firestore, "waitingGuests", newGuest.id);
    setDocumentNonBlocking(docRef, newGuest, {});
  },
  updateWaitingGuest: (id, data) => {
    const firestore = getDb();
    const docRef = doc(firestore, "waitingGuests", id);
    setDocumentNonBlocking(docRef, data, { merge: true });
  },
  deleteWaitingGuest: (id) => {
    const firestore = getDb();
    const docRef = doc(firestore, "waitingGuests", id);
    deleteDocumentNonBlocking(docRef);
  },
}));
