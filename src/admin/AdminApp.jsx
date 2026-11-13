import { useEffect, useSyncExternalStore } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { auth } from '../api/auth.js';
import ContentProvider from '../content/ContentProvider.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import { Button, Empty } from './components/UI.jsx';
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
  const signedIn = useSyncExternalStore(auth.subscribe,auth.isSignedIn,() => false);
  const location = useLocation();
  return signedIn ? <ContentProvider><Outlet /></ContentProvider> : <Navigate to='/admin/login' state={{from:location.pathname}} replace />;
}
function Logout() {
  useEffect(() => {auth.signOut();},[]);
  return <Navigate to='/admin/login' replace />;
}
export default function AdminApp() {
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
      <Route path='*' element={<Empty title='Page not found.'><Button to='/admin'>Back to overview</Button></Empty>} />
    </Route></Route>
  </Routes>;
}
