import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link, Outlet, RouterProvider, useRouteError } from 'react-router';
import Header from './components/layout/Header/Header.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import ContentProvider from './content/ContentProvider.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage/ServicesPage.jsx';
import GalleryPage from './pages/GalleryPage/GalleryPage.jsx';
import BlogPage from './pages/BlogPage/BlogPage.jsx';
import ContactPage from './pages/ContactPage/ContactPage.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
function SiteLayout() {
  return <ContentProvider><Header /><main><Outlet /></main><Footer /></ContentProvider>;
}
function RouteError() {
  const error = useRouteError();
  return <main className='content-status'><h1>This page could not be opened.</h1><p>{error instanceof Error ? error.message : 'Please reload and try again.'}</p><a href='/'>Return to website</a></main>;
}
// Data routing also enables the admin's unsaved-change blocker. Website routes
// and their existing motion stay separate from the lazily loaded admin layout.
const router = createBrowserRouter([
  {element:<Outlet />,errorElement:<RouteError />,children:[
    {path:'/admin/*',element:<Suspense fallback={<main className='content-status'>Opening admin workspace…</main>}><AdminApp /></Suspense>},
    {element:<SiteLayout />,children:[
      {path:'/',element:<HomePage />},
      {path:'/about',element:<AboutPage />},
      {path:'/services',element:<ServicesPage />},
      {path:'/gallery',element:<GalleryPage />},
      {path:'/blog',element:<BlogPage />},
      {path:'/contact',element:<ContactPage />},
      {path:'*',element:<section className='content-status'><h1>Page not found.</h1><Link to='/'>Back to Home</Link></section>},
    ]},
  ]},
]);
function App() { return <RouterProvider router={router} />; }
export default App;
