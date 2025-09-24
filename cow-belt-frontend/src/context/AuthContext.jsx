import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY_USERS = "cowbelt_users";
const STORAGE_KEY_ACTIVE = "cowbelt_active_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS);
      if (raw) return JSON.parse(raw);
      return [
        { id: "admin", name: "Admin", role: "admin" },
        { id: "viewer", name: "Viewer", role: "viewer" }
      ];
    } catch {
      return [{ id: "admin", name: "Admin", role: "admin" }];
    }
  });
  const [activeUserId, setActiveUserId] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_ACTIVE) || "admin"; } catch { return "admin"; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users)); } catch {}
  }, [users]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_ACTIVE, activeUserId); } catch {}
  }, [activeUserId]);

  const currentUser = useMemo(() => users.find(u => u.id === activeUserId) || users[0], [users, activeUserId]);

  const addUser = (user) => {
    setUsers((prev) => [...prev, user]);
  };
  const updateUser = (id, patch) => {
    setUsers((prev) => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  };
  const removeUser = (id) => {
    setUsers((prev) => prev.filter(u => u.id !== id));
    if (activeUserId === id) {
      setActiveUserId((prev) => (prev === id ? (users.find(u => u.id !== id)?.id || "") : prev));
    }
  };
  const loginAs = (id) => setActiveUserId(id);
  const hasRole = (role) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    return currentUser.role === role;
  };

  const value = { users, currentUser, addUser, updateUser, removeUser, loginAs, hasRole };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


