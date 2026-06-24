import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlatformLayout } from '@/components/PlatformLayout';
import { RouteTransition } from '@/components/RouteTransition';
import { useAuthStore } from '@/lib/authStore';

const Home = lazy(() => import('@/pages/home/Home'));
const Explore = lazy(() => import('@/pages/platform/Explore'));
const DestinationDetail = lazy(() => import('@/pages/platform/DestinationDetail'));
const Booking = lazy(() => import('@/pages/platform/Booking'));
const Account = lazy(() => import('@/pages/platform/Account'));
const Planner = lazy(() => import('@/pages/platform/Planner'));
const AIAdvisor = lazy(() => import('@/pages/platform/AIAdvisor'));
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
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
