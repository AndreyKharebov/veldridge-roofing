import { Navigate, Route, Routes } from 'react-router';
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

// Unprotected layout preview. Real authentication will be connected separately.
export default function AdminApp() {
  return <Routes>
    <Route path='login' element={<Login />} />
    <Route path='logout' element={<Navigate to='/admin/login' replace />} />
    <Route element={<AdminLayout />}>
      <Route index element={<Overview />} />
      <Route path='services' element={<ServicesList />} />
      <Route path='services/new' element={<ServiceEditor />} />
      <Route path='services/:id' element={<ServiceEditor />} />
      <Route path='news' element={<NewsList />} />
      <Route path='news/new' element={<ArticleEditor />} />
      <Route path='news/:id' element={<ArticleEditor />} />
      <Route path='news/categories' element={<Categories />} />
      <Route path='news/categories/:id' element={<Categories />} />
      <Route path='projects' element={<ProjectsList />} />
      <Route path='projects/new' element={<ProjectEditor />} />
      <Route path='projects/:id' element={<ProjectEditor />} />
      <Route path='inquiries' element={<InquiriesList />} />
      <Route path='inquiries/:id' element={<InquiryDetail />} />
      <Route path='settings' element={<Settings />} />
      <Route path='*' element={<NotFound variant='admin' description='This page does not exist. Use the navigation or return to the overview.' />} />
    </Route>
  </Routes>;
}
