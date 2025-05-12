import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, UserPlus, CheckCircle } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

export default function SignUp() {
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
  useEffect(() => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      email && !emailRegex.test(email) ? "Invalid email format" : ""
    );

    // Mobile validation
    setMobileError(
      mobile && !isValidPhoneNumber(mobile) ? "Invalid mobile number" : ""
    );

    // Password validation
    const errors: string[] = [];
    if (password) {
      if (password.length < 8) errors.push("Minimum 8 characters required");
      if (!/[A-Z]/.test(password))
        errors.push("At least one uppercase letter required");
      if (!/[a-z]/.test(password))
        errors.push("At least one lowercase letter required");
      if (!/[0-9]/.test(password)) errors.push("At least one number required");
      if (!/[^A-Za-z0-9]/.test(password))
        errors.push("At least one special character required");
      if (fullName && password.toLowerCase().includes(fullName.toLowerCase()))
        errors.push("Password cannot contain full name");
      if (username && password.toLowerCase().includes(username.toLowerCase()))
        errors.push("Password cannot contain username");
      if (
        email &&
        password.toLowerCase().includes(email.toLowerCase().split("@")[0])
      )
        errors.push("Password cannot contain email");
      if (mobile && password.includes(mobile.slice(-4)))
        errors.push("Password cannot contain mobile number");
    }
    setPasswordErrors(errors);
  }, [fullName, username, email, mobile, password]);

  // Autofill username
  useEffect(() => {
    if (fullName) {
      const suggestedUsername = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20);
      setUsername(suggestedUsername);
    } else {
      setUsername("");
    }
  }, [fullName]);

  // Check username availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/check-username?username=${username}`
        );
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (err) {
        setUsernameAvailable(null);
        console.error(err);
      }
    };

    const timeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!usernameAvailable) {
      setError("Username is not available");
      setIsSubmitting(false);
      return;
    }

    if (emailError || mobileError || passwordErrors.length > 0) {
      setError("Please fix validation errors");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          name: fullName,
          mobile,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error Catched During Registration!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigate("/login", { state: { from: "signup" } });
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
            x: ["login", "forgot-password"].includes(location.state?.from || "")
              ? "-100%"
              : "100%",
            rotateY: ["login", "forgot-password"].includes(
              location.state?.from || ""
            )
              ? -90
              : 90,
            boxShadow: "10px 10px 20px rgba(0,0,0,0.3)",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md"
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-6">
            Sign Up for WitConvertix
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="fullName"
                className="text-gray-800 dark:text-gray-200"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <Label
                htmlFor="username"
                className="text-gray-800 dark:text-gray-200"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                  )
                }
                required
                className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                  usernameAvailable === false
                    ? "border-red-500"
                    : usernameAvailable
                    ? "border-green-500"
                    : ""
                }`}
              />
              {usernameAvailable === false && (
                <p className="text-red-500 text-sm mt-1">Username is taken</p>
              )}
              {usernameAvailable === true && (
                <p className="text-green-500 text-sm mt-1">
                  Username is available
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="email"
                className="text-gray-800 dark:text-gray-200"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                  emailError ? "border-red-500" : ""
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="mobile"
                className="text-gray-800 dark:text-gray-200"
              >
                Mobile
              </Label>
              <PhoneInput
                id="mobile"
                international
                defaultCountry="IN"
                value={mobile}
                onChange={(value) => setMobile(value || "")}
                className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md ${
                  mobileError ? "border-red-500" : ""
                }`}
                required
              />
              {mobileError && (
                <p className="text-red-500 text-sm mt-1">{mobileError}</p>
              )}
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
                className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                  passwordErrors.length > 0 ? "border-red-500" : ""
                }`}
              />
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      getPasswordStrength(password) <= 40
                        ? "bg-red-500"
                        : getPasswordStrength(password) <= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${getPasswordStrength(password)}%` }}
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
                htmlFor="confirmPassword"
                className="text-gray-800 dark:text-gray-200"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`mt-1 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                  password && confirmPassword && password !== confirmPassword
                    ? "border-red-500"
                    : ""
                }`}
              />
              <div className="mt-2 flex items-center">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      getPasswordStrength(confirmPassword) <= 40
                        ? "bg-red-500"
                        : getPasswordStrength(confirmPassword) <= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${getPasswordStrength(confirmPassword)}%`,
                    }}
                  />
                </div>
                {password &&
                  confirmPassword &&
                  password === confirmPassword && (
                    <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                  )}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !usernameAvailable ||
                emailError != "" ||
                mobileError != "" ||
                passwordErrors.length > 0
              }
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <UserPlus className="mr-2 h-4 w-4" />{" "}
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
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
