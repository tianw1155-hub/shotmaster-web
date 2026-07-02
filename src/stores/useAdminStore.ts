import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminLogin as loginApi } from '../services/apiService';

interface AdminState {
  token: string;
  username: string;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      token: '',
      username: '',
      isLoggedIn: false,
      login: async (username, password) => {
        const res = await loginApi(username, password);
        set({
          token: res.token,
          username: res.username,
          isLoggedIn: true,
        });
      },
      logout: () => {
        set({
          token: '',
          username: '',
          isLoggedIn: false,
        });
      },
    }),
    {
      name: 'shotmaster_admin_storage',
    }
  )
);
