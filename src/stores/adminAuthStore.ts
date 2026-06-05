import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import { removeAuthCookie } from "../api/axios";

export type AdminRole = "super_admin" | "client_admin" | "support_admin";

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    avatar?: string;
    permissions: string[];
}

interface AdminAuthState {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    passwordExpired: boolean;
    login: (admin: AdminUser) => void;
    logout: () => void;
    setPasswordExpired: (expired: boolean) => void;
    hasPermission: (requiredRole: AdminRole | AdminRole[]) => boolean;
    isSuperAdmin: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set, get) => ({
            admin: null,
            isAuthenticated: false,
            passwordExpired: false,
            login: (admin) => set({admin, isAuthenticated: true}),
            setPasswordExpired: (expired) => set({passwordExpired: expired}),
            logout: () => { 
                removeAuthCookie();
                set({admin: null, isAuthenticated: false, passwordExpired: false});
            },
            hasPermission: (requiredRole) => {
                const {admin} = get();
                if (!admin) return false;
                if (admin.role === "super_admin") return true;
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                return roles.includes(admin.role);
            },
            isSuperAdmin: () => {
                const {admin} = get();
                if (!admin) return false;
                return admin.role === "super_admin" || admin.permissions.includes("all");
            },
        }),
        {
            name: "tmag-admin-auth",
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
);
