import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, LogOut, User, Compass } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.name || "Guest";

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-gray-100">
      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-darkBg/80 backdrop-blur-md border-b border-glassBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Compass className="h-6 w-6 text-primaryCyan animate-pulse" />
            <span className="font-headings font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              AI Trip Planner
            </span>
          </Link>

          {/* User profile actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <MapPin className="h-4 w-4" />
              My Trips
            </Link>

            <div className="h-4 w-[1px] bg-glassBorder hidden md:block" />

            {/* Profile Dropdown Trigger */}
            <div className="flex items-center gap-3 bg-glassSurface/50 border border-glassBorder py-1.5 px-3 rounded-full">
              <User className="h-4 w-4 text-primaryCyan" />
              <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-alertRose transition-colors ml-1 p-0.5 rounded-md hover:bg-white/5"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
