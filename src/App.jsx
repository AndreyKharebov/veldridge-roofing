import { lazy, Suspense } from 'react';
import { createBrowserRouter, isRouteErrorResponse, Outlet, RouterProvider, useRouteError } from 'react-router';
import Header from './components/layout/Header/Header.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage/ServicesPage.jsx';
import GalleryPage from './pages/GalleryPage/GalleryPage.jsx';
import BlogPage from './pages/BlogPage/BlogPage.jsx';
import ContactPage from './pages/ContactPage/ContactPage.jsx';
import NotFound from './components/feedback/NotFound/NotFound.jsx';
import './content/ContentProvider.sass';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
function SiteLayout() {
  return <><Header /><main><Outlet /></main><Footer /></>;
}
function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <main><NotFound /></main>;
  return <main className='content-status'><h1>This page could not be opened.</h1><p>{error instanceof Error ? error.message : 'Please reload and try again.'}</p><a href='/'>Return to website</a></main>;
}
const router = createBrowserRouter([
  { element: <Outlet />, errorElement: <RouteError />, children: [
    { path: '/admin/*', element: <Suspense fallback={<main className='content-status'>Opening admin layout…</main>}><AdminApp /></Suspense> },
    { element: <SiteLayout />, children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/gallery', element: <GalleryPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '*', element: <NotFound /> },
    ] },
  ] },
]);
export default function App() { return <RouterProvider router={router} />; }
