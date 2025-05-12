import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, LogIn } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const from = location.state?.from || "/witconvertix/file-uploaded";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error in Login!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    navigate("/signup", { state: { from: "login" } });
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password", { state: { from: "login" } });
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
            Login to WitConvertix
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="identifier"
                className="text-gray-800 dark:text-gray-200"
              >
                Username or Email
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <Label
                htmlFor="password"
                className="text-gray-800 dark:text-gray-200"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <LogIn className="mr-2 h-4 w-4" />{" "}
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
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
              Forgot your password?{" "}
              <button
                onClick={handleForgotPassword}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Reset Password
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
