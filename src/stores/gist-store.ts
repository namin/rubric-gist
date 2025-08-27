/**
 * State management for GitHub Gist data
 * Coordinates between UI and gist services
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { gistService } from '../services/gist-service';
import type { Gist, GistFilters } from '../types/gist.types';
import { formatError } from '../utils/errors';

interface GistState {
  // State
  gists: Gist[];
  selectedGist: Gist | null;
  isLoading: boolean;
  error: string | null;
  filters: GistFilters;
  
  // Actions
  fetchPublicGists: () => Promise<void>;
  fetchGist: (id: string) => Promise<void>;
  searchUserGists: (username: string) => Promise<void>;
  
  // UI state actions
  setSelectedGist: (gist: Gist | null) => void;
  setFilters: (filters: GistFilters) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  gists: [],
  selectedGist: null,
  isLoading: false,
  error: null,
  filters: {
    per_page: 30,
    page: 1,
  },
};

export const useGistStore = create<GistState>()(
  immer((set, get) => ({
    ...initialState,

    fetchPublicGists: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const gists = await gistService.listPublicGists(get().filters);
        set((state) => {
          state.gists = gists;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = formatError(error);
          state.isLoading = false;
        });
      }
    },

    fetchGist: async (id: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const gist = await gistService.getGist(id);
        set((state) => {
          state.selectedGist = gist;
          state.isLoading = false;
          
          // Also update in gists list if it exists
          const existingIndex = state.gists.findIndex(g => g.id === id);
          if (existingIndex >= 0) {
            state.gists[existingIndex] = gist;
          }
        });
      } catch (error) {
        set((state) => {
          state.error = formatError(error);
          state.isLoading = false;
        });
      }
    },

    searchUserGists: async (username: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const gists = await gistService.searchUserGists(username, get().filters);
        set((state) => {
          state.gists = gists;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = formatError(error);
          state.isLoading = false;
        });
      }
    },

    setSelectedGist: (gist: Gist | null) => {
      set((state) => {
        state.selectedGist = gist;
      });
    },

    setFilters: (filters: GistFilters) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters };
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    reset: () => {
      set((state) => {
        Object.assign(state, initialState);
      });
    },
  }))
);
