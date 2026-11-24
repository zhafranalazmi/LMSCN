"use client";

import { createContext, useContext, type ReactNode } from "react";

const SuperAdminContext = createContext(false);

export function SuperAdminProvider({
  isSuperAdmin,
  children,
}: {
  isSuperAdmin: boolean;
  children: ReactNode;
}) {
  return (
    <SuperAdminContext.Provider value={isSuperAdmin}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin(): boolean {
  return useContext(SuperAdminContext);
}
