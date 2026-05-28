import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BottomNavigation } from "./components/BottomNavigation";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddFoodPage } from "./pages/AddFoodPage";
import { FoodLogPage } from "./pages/FoodLogPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { useAuth } from "./contexts/AuthContext";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex-1 overflow-hidden">{children}</main>
      <BottomNavigation />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            maxWidth: "320px",
          },
          duration: 2500,
        }}
      />

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <AppShell>
                <FoodLogPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-food"
          element={
            <ProtectedRoute>
              <AppShell>
                <AddFoodPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <AppShell>
                <RecipesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreateRecipePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <RecipeDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AppShell>
                <AdminPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
