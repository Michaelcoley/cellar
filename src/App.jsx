import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Auth } from './screens/Auth';
import { Cellar } from './screens/Cellar';
import { Scan } from './screens/Scan';
import { BottleDetail } from './screens/BottleDetail';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';
import { TabBar } from './components/TabBar';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-bone/40">
        <span className="font-display text-3xl tracking-tight">Cellar</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function Shell() {
  const { user } = useAuth();
  return (
    <div className="mx-auto min-h-screen max-w-md">
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route
          path="/"
          element={
            <Protected>
              <Cellar />
            </Protected>
          }
        />
        <Route
          path="/scan"
          element={
            <Protected>
              <Scan />
            </Protected>
          }
        />
        <Route
          path="/bottle/:id"
          element={
            <Protected>
              <BottleDetail />
            </Protected>
          }
        />
        <Route
          path="/stats"
          element={
            <Protected>
              <Stats />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <Settings />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <TabBar />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
