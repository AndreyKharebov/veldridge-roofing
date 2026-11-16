import { useEffect, useState, useSyncExternalStore } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { auth } from '../auth/session.js';
import ContentProvider from '../content/ContentProvider.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import NotFound from '../components/feedback/NotFound/NotFound.jsx';
import Login from './pages/Login.jsx';
import Overview from './pages/Overview.jsx';
import { ServicesList, ServiceEditor } from './pages/Services.jsx';
import { NewsList, ArticleEditor } from './pages/News.jsx';
import Categories from './pages/Categories.jsx';
import { ProjectsList, ProjectEditor } from './pages/Projects.jsx';
import { InquiriesList, InquiryDetail } from './pages/Inquiries.jsx';
import Settings from './pages/Settings.jsx';
import './Admin.sass';

function RequireAdmin() {
  const state = useSyncExternalStore(auth.subscribe, auth.getSnapshot, () => 'checking');
  const location = useLocation();
  if (state === 'checking') return <main className='content-status'>Checking administrator session…</main>;
  if (state === 'unavailable') return <main className='content-status'><h1>Cannot connect to the API.</h1><p>Start the Express server, then retry the connection.</p><button type='button' onClick={() => auth.bootstrap()}>Retry</button></main>;
  return state === 'authenticated' ? <ContentProvider><Outlet /></ContentProvider> : <Navigate to='/admin/login' state={{from:location.pathname}} replace />;
}
function Logout() {
  const [finished, setFinished] = useState(false);
  useEffect(() => { let active = true; auth.signOut().catch(() => {}).finally(() => { if (active) setFinished(true); }); return () => { active = false; }; }, []);
  return finished ? <Navigate to='/admin/login' replace /> : <main className='content-status'>Signing out…</main>;
}
export default function AdminApp() {
  useEffect(() => { auth.bootstrap(); }, []);
  return <Routes>
    <Route path='login' element={<Login />} /><Route path='logout' element={<Logout />} />
    <Route element={<RequireAdmin />}><Route element={<AdminLayout />}>
      <Route index element={<Overview />} />
      <Route path='services' element={<ServicesList />} /><Route path='services/new' element={<ServiceEditor />} /><Route path='services/:id' element={<ServiceEditor />} />
      <Route path='news' element={<NewsList />} /><Route path='news/new' element={<ArticleEditor />} /><Route path='news/:id' element={<ArticleEditor />} />
      <Route path='news/categories' element={<Categories />} /><Route path='news/categories/:id' element={<Categories />} />
      <Route path='projects' element={<ProjectsList />} /><Route path='projects/new' element={<ProjectEditor />} /><Route path='projects/:id' element={<ProjectEditor />} />
      <Route path='inquiries' element={<InquiriesList />} /><Route path='inquiries/:id' element={<InquiryDetail />} />
      <Route path='settings' element={<Settings />} />
      <Route path='*' element={<NotFound variant='admin' description='This workspace page does not exist. Use the navigation or return to the overview.' />} />
    </Route></Route>
  </Routes>;
}
