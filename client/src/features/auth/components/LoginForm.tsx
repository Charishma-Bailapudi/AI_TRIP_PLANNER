import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../../../../../shared/src/validation/auth.schema";
import { KeyRound, Mail, ShieldAlert, Loader, Compass } from "lucide-react";

export const LoginForm: React.FC = () => {
  const { login, error: apiError, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidationErrors({});
    clearError();
    setSubmitting(true);

    const parseResult = loginSchema.safeParse({ email, password });

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
      await login(parseResult.data);
      navigate("/dashboard");
    } catch (err) {
      // API error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-darkBg text-gray-100">
      {/* Left Column: Innovative Hero Visual (Indian Travel Theme reference to Mindtrip) */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-b from-[#1a1b36] via-[#2f1f3a] to-[#5a2e37]">
        {/* Background Hero Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity hover:mix-blend-normal hover:opacity-60 transition-all duration-700" 
          style={{ backgroundImage: `url('/indian_travel_hero.png')` }}
        />
        
        {/* Saffron & Indigo Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primaryCyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <Compass className="h-8 w-8 text-primaryCyan animate-pulse" />
          <span className="font-headings font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-amber-200 bg-clip-text text-transparent">
            AI Trip Planner
          </span>
        </div>

        {/* Hero Copy (Indian Travel Theme) */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
            🇮🇳 Crafted for Indian Travelers
          </span>
          <h1 className="text-5xl lg:text-6xl font-headings font-black tracking-tight leading-none text-white">
            Chalo, Let's Plan Your Next <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-primaryCyan bg-clip-text text-transparent">Safar</span>.
          </h1>
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            An AI-powered travel planner built to design your perfect itinerary. Seamlessly organize flight options, train routes, and last-mile transfers across India all in one unified, modern dashboard.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-500 font-medium">
          © {new Date().getFullYear()} AI Trip Planner. All rights reserved.
        </div>
      </div>

      {/* Right Column: Sleek Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:w-1/2 bg-darkBg/95 relative overflow-hidden">
        {/* Saffron Glow on Mobile */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none md:hidden" />
        
        <div className="w-full max-w-md space-y-8">
          {/* Logo on Mobile */}
          <div className="flex items-center gap-2 md:hidden justify-center mb-6">
            <Compass className="h-8 w-8 text-primaryCyan animate-pulse" />
            <span className="font-headings font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-amber-200 bg-clip-text text-transparent">
              AI Trip Planner
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-headings font-bold tracking-tight text-white">
              Your Next Adventure Starts Here
            </h2>
            <p className="text-sm text-gray-400">
              Sign in to explore, plan, and wander further
            </p>
          </div>

          {/* Global Error Banner */}
          {(apiError || Object.keys(validationErrors).length > 0) && (
            <div className="p-4 bg-alertRose/10 border border-alertRose/20 rounded-xl flex gap-3 text-alertRose text-sm items-start">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to sign in</p>
                <p className="opacity-95">{apiError || "Please fix validation errors below."}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="••••••••"
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center border-t border-glassBorder pt-6">
            <p className="text-sm text-gray-400">
              New traveler?{" "}
              <Link to="/register" className="text-primaryCyan hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
