import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MockEndpoint } from '../types/dto';

interface Client {
  id: string;
  name: string;
  createdAt: number;
}

interface PendingRequest {
  id: string;
  method: string;
  path: string;
  timestamp: number;
  status: 'pending' | 'modifying' | 'completed';
  headers: Record<string, string>;
  body: unknown;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type Theme = 'light' | 'dark' | 'system';

interface AppState {
  // Existing state
  mockEndpoints: MockEndpoint[];
  currentProject: string;
  baseUrl: string;
  isLoading: boolean;
  error: string | null;
  theme: Theme;

  // Live Mock state
  activeClient: string | null;
  clients: Client[];
  connectionStatus: ConnectionStatus;
  pendingRequests: PendingRequest[];
  
  // Existing actions
  setMockEndpoints: (endpoints: MockEndpoint[]) => void;
  setCurrentProject: (project: string) => void;
  setBaseUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addMockEndpoint: (endpoint: MockEndpoint) => void;
  updateMockEndpoint: (endpoint: MockEndpoint) => void;
  deleteMockEndpoint: (id: string) => void;
  setTheme: (theme: Theme) => void;

  // Live Mock actions
  setActiveClient: (clientId: string | null) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  removeClient: (clientId: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addPendingRequest: (request: Omit<PendingRequest, 'id' | 'timestamp' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: PendingRequest['status']) => void;
  clearRequests: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Existing state
      mockEndpoints: [],
      currentProject: '',
      baseUrl: 'http://localhost:3000',
      isLoading: false,
      error: null,
      theme: 'system' as Theme,

      // Live Mock state
      activeClient: null,
      clients: [],
      connectionStatus: 'disconnected',
      pendingRequests: [],

      // Existing actions
      setMockEndpoints: (endpoints) => set({ mockEndpoints: endpoints }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      addMockEndpoint: (endpoint) =>
        set((state) => ({ mockEndpoints: [...state.mockEndpoints, endpoint] })),
      updateMockEndpoint: (endpoint) =>
        set((state) => ({
          mockEndpoints: state.mockEndpoints.map((e) =>
            e.id === endpoint.id ? endpoint : e
          ),
        })),
      deleteMockEndpoint: (id) =>
        set((state) => ({
          mockEndpoints: state.mockEndpoints.filter((e) => e.id !== id),
        })),
      setTheme: (theme) => {
        const root = document.documentElement;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
        
        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);
        set({ theme });
      },

      // Live Mock actions
      setActiveClient: (clientId) => set({ activeClient: clientId }),
      addClient: (client) =>
        set((state) => ({
          clients: [
            ...state.clients,
            { ...client, id: `client-${Date.now()}`, createdAt: Date.now() },
          ],
        })),
      removeClient: (clientId) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== clientId),
          activeClient: state.activeClient === clientId ? null : state.activeClient,
        })),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      addPendingRequest: (request) =>
        set((state) => ({
          pendingRequests: [
            {
              ...request,
              id: `req-${Date.now()}`,
              timestamp: Date.now(),
              status: 'pending',
            },
            ...state.pendingRequests,
          ],
        })),
      updateRequestStatus: (requestId, status) =>
        set((state) => ({
          pendingRequests: state.pendingRequests.map((req) =>
            req.id === requestId ? { ...req, status } : req
          ),
        })),
      clearRequests: () => set({ pendingRequests: [] }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);