// App.tsx
import { Outlet } from "react-router-dom";
import "./App.css";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import Layout from "./components/Layout";

function App() {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <Layout>
          <Outlet />
        </Layout>
      </div>
    </SidebarProvider>
  );
}

export default App;
