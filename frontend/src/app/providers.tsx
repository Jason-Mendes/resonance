"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { queryClient } from "@/lib/query-client";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
