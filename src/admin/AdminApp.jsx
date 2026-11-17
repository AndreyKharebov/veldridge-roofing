import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';

import { authApi } from '../lib/auth.js';

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
import Media from './pages/Media.jsx';
import { TestimonialsList, TestimonialEditor } from './pages/Testimonials.jsx';

import './Admin.sass';

function RequireAdmin() {
  const location = useLocation();

  const [status, setStatus] = useState('checking');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then(() => {
        if (active) setStatus('authenticated');
      })
      .catch((error) => {
        if (!active) return;

        setStatus(error.status === 401 ? 'unauthenticated' : 'unavailable');
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  if (status === 'checking') {
    return (
      <main className='content-status'>Checking administrator session…</main>
    );
  }

  if (status === 'unavailable') {
    return (
      <main className='content-status'>
        <h1>Cannot connect to the API.</h1>
        <p>Please check your connection and try again.</p>

        <button
          type='button'
          onClick={() => {
            setStatus('checking');
            setRetryKey((key) => key + 1);
          }}
        >
          Retry
        </button>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate to='/admin/login' state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
}

function Logout() {
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    authApi
      .logout()
      .then(() => {
        if (active) setFinished(true);
      })
      .catch((failure) => {
        if (!active) return;

        if (failure.status === 401) {
          setFinished(true);
        } else {
          setError(failure.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (finished) {
    return <Navigate to='/admin/login' replace />;
  }

  if (error) {
    return (
      <main className='content-status'>
        <h1>Could not sign out.</h1>
        <p>{error}</p>
        <a href='/admin'>Return to admin</a>
      </main>
    );
  }

  return <main className='content-status'>Signing out…</main>;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path='login' element={<Login />} />
      <Route path='logout' element={<Logout />} />

      <Route element={<RequireAdmin />}>
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

          <Route path='testimonials' element={<TestimonialsList />} />
          <Route path='testimonials/new' element={<TestimonialEditor />} />
          <Route path='testimonials/:id' element={<TestimonialEditor />} />

          <Route path='settings' element={<Settings />} />
          <Route path='media' element={<Media />} />

          <Route
            path='*'
            element={
              <NotFound
                variant='admin'
                description='This page does not exist. Use the navigation or return to the overview.'
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
