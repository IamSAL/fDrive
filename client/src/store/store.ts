import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MockEndpoint } from '../types/dto';

export interface DeviceFingerprint {
  id: string; // generated from IP+UA hash or similar
  ip: string;
  browser: string;
  os: string;
  device: string;
  name?: string; // user-friendly label
  lastSeen: number;
}

export interface PendingRequest {
  id: string;
  method: string;
  path: string;
  timestamp: number;
  status: 'pending' | 'modifying' | 'completed' | 'timedout';
  headers: Record<string, string>;
  body: unknown;
  deviceId: string; // fingerprint id
  endpointId?: string;
  timeStarted: number;
  timeLeft: number; // seconds left before auto-response
  autoRespondAt: number; // timestamp
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
  deviceFingerprints: DeviceFingerprint[];
  activeDevice: string | null;
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
  setDeviceFingerprints: (list: DeviceFingerprint[]) => void;
  setActiveDevice: (id: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addPendingRequest: (request: Omit<PendingRequest, 'id' | 'timestamp' | 'status' | 'timeStarted' | 'autoRespondAt' | 'timeLeft'>) => void;
  updateRequestStatus: (requestId: string, status: PendingRequest['status']) => void;
  clearRequests: () => void;
  tickPendingRequests: () => void;
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
      deviceFingerprints: [],
      activeDevice: null,
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
      setDeviceFingerprints: (list) => set({ deviceFingerprints: list }),
      setActiveDevice: (id) => set({ activeDevice: id }),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      addPendingRequest: (request) => set((state) => {
        const now = Date.now();
        const autoRespondAt = now + 2 * 60 * 1000; // 2 min
        return {
          pendingRequests: [
            {
              ...request,
              id: `req-${now}`,
              timestamp: now,
              status: 'pending',
              timeStarted: now,
              autoRespondAt,
              timeLeft: 120,
            },
            ...state.pendingRequests,
          ],
        };
      }),
      updateRequestStatus: (requestId, status) => set((state) => ({
        pendingRequests: state.pendingRequests.map((req) =>
          req.id === requestId ? { ...req, status } : req
        ),
      })),
      clearRequests: () => set({ pendingRequests: [] }),
      // Tick down timers, auto-complete timed out requests
      tickPendingRequests: () => set((state) => {
        const now = Date.now();
        return {
          pendingRequests: state.pendingRequests.map((req) => {
            if (req.status !== 'pending') return req;
            const timeLeft = Math.max(0, Math.floor((req.autoRespondAt - now) / 1000));
            if (timeLeft === 0 && req.status === 'pending') {
              // Mark as timed out
              return { ...req, status: 'timedout', timeLeft: 0 };
            }
            return { ...req, timeLeft };
          }),
        };
      }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Utility to get the current Zustand store state without using the hook
export function getAppState(): AppState {
  return useAppStore.getState();
}