import { create } from 'zustand';
import { formatDistanceToNow } from 'date-fns';

export interface Vulnerability {
  critical: number;
  high: number;
  medium: number;
}

export interface ContainerImage {
  id: string;
  name: string;
  vulnerabilities: Vulnerability;
  lastScan: string;
  status: 'Scanning' | 'Complete' | 'Failed';
  timestamp: Date;
}

interface Stats {
  totalImages: { value: number; change: number; period: string };
  criticalIssues: { value: number; change: number; period: string };
  highRisk: { value: number; change: number; period: string };
  scannedToday: { value: number; change: number; period: string };
}

interface ScanState {
  images: ContainerImage[];
  stats: Stats;
  filters: {
    search: string;
    severity: string;
    lastScan: string;
  };
  setFilters: (filters: Partial<ScanState['filters']>) => void;
  addImage: (image: Omit<ContainerImage, 'lastScan' | 'timestamp'>) => void;
  updateImageStatus: (id: string, status: ContainerImage['status']) => void;
  updateStats: (newStats: Partial<Stats>) => void;
}

// Simulate WebSocket updates
const simulateRealtimeUpdates = (set: any) => {
  setInterval(() => {
    set((state: ScanState) => {
      const randomImage = state.images[Math.floor(Math.random() * state.images.length)];
      if (randomImage) {
        return {
          images: state.images.map(img =>
            img.id === randomImage.id
              ? {
                  ...img,
                  status: img.status === 'Scanning' ? 'Complete' : 'Scanning',
                  timestamp: new Date(),
                }
              : img
          ),
        };
      }
      return state;
    });
  }, 5000);
};

export const useScanStore = create<ScanState>((set) => {
  // Initialize store with mock data
  const initialState: Partial<ScanState> = {
    images: [
      {
        id: '1',
        name: 'nginx:latest',
        vulnerabilities: { critical: 3, high: 5, medium: 12 },
        status: 'Scanning',
        timestamp: new Date(),
        lastScan: formatDistanceToNow(new Date(), { addSuffix: true }),
      },
      {
        id: '2',
        name: 'redis:6.2',
        vulnerabilities: { critical: 1, high: 3, medium: 8 },
        status: 'Complete',
        timestamp: new Date(Date.now() - 3600000),
        lastScan: formatDistanceToNow(new Date(Date.now() - 3600000), { addSuffix: true }),
      },
    ],
    stats: {
      totalImages: { value: 1234, change: 12, period: 'last month' },
      criticalIssues: { value: 45, change: -8, period: 'last month' },
      highRisk: { value: 128, change: -15, period: 'last month' },
      scannedToday: { value: 89, change: 23, period: 'yesterday' },
    },
    filters: {
      search: '',
      severity: 'all',
      lastScan: 'all',
    },
  };

  // Start simulated real-time updates
  simulateRealtimeUpdates(set);

  return {
    ...initialState,
    setFilters: (filters) =>
      set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
    addImage: (image) =>
      set((state) => ({
        images: [
          {
            ...image,
            timestamp: new Date(),
            lastScan: formatDistanceToNow(new Date(), { addSuffix: true }),
          },
          ...state.images,
        ],
      })),
    updateImageStatus: (id, status) =>
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? {
                ...img,
                status,
                timestamp: new Date(),
                lastScan: formatDistanceToNow(new Date(), { addSuffix: true }),
              }
            : img
        ),
      })),
    updateStats: (newStats) =>
      set((state) => ({
        stats: { ...state.stats, ...newStats },
      })),
  };
});