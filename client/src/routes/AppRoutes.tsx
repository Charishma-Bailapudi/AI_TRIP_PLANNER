import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { LoginForm } from "../features/auth/components/LoginForm";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import { ProtectedRoute } from "./ProtectedRoute";

const DashboardPlaceholder: React.FC = () => (
  <div className="glass-panel p-6">
    <h1 className="text-3xl font-headings font-bold mb-4">My Saved Trips</h1>
    <p className="text-gray-400">Your planned itineraries will appear here.</p>
  </div>
);

const CreateTripPlaceholder: React.FC = () => (
  <div className="glass-panel p-6 max-w-lg mx-auto">
    <h1 className="text-3xl font-headings font-bold mb-4">Create New Journey</h1>
    <p className="text-gray-400">Step 1 of 3: Plan destinations...</p>
  </div>
);

const RouteAnalysisPlaceholder: React.FC = () => (
  <div className="glass-panel p-6">
    <h1 className="text-3xl font-headings font-bold mb-4">Route Recommendations</h1>
    <p className="text-gray-400">Comparing flights and trains for your legs...</p>
  </div>
);

const ItineraryPlaceholder: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[70vh]">
    <div className="glass-panel p-6">
      <h1 className="text-3xl font-headings font-bold mb-4">Itinerary Schedule</h1>
    </div>
    <div className="glass-panel p-6 bg-glassSurface/20">
      <h1 className="text-3xl font-headings font-bold mb-4">Interactive Map</h1>
    </div>
  </div>
);

const SharedTripPlaceholder: React.FC = () => (
  <div className="glass-panel p-6 text-center max-w-md mx-auto">
    <h1 className="text-2xl font-headings font-bold mb-4">Shared Trip View</h1>
    <p className="text-gray-400">You are viewing a shared read-only itinerary.</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Paths */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Public Shared Paths */}
        <Route path="/shared/:tripId" element={<SharedTripPlaceholder />} />

        {/* Dashboard layouts (Auth protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPlaceholder />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateTripPlaceholder />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/route-analysis"
          element={
            <ProtectedRoute>
              <MainLayout>
                <RouteAnalysisPlaceholder />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/itinerary/:tripId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ItineraryPlaceholder />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Redirection */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
