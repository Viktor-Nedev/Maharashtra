import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlatformLayout } from '@/components/PlatformLayout';

// Code-split every route. The heavy 3D homepage and the Mapbox-powered platform
// load independently, so neither blocks the other's first paint.
const Home = lazy(() => import('@/pages/home/Home'));
const Explore = lazy(() => import('@/pages/platform/Explore'));
const DestinationDetail = lazy(() => import('@/pages/platform/DestinationDetail'));
const Booking = lazy(() => import('@/pages/platform/Booking'));
const Account = lazy(() => import('@/pages/platform/Account'));

function RouteFallback() {
  return (
    <div className="route-fallback">
      <div className="route-fallback__spinner" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<PlatformLayout />}>
            <Route path="/explore" element={<Explore />} />
            <Route path="/destination/:slug" element={<DestinationDetail />} />
            <Route path="/book/:slug/:activityId" element={<Booking />} />
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
