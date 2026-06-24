import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlatformLayout } from '@/components/PlatformLayout';
import { RouteTransition } from '@/components/RouteTransition';
import { CustomCursor } from '@/components/CustomCursor';
import { Toaster } from '@/components/Toaster';
import { useAuthStore } from '@/lib/authStore';

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
  useEffect(() => { init(); }, [init]);
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
