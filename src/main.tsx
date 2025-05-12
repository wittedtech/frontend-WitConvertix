import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import FileUploaderAndPreview from "./pages/FileUploadAndPreview.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import ConvertedFiles from "./pages/ConvertedFiles.tsx";
import SocialLinks from "./pages/SocialLinks.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import Billing from "./pages/Billing.tsx";
import Notifications from "./pages/Notification.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route
            path="/witconvertix/file-uploaded"
            element={
              <FileUploaderAndPreview
                onFilesChange={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            }
          />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/social-links" element={<SocialLinks />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/converted-files" element={<ConvertedFiles />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </StrictMode>
);
