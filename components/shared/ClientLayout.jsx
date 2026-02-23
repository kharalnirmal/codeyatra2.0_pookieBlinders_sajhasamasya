"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/shared/Navbar";
import AppLoader from "@/components/shared/AppLoader";
import { Toaster } from "sonner";

export default function ClientLayout({ children }) {
  return (
    <TooltipProvider>
      <AppLoader />
      <Navbar />
      <main className="pt-0 pb-20">{children}</main>
      <Toaster richColors position="top-center" />
    </TooltipProvider>
  );
}
