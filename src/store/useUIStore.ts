import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tab = {
  id: string;
  title: string;
  ext?: string;
  isUnsaved?: boolean;
};

interface UIState {
  // Layout
  leftSidebarWidth: number;
  setLeftSidebarWidth: (width: number) => void;
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  
  rightSidebarWidth: number;
  setRightSidebarWidth: (width: number) => void;
  rightSidebarCollapsed: boolean;
  setRightSidebarCollapsed: (collapsed: boolean) => void;

  readingMode: boolean;
  setReadingMode: (enabled: boolean) => void;

  // Tabs
  openTabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      leftSidebarWidth: 268,
      setLeftSidebarWidth: (width) => set({ leftSidebarWidth: width }),
      leftSidebarCollapsed: false,
      setLeftSidebarCollapsed: (collapsed) => set({ leftSidebarCollapsed: collapsed }),
      
      rightSidebarWidth: 340,
      setRightSidebarWidth: (width) => set({ rightSidebarWidth: width }),
      rightSidebarCollapsed: false,
      setRightSidebarCollapsed: (collapsed) => set({ rightSidebarCollapsed: collapsed }),

      readingMode: false,
      setReadingMode: (enabled) => set({ readingMode: enabled }),

      openTabs: [],
      activeTabId: null,
      
      addTab: (tab) => {
        const state = get();
        if (!state.openTabs.find(t => t.id === tab.id)) {
          set({ openTabs: [...state.openTabs, tab], activeTabId: tab.id });
        } else {
          set({ activeTabId: tab.id });
        }
      },
      
      closeTab: (id) => {
        const state = get();
        const newTabs = state.openTabs.filter(t => t.id !== id);
        let newActiveId = state.activeTabId;
        
        if (state.activeTabId === id) {
          const index = state.openTabs.findIndex(t => t.id === id);
          if (newTabs.length > 0) {
            newActiveId = newTabs[Math.min(index, newTabs.length - 1)].id;
          } else {
            newActiveId = null;
          }
        }
        
        set({ openTabs: newTabs, activeTabId: newActiveId });
      },
      
      setActiveTab: (id) => set({ activeTabId: id })
    }),
    {
      name: 'vector-recall-ui',
      partialize: (state) => ({
        // only persist these keys
        leftSidebarWidth: state.leftSidebarWidth,
        leftSidebarCollapsed: state.leftSidebarCollapsed,
        rightSidebarWidth: state.rightSidebarWidth,
        rightSidebarCollapsed: state.rightSidebarCollapsed,
        openTabs: state.openTabs,
        activeTabId: state.activeTabId
      }),
    }
  )
);
