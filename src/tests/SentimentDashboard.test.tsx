/**
 * Unit tests for SentimentDashboard page.
 * Feature: spa-ai-features
 * Validates: Requirements 11.1, 11.2, 11.3, 11.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ─── Mock next/navigation ─────────────────────────────────────────────────────
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// ─── Mock useAuth ─────────────────────────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// ─── Mock useModel ────────────────────────────────────────────────────────────
vi.mock('@/hooks/useModel', () => ({
  useModel: () => ({ options: [] }),
}));

// ─── Mock useSentimentRealtime ────────────────────────────────────────────────
const mockUseSentimentRealtime = vi.fn();
vi.mock('@/hooks/useSentimentRealtime', () => ({
  useSentimentRealtime: (...args: unknown[]) => mockUseSentimentRealtime(...args),
}));

// ─── Mock @tanstack/react-query (useQuery only) ───────────────────────────────
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
  };
});

// ─── Mock recharts ────────────────────────────────────────────────────────────
vi.mock('recharts', () => ({
  AreaChart: ({ children, 'data-testid': testId }: { children?: React.ReactNode; 'data-testid'?: string }) =>
    React.createElement('div', { 'data-testid': testId ?? 'area-chart' }, children),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  CartesianGrid: () => null,
}));

// ─── Mock tailwindcss/colors (used in the page for chart colors) ──────────────
vi.mock('tailwindcss/colors', () => ({
  default: { sky: { 500: '#0ea5e9' } },
}));

// ─── Mock UI components that have complex dependencies ───────────────────────
vi.mock('@/ui/card', () => ({
  Card: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    React.createElement('div', { className }, children),
  CardHeader: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    React.createElement('div', { className }, children),
  CardTitle: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    React.createElement('div', { className }, children),
  CardContent: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    React.createElement('div', { className }, children),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    React.createElement('span', { className }, children),
}));

vi.mock('@/components/shared/AppSelect', () => ({
  AppSelect: ({ value, onValueChange, placeholder }: { value: string; onValueChange: (v: string) => void; placeholder?: string }) =>
    React.createElement('select', {
      value,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onValueChange(e.target.value),
      'aria-label': placeholder,
    }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const ADMIN_USER = {
  id: 1,
  username: 'manager1',
  type: 'ADMIN',
  employee: { id: 10, name: 'Alice', branch_id: 2, gender: 'F' },
  branch: { id: 2, name: 'Main Branch' },
  branches: [],
};

const STAFF_USER = {
  id: 2,
  username: 'cashier1',
  type: 'CASHIER',
  employee: { id: 11, name: 'Bob', branch_id: 2, gender: 'M' },
  branch: { id: 2, name: 'Main Branch' },
  branches: [],
};

const MOCK_DASHBOARD_DATA = {
  averageScore: 0.72,
  labelDistribution: { positive: 40, neutral: 10, negative: 5 },
  timeSeries: [
    { date: '2025-06-01', averageScore: 0.65 },
    { date: '2025-06-02', averageScore: 0.80 },
  ],
  aiSummary: 'Customers are generally satisfied with treatments.',
  recentNegative: [
    {
      customerFirstName: 'Jane',
      treatmentName: 'Deep Tissue Massage',
      sentimentScore: -0.75,
      comment: 'Too much pressure, felt uncomfortable.',
    },
    {
      customerFirstName: 'Tom',
      treatmentName: 'Facial',
      sentimentScore: -0.50,
      comment: 'Products caused irritation.',
    },
  ],
};

async function renderDashboard() {
  // Dynamic import so mocks are applied before module loads
  const { default: SentimentDashboard } = await import(
    '@/app/(dashboard)/dashboard/sentiment/page'
  );
  return render(
    <Wrapper>
      <SentimentDashboard />
    </Wrapper>
  );
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockReplace.mockReset();

  // Default: manager user, not loading
  mockUseAuth.mockReturnValue({ user: ADMIN_USER, loading: false });

  // Default: realtime hook returns no polling
  mockUseSentimentRealtime.mockReturnValue({ refetchInterval: false });

  // Default: useQuery returns dashboard data for first call, summary for second
  let callCount = 0;
  mockUseQuery.mockImplementation((options: { queryKey: unknown[] }) => {
    const key = options?.queryKey?.[0];
    if (key === 'sentiment-dashboard') {
      return { data: MOCK_DASHBOARD_DATA, isLoading: false };
    }
    if (key === 'sentiment-summary') {
      return { data: { summary: MOCK_DASHBOARD_DATA.aiSummary }, isLoading: false };
    }
    callCount++;
    return { data: undefined, isLoading: false };
  });
});

// ─── Test 1: Renders average score ───────────────────────────────────────────

describe('SentimentDashboard — renders average score', () => {
  it('displays the average sentiment score when data is available', async () => {
    await renderDashboard();

    expect(screen.getByText('0.72')).toBeDefined();
  });

  it('renders the "Average Score" card heading', async () => {
    await renderDashboard();

    expect(screen.getByText(/Average Score/i)).toBeDefined();
  });
});

// ─── Test 2: Renders label distribution ──────────────────────────────────────

describe('SentimentDashboard — renders label distribution', () => {
  it('displays positive count', async () => {
    await renderDashboard();

    // The positive count "40" should appear in the Positive card
    const positiveHeading = screen.getByText(/^Positive$/i);
    expect(positiveHeading).toBeDefined();
    expect(screen.getByText('40')).toBeDefined();
  });

  it('displays neutral count', async () => {
    await renderDashboard();

    expect(screen.getByText(/^Neutral$/i)).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
  });

  it('displays negative count', async () => {
    await renderDashboard();

    expect(screen.getByText(/^Negative$/i)).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('displays percentage of total for positive', async () => {
    await renderDashboard();

    // 40 / (40+10+5) = 72.7%
    expect(screen.getByText(/72\.7% of total/i)).toBeDefined();
  });
});

// ─── Test 3: Renders AI summary ──────────────────────────────────────────────

describe('SentimentDashboard — renders AI summary', () => {
  it('displays the AI summary text', async () => {
    await renderDashboard();

    expect(
      screen.getByText('Customers are generally satisfied with treatments.')
    ).toBeDefined();
  });

  it('renders the "AI Summary" section heading', async () => {
    await renderDashboard();

    expect(screen.getByText(/AI Summary/i)).toBeDefined();
  });

  it('shows fallback text when no summary is available', async () => {
    mockUseQuery.mockImplementation((options: { queryKey: unknown[] }) => {
      const key = options?.queryKey?.[0];
      if (key === 'sentiment-dashboard') {
        return { data: MOCK_DASHBOARD_DATA, isLoading: false };
      }
      if (key === 'sentiment-summary') {
        return { data: { summary: '' }, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });

    await renderDashboard();

    expect(screen.getByText(/No summary available/i)).toBeDefined();
  });
});

// ─── Test 4: Renders recent negative feedback list ───────────────────────────

describe('SentimentDashboard — renders recent negative feedback list', () => {
  it('displays the "Recent Negative Feedback" section heading', async () => {
    await renderDashboard();

    expect(screen.getByText(/Recent Negative Feedback/i)).toBeDefined();
  });

  it('displays customer first name for each negative feedback item', async () => {
    await renderDashboard();

    expect(screen.getByText('Jane')).toBeDefined();
    expect(screen.getByText('Tom')).toBeDefined();
  });

  it('displays treatment name for each negative feedback item', async () => {
    await renderDashboard();

    expect(screen.getByText('Deep Tissue Massage')).toBeDefined();
    expect(screen.getByText('Facial')).toBeDefined();
  });

  it('displays sentiment score for each negative feedback item', async () => {
    await renderDashboard();

    expect(screen.getByText('-0.75')).toBeDefined();
    expect(screen.getByText('-0.50')).toBeDefined();
  });

  it('displays comment text for each negative feedback item', async () => {
    await renderDashboard();

    expect(screen.getByText('Too much pressure, felt uncomfortable.')).toBeDefined();
    expect(screen.getByText('Products caused irritation.')).toBeDefined();
  });

  it('shows fallback text when no negative feedback exists', async () => {
    mockUseQuery.mockImplementation((options: { queryKey: unknown[] }) => {
      const key = options?.queryKey?.[0];
      if (key === 'sentiment-dashboard') {
        return {
          data: { ...MOCK_DASHBOARD_DATA, recentNegative: [] },
          isLoading: false,
        };
      }
      if (key === 'sentiment-summary') {
        return { data: { summary: MOCK_DASHBOARD_DATA.aiSummary }, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });

    await renderDashboard();

    expect(screen.getByText(/No negative feedback found/i)).toBeDefined();
  });
});

// ─── Test 5: Renders time-series chart ───────────────────────────────────────

describe('SentimentDashboard — renders time-series chart', () => {
  it('renders the Recharts ResponsiveContainer (chart wrapper)', async () => {
    await renderDashboard();

    expect(screen.getByTestId('responsive-container')).toBeDefined();
  });

  it('renders the AreaChart inside the chart section', async () => {
    await renderDashboard();

    expect(screen.getByTestId('area-chart')).toBeDefined();
  });

  it('renders the "Sentiment Trend" chart heading', async () => {
    await renderDashboard();

    expect(screen.getByText(/Sentiment Trend/i)).toBeDefined();
  });
});

// ─── Test 6: Filter change triggers re-fetch (queryKey changes) ───────────────

describe('SentimentDashboard — filter change triggers re-fetch', () => {
  it('passes filter params as part of the queryKey', async () => {
    await renderDashboard();

    // Verify useQuery was called with a queryKey that includes filterParams
    const dashboardCall = mockUseQuery.mock.calls.find(
      (call) => call[0]?.queryKey?.[0] === 'sentiment-dashboard'
    );
    expect(dashboardCall).toBeDefined();
    // queryKey should be ['sentiment-dashboard', filterParams]
    expect(dashboardCall![0].queryKey).toHaveLength(2);
    expect(dashboardCall![0].queryKey[1]).toMatchObject({ period: '30' });
  });

  it('includes period in the queryKey', async () => {
    await renderDashboard();

    const dashboardCall = mockUseQuery.mock.calls.find(
      (call) => call[0]?.queryKey?.[0] === 'sentiment-dashboard'
    );
    expect(dashboardCall![0].queryKey[1]).toHaveProperty('period');
  });

  it('includes branch_id, treatment_id, therapist_id in the queryKey', async () => {
    await renderDashboard();

    const dashboardCall = mockUseQuery.mock.calls.find(
      (call) => call[0]?.queryKey?.[0] === 'sentiment-dashboard'
    );
    const filterParams = dashboardCall![0].queryKey[1];
    // When no filter is selected, these are undefined (not included)
    expect(filterParams).toHaveProperty('period');
    // branch_id, treatment_id, therapist_id are undefined when not selected
    expect(filterParams.branch_id).toBeUndefined();
    expect(filterParams.treatment_id).toBeUndefined();
    expect(filterParams.therapist_id).toBeUndefined();
  });
});

// ─── Test 7: Real-time update — useSentimentRealtime called with branchId ─────

describe('SentimentDashboard — real-time updates via useSentimentRealtime', () => {
  it('calls useSentimentRealtime with null when no branch filter is selected', async () => {
    await renderDashboard();

    expect(mockUseSentimentRealtime).toHaveBeenCalledWith(null);
  });

  it('passes refetchInterval from useSentimentRealtime to useQuery', async () => {
    // Simulate WebSocket disconnected → polling at 30s
    mockUseSentimentRealtime.mockReturnValue({ refetchInterval: 30000 });

    await renderDashboard();

    const dashboardCall = mockUseQuery.mock.calls.find(
      (call) => call[0]?.queryKey?.[0] === 'sentiment-dashboard'
    );
    expect(dashboardCall![0].refetchInterval).toBe(30000);
  });

  it('passes refetchInterval=false when WebSocket is connected', async () => {
    mockUseSentimentRealtime.mockReturnValue({ refetchInterval: false });

    await renderDashboard();

    const dashboardCall = mockUseQuery.mock.calls.find(
      (call) => call[0]?.queryKey?.[0] === 'sentiment-dashboard'
    );
    expect(dashboardCall![0].refetchInterval).toBe(false);
  });
});

// ─── Test 8: Manager-only route redirects non-manager staff ──────────────────

describe('SentimentDashboard — manager-only access control', () => {
  it('redirects non-manager staff to /dashboard', async () => {
    mockUseAuth.mockReturnValue({ user: STAFF_USER, loading: false });

    await renderDashboard();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('renders nothing visible for non-manager after redirect', async () => {
    mockUseAuth.mockReturnValue({ user: STAFF_USER, loading: false });

    await renderDashboard();

    // The component returns null for non-managers — no dashboard content rendered
    expect(screen.queryByText(/Sentiment Dashboard/i)).toBeNull();
    expect(screen.queryByText(/Average Score/i)).toBeNull();
  });

  it('does not redirect manager users', async () => {
    mockUseAuth.mockReturnValue({ user: ADMIN_USER, loading: false });

    await renderDashboard();

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows loading state while auth is resolving', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    await renderDashboard();

    expect(screen.getByText(/Loading/i)).toBeDefined();
  });

  it('queries are disabled for non-manager users', async () => {
    mockUseAuth.mockReturnValue({ user: STAFF_USER, loading: false });

    await renderDashboard();

    const dashboardCall = mockUseQuery.mock.calls.find(
      (call) => call[0]?.queryKey?.[0] === 'sentiment-dashboard'
    );
    // enabled should be false for non-managers
    expect(dashboardCall![0].enabled).toBe(false);
  });
});
