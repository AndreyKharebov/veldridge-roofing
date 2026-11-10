import { Routes, Route } from 'react-router';

import Header from './components/layout/Header/Header.jsx';
import Footer from './components/layout/Footer/Footer.jsx';

import HomePage from './pages/HomePage/HomePage.jsx';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage/ServicesPage.jsx';
import GalleryPage from './pages/GalleryPage/GalleryPage.jsx';
import BlogPage from './pages/BlogPage/BlogPage.jsx';
import ContactPage from './pages/ContactPage/ContactPage.jsx';

function App() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/services' element={<ServicesPage />} />
          <Route path='/gallery' element={<GalleryPage />} />
          <Route path='/blog' element={<BlogPage />} />
          <Route path='/contact' element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
