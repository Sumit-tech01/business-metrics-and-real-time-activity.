import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  searchQuery: '',
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
