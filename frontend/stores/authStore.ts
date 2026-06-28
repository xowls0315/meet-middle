import { create } from "zustand";
import * as authApi from "@/lib/api/auth";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loadUser: (force?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  login: () => void;
}

let loadUserPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  loadUser: async (force = false) => {
    if (!force && loadUserPromise) {
      await loadUserPromise;
      return;
    }

    loadUserPromise = (async () => {
      try {
        set({ isLoading: true });
        const { user } = await authApi.loadSession(force);

        if (!user) {
          set({ user: null, isLoggedIn: false, isLoading: false });
          return;
        }

        set({ user, isLoggedIn: true, isLoading: false });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "SilentRateLimitError" || error.name === "SilentAuthError")
        ) {
          // 조용히 처리
        } else {
          console.error("사용자 정보 로드 오류:", error);
        }
        set({ user: null, isLoggedIn: false, isLoading: false });
        authApi.setAccessToken(null);
      }
    })();

    try {
      await loadUserPromise;
    } finally {
      loadUserPromise = null;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    } finally {
      set({ user: null, isLoggedIn: false });
    }
  },

  login: () => {
    authApi.startKakaoLogin();
  },
}));
