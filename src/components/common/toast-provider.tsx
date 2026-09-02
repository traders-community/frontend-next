"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";
import "react-toastify/dist/ReactToastify.css";

export function AppToastContainer() {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
