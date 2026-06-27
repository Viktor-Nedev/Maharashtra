import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlatformLayout } from '@/components/PlatformLayout';
import { RouteTransition } from '@/components/RouteTransition';
import { CustomCursor } from '@/components/CustomCursor';
import { Toaster } from '@/components/Toaster';
import { useAuthStore } from '@/lib/authStore';
import { usePlatformStore } from '@/lib/store';
import { isSupabaseEnabled } from '@/lib/supabase';

const Home = lazy(() => import('@/pages/home/Home'));
const Explore = lazy(() => import('@/pages/platform/Explore'));
const DestinationDetail = lazy(() => import('@/pages/platform/DestinationDetail'));
const Booking = lazy(() => import('@/pages/platform/Booking'));
const Account = lazy(() => import('@/pages/platform/Account'));
const Planner = lazy(() => import('@/pages/platform/Planner'));
const AIAdvisor = lazy(() => import('@/pages/platform/AIAdvisor'));
const Compare = lazy(() => import('@/pages/platform/Compare'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

function RouteFallback() {
  return (
    <div className="route-fallback">
      <div className="route-fallback__spinner" />
    </div>
  );
}

function AuthInit() {
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const loadUserData = usePlatformStore((s) => s.loadUserData);
  const clearUserData = usePlatformStore((s) => s.clearUserData);
  const prevUid = useRef<string | null>(null);

  useEffect(() => { init(); }, [init]);

  // Hydrate personal data from Supabase on login; clear on logout. Guarded so
  // it never touches the localStorage cache in demo mode (no Supabase keys).
  useEffect(() => {
    if (!isSupabaseEnabled || loading) return;
    const currentUid = user?.id ?? null;
    if (currentUid === prevUid.current) return;
    prevUid.current = currentUid;
    if (currentUid) void loadUserData(currentUid);
    else clearUserData();
  }, [user, loading, loadUserData, clearUserData]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <CustomCursor />
      <Toaster />
      <RouteTransition />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PlatformLayout />}>
            <Route path="/explore" element={<Explore />} />
            <Route path="/destination/:slug" element={<DestinationDetail />} />
            <Route path="/book/:slug/:activityId" element={<Booking />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/account" element={<Account />} />
            <Route path="/advisor" element={<AIAdvisor />} />
            <Route path="/compare" element={<Compare />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
