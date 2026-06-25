"use client";

import { useEffect } from "react";
import { registerDevConsoleApi } from "@/lib/devConsoleApi";

export default function DevConsoleApi() {
  useEffect(() => {
    registerDevConsoleApi();
  }, []);

  return null;
}
