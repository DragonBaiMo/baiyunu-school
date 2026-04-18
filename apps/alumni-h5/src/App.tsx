import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.js';
import RequireAuth from './components/RequireAuth.js';
import HomePage from './pages/HomePage.js';
import CardPage from './pages/CardPage.js';
import LoginPage from './pages/LoginPage.js';
import ActivityPage from './pages/ActivityPage.js';
import ServicesPage from './pages/ServicesPage.js';
import MinePage from './pages/MinePage.js';
import AuthVerifyPage from './pages/AuthVerifyPage.js';
import ActivityDetailPage from './pages/ActivityDetailPage.js';
import EnrollPage from './pages/EnrollPage.js';
import DonationPage from './pages/DonationPage.js';
import DonationDetailPage from './pages/DonationDetailPage.js';
import BookingPage from './pages/BookingPage.js';

export default function App(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 带 Layout（桌面端导航 + Footer）的页面 */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/mine" element={<MinePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/auth/verify" element={<AuthVerifyPage />} />

        {/* 需要登录且无底部 TabBar 的页面 */}
        <Route element={<RequireAuth />}>
          <Route path="/card" element={<CardPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/activity/:id/enroll" element={<EnrollPage />} />
          <Route path="/donation" element={<DonationPage />} />
          <Route path="/donation/:id" element={<DonationDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
