import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import AdminLayout from '@/components/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductEditorPage from '@/pages/ProductEditorPage';
import MediaLibraryPage from '@/pages/MediaLibraryPage';
import PagesPage from '@/pages/PagesPage';
import PageEditorPage from '@/pages/PageEditorPage';
import NewsPage from '@/pages/NewsPage';
import NewsEditorPage from '@/pages/NewsEditorPage';
import FaqPage from '@/pages/FaqPage';
import LegalPagesPage from '@/pages/LegalPagesPage';
import SiteSettingsPage from '@/pages/SiteSettingsPage';
import DeployPage from '@/pages/DeployPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductEditorPage />} />
        <Route path="products/:id" element={<ProductEditorPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="pages/new" element={<PageEditorPage />} />
        <Route path="pages/:id" element={<PageEditorPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/new" element={<NewsEditorPage />} />
        <Route path="news/:id" element={<NewsEditorPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="legal" element={<LegalPagesPage />} />
        <Route path="settings" element={<SiteSettingsPage />} />
        <Route path="deploy" element={<DeployPage />} />
      </Route>
    </Routes>
  );
}
