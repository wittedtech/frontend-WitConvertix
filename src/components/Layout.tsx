// components/Layout.tsx
import React from "react";
import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1">
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b bg-white dark:bg-gray-900 z-10 w-full">
          <SidebarTrigger className="ml-4" />
          <Breadcrumb />
        </header>
        <main className="p-4 mt-16 ml-14rem">{children}</main>
      </SidebarInset>
      <Footer />
    </div>
  );
};

export default Layout;
