import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  otpLoading: boolean;
  error: string | null;
  step: 1 | 2; // 1 = email+name form, 2 = OTP form
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredRefresh = () => localStorage.getItem(REFRESH_KEY);

const persistTokens = (access: string, refresh?: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

/* ─── Initial State ──────────────────────────────────────────────────────── */
const initialState: AuthState = {
  user: null,
  accessToken: getStoredToken(),
  refreshToken: getStoredRefresh(),
  loading: false,
  otpLoading: false,
  error: null,
  step: 1,
};

/* ─── Async Thunks ───────────────────────────────────────────────────────── */

// Step 1 — send OTP
export const generateOtp = createAsyncThunk(
  'auth/generateOtp',
  async (payload: { email: string; name: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.generateOtp(payload);
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ??
        err?.response?.data?.message ??
        'Failed to send OTP';
      return rejectWithValue(msg);
    }
  }
);

// Step 2 — verify OTP and get tokens
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.verifyOtp(payload);
      // Expect: { accessToken, refreshToken, user }
      return data as { accessToken: string; refreshToken?: string; user: User };
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ??
        err?.response?.data?.message ??
        'OTP verification failed';
      return rejectWithValue(msg);
    }
  }
);

/* ─── Slice ──────────────────────────────────────────────────────────────── */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manually set tokens (e.g., after refresh)
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
      persistTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    // Set user info
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    // Clear all auth state (logout)
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.step = 1;
      clearTokens();
    },
    // Reset OTP step back to login form
    resetStep(state) {
      state.step = 1;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ── generateOtp ── */
    builder
      .addCase(generateOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(generateOtp.fulfilled, (state) => {
        state.otpLoading = false;
        state.step = 2;
      })
      .addCase(generateOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload as string;
      });

    /* ── verifyOtp ── */
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.user = action.payload.user;
        persistTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTokens, setUser, logout, resetStep, clearError } = authSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectOtpLoading = (state: { auth: AuthState }) => state.auth.otpLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthStep = (state: { auth: AuthState }) => state.auth.step;

export default authSlice.reducer;
