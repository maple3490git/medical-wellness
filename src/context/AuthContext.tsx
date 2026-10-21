"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Role, Permission } from "@/lib/types";
import { users, findUserByEmail } from "@/data/users";
import { getRolePermissions } from "@/data/roles";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isRole: (...roles: Role[]) => boolean;
  demoLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => ({ ok: false, error: "Non initialisé" }),
  logout: () => {},
  hasPermission: () => false,
  isRole: () => false,
  demoLogin: () => {},
});

const PASSWORDS: Record<string, string> = {
  admin: "admin123",
  directeur: "directeur123",
  medecin: "medecin123",
  reception: "reception123",
  infirmier: "infirmier123",
  laboratoire: "labo123",
  comptabilite: "compta123",
  coach: "coach123",
  responsable: "respo123",
  employe: "employe123",
};

function passwordFor(user: User | undefined): string | null {
  if (!user) return null;
  return PASSWORDS[user.role] ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mw-user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = users.find((u) => u.id === parsed.id);
        if (found) setUser(found);
      } catch {
        localStorage.removeItem("mw-user");
      }
    }
  }, []);

  const login = (email: string, password: string) => {
    const found = findUserByEmail(email.trim());
    if (!found) {
      return { ok: false, error: "Aucun compte associé à cet e-mail." };
    }
    const expected = passwordFor(found);
    if (!expected || password !== expected) {
      return { ok: false, error: "Mot de passe incorrect." };
    }
    if (found.status !== "active") {
      return { ok: false, error: "Ce compte est désactivé." };
    }
    setUser(found);
    localStorage.setItem("mw-user", JSON.stringify({ id: found.id, role: found.role }));
    return { ok: true, user: found };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mw-user");
  };

  const demoLogin = (role: Role) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem("mw-user", JSON.stringify({ id: found.id, role: found.role }));
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return getRolePermissions(user.role).includes(permission);
  };

  const isRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isRole, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}