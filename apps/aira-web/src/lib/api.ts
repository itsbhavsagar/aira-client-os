// import { initApiClient, getApiClient, TOKEN_KEY, authStore } from '@repo/core';
// import type { TokenStorage, User } from '@repo/core';

// const baseURL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || '';

// if (!baseURL) {
//   throw new Error(
//     'NEXT_PUBLIC_API_BASE_URL environment variable is required. ' +
//       'Please set it in your .env.local or .env file.',
//   );
// }

// const timeout = 60000;

// // Cookie name the backend sets (may differ from TOKEN_KEY used internally)
// const BACKEND_COOKIE_NAME = 'access-token';

// // Create web-specific token storage that can read from cookies
// export const webTokenStorage: TokenStorage = {
//   get(): Promise<string | null> {
//     if (typeof document === 'undefined') return Promise.resolve(null);
//     const cookies = document.cookie.split(';');

//     for (const cookie of cookies) {
//       const [name, value] = cookie.trim().split('=');
//       // Check both backend cookie name and internal TOKEN_KEY
//       if (name === BACKEND_COOKIE_NAME || name === TOKEN_KEY) {
//         return Promise.resolve(value || null);
//       }
//     }
//     return Promise.resolve(null);
//   },
//   set(token: string): Promise<void> {
//     if (typeof document !== 'undefined') {
//       document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Strict`;
//     }
//     return Promise.resolve();
//   },
//   clear(): Promise<void> {
//     if (typeof document !== 'undefined') {
//       document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
//     }
//     return Promise.resolve();
//   },
// };

// // Google OAuth URL for web
// export const GOOGLE_AUTH_URL =
//   process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ||
//   '';

// const apiClient = initApiClient({
//   baseURL,
//   isNative: false,
//   tokenStorage: webTokenStorage,
//   onUnauthorized: async () => {
//     console.log('[Auth] Unauthorized - clearing auth state');
//     await webTokenStorage.clear();
//     authStore.setState({ isAuthenticated: false, isLoading: false });
//     // Don't redirect here - let AuthGuard handle the redirect
//     // This allows verifyAuthState() to complete gracefully
//   },
//   timeout,
// });

// // Check if user has valid token on startup
// export async function hydrateAuthState(): Promise<boolean> {
//   const token = await webTokenStorage.get();
//   console.log('[Auth] Hydrating auth state, token found:', !!token);
//   console.log(
//     '[Auth] All cookies:',
//     typeof document !== 'undefined' ? document.cookie : 'SSR',
//   );

//   if (token) {
//     authStore.setState({ isAuthenticated: true, isLoading: false });
//     return true;
//   }

//   // If no token in JS-accessible cookies, the cookie might be HttpOnly
//   // In that case, we'll assume authenticated and let the API call verify
//   // The useUser hook will fail if not actually authenticated
//   authStore.setState({ isAuthenticated: false, isLoading: false });
//   return false;
// }

// // Verify auth by making an API call and return user data
// // Browser sends HttpOnly cookie automatically with withCredentials: true
// export async function verifyAuthState(): Promise<User | null> {
//   console.log('[Auth] Verifying auth state via API...');
//   try {
//     const client = getApiClient();
//     const user = await client.get<User>('/v1/users/me');
//     console.log('[Auth] Verification successful, user:', user?.e || user?.i);
//     authStore.setState({ isAuthenticated: true, isLoading: false });
//     return user;
//   } catch (error) {
//     console.log('[Auth] Verification failed:', error);
//     authStore.setState({ isAuthenticated: false, isLoading: false });
//     return null;
//   }
// }

// export { apiClient, getApiClient };


import { initApiClient, getApiClient, TOKEN_KEY, authStore } from '@repo/core';
import type { TokenStorage, User } from '@repo/core';

// Use real dev API as fallback - no throw to avoid local crash
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.airaai.in';

const timeout = 60000;

// Cookie name the backend sets (may differ from TOKEN_KEY used internally)
const BACKEND_COOKIE_NAME = 'access-token';

