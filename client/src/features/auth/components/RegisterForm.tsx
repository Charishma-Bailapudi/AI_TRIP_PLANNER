import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerSchema } from "../../../../../shared/src/validation/auth.schema";
import { KeyRound, Mail, User, ShieldAlert, Loader } from "lucide-react";

export const RegisterForm: React.FC = () => {
  const { register, error: apiError, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidationErrors({});
    clearError();
    setSubmitting(true);

    const parseResult = registerSchema.safeParse({ name, email, password });

    if (!parseResult.success) {
      const fieldErrors: { [key: string]: string } = {};
      parseResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setValidationErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      await register(parseResult.data);
      navigate("/dashboard");
    } catch (err) {
      // API error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4">
      <div className="glass-panel p-8 max-w-md w-full relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primaryCyan/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-headings font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-sm text-gray-400 mt-2">Start planning your personalized trips</p>
        </div>

        {/* Global Error Banner */}
        {(apiError || Object.keys(validationErrors).length > 0) && (
          <div className="mb-6 p-4 bg-alertRose/10 border border-alertRose/20 rounded-xl flex gap-3 text-alertRose text-sm items-start">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registration failed</p>
              <p className="opacity-95">{apiError || "Please fix validation errors below."}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="w-full bg-darkBg/60 border border-glassBorder rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primaryIndigo focus:ring-1 focus:ring-primaryIndigo transition-all disabled:opacity-50"
              />
            </div>
            {validationErrors.name && (
              <span className="text-xs text-alertRose mt-1 block">{validationErrors.name}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="w-full bg-darkBg/60 border border-glassBorder rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primaryIndigo focus:ring-1 focus:ring-primaryIndigo transition-all disabled:opacity-50"
              />
            </div>
            {validationErrors.email && (
              <span className="text-xs text-alertRose mt-1 block">{validationErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 spec char"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full bg-darkBg/60 border border-glassBorder rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primaryIndigo focus:ring-1 focus:ring-primaryIndigo transition-all disabled:opacity-50"
              />
            </div>
            {validationErrors.password && (
              <span className="text-xs text-alertRose mt-1 block">{validationErrors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} className="btn-gradient w-full py-3 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-glassBorder pt-6">
          <p className="text-sm text-gray-400">
            Already planning?{" "}
            <Link to="/login" className="text-primaryCyan hover:underline font-medium">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
