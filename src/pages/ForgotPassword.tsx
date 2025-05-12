import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Lock, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [identifier, setIdentifier] = useState("");
  const [otpType, setOtpType] = useState<"email" | "mobile">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
    return score;
  };

  // Real-time validation
  const validateIdentifier = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-z0-9]{3,20}$/;
    if (!identifier) {
      setIdentifierError("Identifier is required");
    } else if (otpType === "email" && !emailRegex.test(identifier)) {
      setIdentifierError("Invalid email format");
    } else if (otpType === "mobile" && !usernameRegex.test(identifier)) {
      setIdentifierError("Invalid username format");
    } else {
      setIdentifierError("");
    }
  };

  const validatePassword = () => {
    const errors: string[] = [];
    if (newPassword) {
      if (newPassword.length < 8) errors.push("Minimum 8 characters required");
      if (!/[A-Z]/.test(newPassword))
        errors.push("At least one uppercase letter required");
      if (!/[a-z]/.test(newPassword))
        errors.push("At least one lowercase letter required");
      if (!/[0-9]/.test(newPassword))
        errors.push("At least one number required");
      if (!/[^A-Za-z0-9]/.test(newPassword))
        errors.push("At least one special character required");
      if (
        identifier &&
        newPassword.toLowerCase().includes(identifier.toLowerCase())
      )
        errors.push("Password cannot contain identifier");
    }
    setPasswordErrors(errors);
  };

  useEffect(() => {
    validateIdentifier();
  }, [identifier, otpType]);

  useEffect(() => {
    validatePassword();
  }, [newPassword, identifier]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    validateIdentifier();
    if (identifierError) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, type: otpType }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send OTP");
      }

      setSuccess(
        `OTP sent to your ${otpType}. Please check and enter it below.`
      );
      setStep("verify");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error ! Failed to Send OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("OTP must be 6 digits");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setError("Please fix password validation errors");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unknown Error During Password Reset."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    navigate("/signup", { state: { from: "forgot-password" } });
  };

  const handleLogin = () => {
    navigate("/login", { state: { from: "forgot-password" } });
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            x: location.state?.from === "signup" ? "-100%" : "100%",
            rotateY: location.state?.from === "signup" ? -90 : 90,
            boxShadow: "10px 10px 20px rgba(0,0,0,0.3)",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md"
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-6">
            Reset Password
          </h2>
          {step === "request" ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <Label
                  htmlFor="identifier"
                  className="text-gray-800 dark:text-gray-200"
                >
                  Email or Username
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                    identifierError ? "border-red-500" : ""
                  }`}
                />
                {identifierError && (
                  <p className="text-red-500 text-sm mt-1">{identifierError}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="otpType"
                  className="text-gray-800 dark:text-gray-200"
                >
                  OTP Method
                </Label>
                <Select
                  value={otpType}
                  onValueChange={(value) =>
                    setOtpType(value as "email" | "mobile")
                  }
                >
                  <SelectTrigger className="mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                    <SelectValue placeholder="Select OTP method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <Button
                type="submit"
                disabled={isSubmitting || !!identifierError}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              >
                <Lock className="mr-2 h-4 w-4" />{" "}
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <Label
                  htmlFor="otp"
                  className="text-gray-800 dark:text-gray-200"
                >
                  OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                    otpError ? "border-red-500" : ""
                  }`}
                />
                {otpError && (
                  <p className="text-red-500 text-sm mt-1">{otpError}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-gray-800 dark:text-gray-200"
                >
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                    passwordErrors.length > 0 ? "border-red-500" : ""
                  }`}
                />
                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        getPasswordStrength(newPassword) <= 40
                          ? "bg-red-500"
                          : getPasswordStrength(newPassword) <= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${getPasswordStrength(newPassword)}%` }}
                    />
                  </div>
                  {passwordErrors.map((err, index) => (
                    <p key={index} className="text-red-500 text-sm mt-1">
                      {err}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <Label
                  htmlFor="confirmNewPassword"
                  className="text-gray-800 dark:text-gray-200"
                >
                  Confirm New Password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                    newPassword &&
                    confirmNewPassword &&
                    newPassword !== confirmNewPassword
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <div className="mt-2 flex items-center">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        getPasswordStrength(confirmNewPassword) <= 40
                          ? "bg-red-500"
                          : getPasswordStrength(confirmNewPassword) <= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${getPasswordStrength(confirmNewPassword)}%`,
                      }}
                    />
                  </div>
                  {newPassword &&
                    confirmNewPassword &&
                    newPassword === confirmNewPassword && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <Button
                type="submit"
                disabled={
                  isSubmitting || !!otpError || passwordErrors.length > 0
                }
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              >
                <Lock className="mr-2 h-4 w-4" />{" "}
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={handleSignUp}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Sign Up
              </button>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Back to{" "}
              <button
                onClick={handleLogin}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Login
              </button>
            </p>
          </div>
          <Button
            onClick={handleHome}
            variant="outline"
            className="mt-4 w-full border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Home className="mr-2 h-4 w-4" /> Go to Home
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
