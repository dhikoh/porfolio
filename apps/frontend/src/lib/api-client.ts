/**
 * API Client for Portfolio Frontend → NestJS Backend
 * Handles JWT token management, auto-refresh, and typed responses.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Token Storage (client-side only) ───
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: TokenPair) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_access_token', tokens.accessToken);
    localStorage.setItem('portfolio_refresh_token', tokens.refreshToken);
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('portfolio_access_token');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('portfolio_refresh_token');
  }
  return refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('portfolio_access_token');
    localStorage.removeItem('portfolio_refresh_token');
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ─── Auto-refresh logic ───
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rt}`,
        },
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const json: ApiResponse<TokenPair> = await res.json();
      if (json.success && json.data) {
        setTokens(json.data);
        return true;
      }
      clearTokens();
      return false;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Core fetch wrapper ───
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Sesi telah berakhir');
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

// ─── Server-side fetch (no auth, for SSR) ───
const SSR_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function serverFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${SSR_API_BASE}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

// ─── Typed API methods ───
export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; refreshToken: string; user: { id: string; email: string; name: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },
  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  // Profile
  getProfile: () => apiFetch<Record<string, unknown>>('/profile'),
  updateProfile: (data: Record<string, unknown>) => apiFetch('/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // Projects
  getProjects: (featured?: boolean) => apiFetch<Record<string, unknown>[]>(`/projects${featured !== undefined ? `?featured=${featured}` : ''}`),
  getProjectBySlug: (slug: string) => apiFetch<Record<string, unknown>>(`/projects/${slug}`),
  getAdminProjects: () => apiFetch<Record<string, unknown>[]>('/projects/admin/all'),
  createProject: (data: Record<string, unknown>) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Record<string, unknown>) => apiFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),

  // Skills
  getSkills: () => apiFetch<Record<string, unknown>[]>('/skills'),
  createSkill: (data: Record<string, unknown>) => apiFetch('/skills', { method: 'POST', body: JSON.stringify(data) }),
  updateSkill: (id: string, data: Record<string, unknown>) => apiFetch(`/skills/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSkill: (id: string) => apiFetch(`/skills/${id}`, { method: 'DELETE' }),

  // Experiences
  getExperiences: () => apiFetch<Record<string, unknown>[]>('/experiences'),
  createExperience: (data: Record<string, unknown>) => apiFetch('/experiences', { method: 'POST', body: JSON.stringify(data) }),
  updateExperience: (id: string, data: Record<string, unknown>) => apiFetch(`/experiences/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteExperience: (id: string) => apiFetch(`/experiences/${id}`, { method: 'DELETE' }),

  // Education
  getEducation: () => apiFetch<Record<string, unknown>[]>('/education'),
  createEducation: (data: Record<string, unknown>) => apiFetch('/education', { method: 'POST', body: JSON.stringify(data) }),
  updateEducation: (id: string, data: Record<string, unknown>) => apiFetch(`/education/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEducation: (id: string) => apiFetch(`/education/${id}`, { method: 'DELETE' }),

  // Timeline
  getTimeline: () => apiFetch<Record<string, unknown>[]>('/timeline'),
  createTimeline: (data: Record<string, unknown>) => apiFetch('/timeline', { method: 'POST', body: JSON.stringify(data) }),
  updateTimeline: (id: string, data: Record<string, unknown>) => apiFetch(`/timeline/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTimeline: (id: string) => apiFetch(`/timeline/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => apiFetch<Record<string, unknown>[]>('/stats'),
  createStat: (data: Record<string, unknown>) => apiFetch('/stats', { method: 'POST', body: JSON.stringify(data) }),
  updateStat: (id: string, data: Record<string, unknown>) => apiFetch(`/stats/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStat: (id: string) => apiFetch(`/stats/${id}`, { method: 'DELETE' }),

  // Process Steps
  getProcessSteps: () => apiFetch<Record<string, unknown>[]>('/process-steps'),
  createProcessStep: (data: Record<string, unknown>) => apiFetch('/process-steps', { method: 'POST', body: JSON.stringify(data) }),
  updateProcessStep: (id: string, data: Record<string, unknown>) => apiFetch(`/process-steps/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProcessStep: (id: string) => apiFetch(`/process-steps/${id}`, { method: 'DELETE' }),

  // Messages
  sendMessage: (data: Record<string, unknown>) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: () => apiFetch<Record<string, unknown>[]>('/messages'),
  updateMessage: (id: string, data: Record<string, unknown>) => apiFetch(`/messages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMessage: (id: string) => apiFetch(`/messages/${id}`, { method: 'DELETE' }),

  // Media
  getMedia: () => apiFetch<Record<string, unknown>[]>('/media'),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/media/upload', { method: 'POST', body: formData });
  },
  deleteMedia: (id: string) => apiFetch(`/media/${id}`, { method: 'DELETE' }),

  // Analytics
  trackPageView: (data: { path: string; userAgent?: string; referrer?: string }) => {
    fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  },
  getAnalytics: () => apiFetch<Record<string, unknown>>('/analytics'),

  // Settings
  getSettings: () => apiFetch<Record<string, string>>('/settings'),
  updateSettings: (settings: { key: string; value: string }[]) => apiFetch('/settings', { method: 'POST', body: JSON.stringify({ settings }) }),

  // Health
  getHealth: () => apiFetch<Record<string, unknown>>('/health'),
};