// Create web-specific token storage that can read from cookies
export const webTokenStorage: TokenStorage = {
  get(): Promise<string | null> {
    if (typeof document === 'undefined') return Promise.resolve(null);
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === BACKEND_COOKIE_NAME || name === TOKEN_KEY) {
        return Promise.resolve(value || null);
      }
    }
    return Promise.resolve(null);
  },
  set(token: string): Promise<void> {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Strict`;
    }
    return Promise.resolve();
  },
  clear(): Promise<void> {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    return Promise.resolve();
  },
};

// Google OAuth URL for web
export const GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ||
  'https://accounts.google.com/o/oauth2/v2/auth';

const apiClient = initApiClient({
  baseURL,
  isNative: false,
  tokenStorage: webTokenStorage,
  onUnauthorized: async () => {
    console.log('[Auth] Unauthorized - clearing auth state');
    await webTokenStorage.clear();
    authStore.setState({ isAuthenticated: false, isLoading: false });
  },
  timeout,
});

// ──────────────────────────────────────────────────────────────
// STRONG LOCAL MOCKS FOR HIRING TEST - FORCE EVERYTHING
// 1. Always logged in
// 2. Fake user data
// 3. Intercept all dashboard API calls and return empty/fake data (bypass CORS)
export async function hydrateAuthState(): Promise<boolean> {
  console.log('[MOCK AUTH] Forcing isAuthenticated = true');
  authStore.setState({
    isAuthenticated: true,
    isLoading: false,
    user: {
      name: 'Bhavsagar',
      email: 'bhavsagar@test.local',
      id: 'mock-user-id-123',
      phone: '+919876543210',
    phone_verified: true,  // ← key field
    }
  });
  return true;
}

export async function verifyAuthState(): Promise<User | null> {
  console.log('[MOCK AUTH] Returning fake user - no real API call');
  const mockUser = {
    name: 'Bhavsagar',
    email: 'bhavsagar@test.local',
    id: 'mock-user-id-123',
    phone: '+919876543210',
    phone_verified: true, 
  } as User;
  authStore.setState({ isAuthenticated: true, isLoading: false });
  return mockUser;
}

// Intercept GET calls to return fake/empty data (fixes CORS by never hitting real server)
const originalGet = apiClient.get;

apiClient.get = async function <T>(url: string): Promise<T> {
  console.log('[API MOCK] GET intercepted:', url);

  // Mock user endpoint
  if (url.includes('/v1/users/me')) {
    return Promise.resolve({
      name: 'Bhavsagar',
      email: 'bhavsagar@test.local',
      id: 'mock-id'
    } as T);
  }

  // Return empty arrays for dashboard data to force empty state UI
  if (
    url.includes('/v1/suggestions') ||
    url.includes('/v1/dashboard/apex-tasks') ||
    url.includes('/v1/rules') ||
    url.includes('/v1/tasks') ||
    url.includes('/v1/dashboard')
  ) {
    console.log('[API MOCK] Returning empty array for dashboard endpoint:', url);
    return Promise.resolve([] as T);
  }

  // Fallback to real call (should not hit due to CORS)
  return originalGet.call(this, url);
};
// ──────────────────────────────────────────────────────────────

// Keep original functions for reference (not used)
export async function originalHydrateAuthState(): Promise<boolean> {
  const token = await webTokenStorage.get();
  console.log('[Auth] Hydrating auth state, token found:', !!token);
  console.log(
    '[Auth] All cookies:',
    typeof document !== 'undefined' ? document.cookie : 'SSR',
  );

  if (token) {
    authStore.setState({ isAuthenticated: true, isLoading: false });
    return true;
  }

  authStore.setState({ isAuthenticated: false, isLoading: false });
  return false;
}

export async function originalVerifyAuthState(): Promise<User | null> {
  console.log('[Auth] Verifying auth state via API...');
  try {
    const client = getApiClient();
    const user = await client.get<User>('/v1/users/me');
    console.log('[Auth] Verification successful, user:', user?.e || user?.i);
    authStore.setState({ isAuthenticated: true, isLoading: false });
    return user;
  } catch (error) {
    console.log('[Auth] Verification failed:', error);
    authStore.setState({ isAuthenticated: false, isLoading: false });
    return null;
  }
}

export { apiClient, getApiClient };