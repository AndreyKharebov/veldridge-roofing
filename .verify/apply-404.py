from pathlib import Path

def edit(path, old, new):
    p = Path(path)
    text = p.read_text()
    if old in text:
        assert text.count(old) == 1, path
        p.write_text(text.replace(old, new))
    else:
        assert new in text, 'Unexpected source: ' + path

edit('src/App.jsx', 'createBrowserRouter, Link, Outlet, RouterProvider, useRouteError', 'createBrowserRouter, isRouteErrorResponse, Outlet, RouterProvider, useRouteError')
edit('src/App.jsx', "import ContactPage from './pages/ContactPage/ContactPage.jsx';", "import ContactPage from './pages/ContactPage/ContactPage.jsx';\nimport NotFound from './components/feedback/NotFound/NotFound.jsx';")
edit('src/App.jsx', '  const error = useRouteError();', "  const error = useRouteError();\n  if (isRouteErrorResponse(error) && error.status === 404) {\n    return <main><NotFound /></main>;\n  }")
edit('src/App.jsx', "{path:'*',element:<section className='content-status'><h1>Page not found.</h1><Link to='/'>Back to Home</Link></section>}", "{path:'*',element:<NotFound />}")
edit('src/admin/AdminApp.jsx', "import { Button, Empty } from './components/UI.jsx';", "import NotFound from '../components/feedback/NotFound/NotFound.jsx';")
edit('src/admin/AdminApp.jsx', "<Empty title='Page not found.'><Button to='/admin'>Back to overview</Button></Empty>", "<NotFound variant='admin' description='This workspace page does not exist. Use the navigation or return to the overview.' />")
for filename, kind, target in [('Services','Service','services'),('News','Article','news'),('Projects','Project','projects'),('Inquiries','Inquiry','inquiries')]:
    path = f'src/admin/pages/{filename}.jsx'
    old = f"<Empty title='{kind} not found.'><Button to='/admin/{target}'>Back to {target}</Button></Empty>"
    new = f"<NotFound variant='admin' title='{kind} not found.' description='This {kind.lower()} is not available in the current workspace. It may have been removed, or the link may be incorrect.' returnTo='/admin/{target}' returnLabel='Back to {target}' />"
    edit(path, old, new)
    p = Path(path)
    text = p.read_text()
    line = "import NotFound from '../../components/feedback/NotFound/NotFound.jsx';\n"
    if line not in text:
        p.write_text(line + text)
edit('src/admin/pages/Categories.jsx', "import { useState } from 'react';", "import { useState } from 'react';\nimport NotFound from '../../components/feedback/NotFound/NotFound.jsx';")
edit('src/admin/pages/Categories.jsx', "  return <><PageHeading title='News categories'", "  if (id && id !== 'new' && !editing) return <NotFound variant='admin' title='Category not found.' description='This news category is not available in the current workspace. Return to the category list to continue.' returnTo='/admin/news/categories' returnLabel='Back to categories' />;\n  return <><PageHeading title='News categories'")
edit('src/admin/pages/Categories.jsx', "<Empty title={id ? 'Category not found.' : 'Select a category.'}>", "<Empty title='Select a category.'>")
edit('src/admin/components/AdminLayout.jsx', "const active = links.find(({path}) => path !== '/admin' && location.pathname.startsWith(path))?.name || 'Overview';", "const active = links.find(({path}) => path !== '/admin' && (location.pathname === path || location.pathname.startsWith(`${path}/`)))?.name\n    || (/^\\/admin\\/?$/.test(location.pathname) ? 'Overview' : 'Page not found');")
edit('src/pages/HomePage/HomePage.jsx', "import { useMotionReveal }", "import { useEffect } from 'react';\nimport { useMotionReveal }")
edit('src/pages/HomePage/HomePage.jsx', "  const pageRef = useMotionReveal(homeMotion, homeMotionOptions);", "  const pageRef = useMotionReveal(homeMotion, homeMotionOptions);\n  useEffect(() => {\n    const previousTitle = document.title;\n    document.title = 'Veldridge Roofing | Professional Roofing Services';\n    return () => { document.title = previousTitle; };\n  }, []);")
