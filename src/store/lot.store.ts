import { create } from 'zustand';
import { preferences } from '@/services/storage';
import type { ParkingLot } from '@/types/models';

interface LotState {
  /** The lot the operator is currently working at; null = all lots. */
  activeLotId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setActiveLot: (lotId: string | null) => void;
  /** Falls back to the first lot when the stored one no longer exists. */
  reconcile: (lots: ParkingLot[]) => void;
}

export const useLotStore = create<LotState>((set, get) => ({
  activeLotId: null,
  hydrated: false,

  async hydrate() {
    const stored = await preferences.getActiveLotId();
    set({ activeLotId: stored, hydrated: true });
  },

  setActiveLot(lotId) {
    set({ activeLotId: lotId });
    void preferences.setActiveLotId(lotId);
  },

  reconcile(lots) {
    const { activeLotId } = get();
    if (lots.length === 0) return;
    const stillExists = activeLotId && lots.some((lot) => lot._id === activeLotId);
    if (!stillExists) {
      const first = lots[0];
      if (first) get().setActiveLot(first._id);
    }
  },
}));
