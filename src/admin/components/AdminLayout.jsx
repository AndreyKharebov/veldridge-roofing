import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { logForm } from '../../utils/logForm.js';
import { Button, Wordmark } from './UI.jsx';
import Dialog, { ConfirmDialog } from './Dialog.jsx';
import overviewIcon from '../assets/overview.svg';
import servicesIcon from '../assets/services.svg';
import newsIcon from '../assets/news.svg';
import projectsIcon from '../assets/projects.svg';
import inquiriesIcon from '../assets/inquiries.svg';
import settingsIcon from '../assets/settings.svg';

const links = [
  {name:'Overview',path:'/admin',icon:overviewIcon},
  {name:'Services',path:'/admin/services',icon:servicesIcon},
  {name:'News',path:'/admin/news',icon:newsIcon},
  {name:'Projects',path:'/admin/projects',icon:projectsIcon},
  {name:'Inquiries',path:'/admin/inquiries',icon:inquiriesIcon},
  {name:'Settings',path:'/admin/settings',icon:settingsIcon},
];
function Navigation({ close }) {
  return <nav aria-label='Admin navigation' className='admin-nav'>{links.map(({name,path,icon}) =>
    <NavLink key={path} to={path} end={path === '/admin'} onClick={close} className={({isActive}) => `admin-nav__link${isActive ? ' is-active' : ''}`}>
      <img src={icon} alt='' width='20' height='20' /><span>{name}</span>
    </NavLink>)}</nav>;
}
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menu,setMenu] = useState(false);
  const [signOut,setSignOut] = useState(false);
  const active = links.find(({path}) => path !== '/admin' && (location.pathname === path || location.pathname.startsWith(`${path}/`)))?.name
    || (/^\/admin\/?$/.test(location.pathname) ? 'Overview' : 'Page not found');
  useEffect(() => { document.title = `${active} | Veldridge Admin`; window.scrollTo({top:0,behavior:'instant'}); },[active,location.pathname]);
  return <div className='admin-shell'>
    <a className='admin-skip' href='#admin-content'>Skip to content</a>
    <aside className='admin-sidebar'><Wordmark /><p className='admin-sidebar__caption'>Admin workspace</p><Navigation />
      <div className='admin-sidebar__account'><strong>Admin layout</strong><span>No account connected</span></div>
      <Button onClick={() => setSignOut(true)}>Sign out</Button>
    </aside>
    <div className='admin-main'><header className='admin-topbar'>
      <Button className='admin-menu-toggle' aria-label='Open admin navigation' onClick={() => setMenu(true)}>☰</Button>
      <span className='admin-topbar__breadcrumb'>Workspace / {active}</span><strong className='admin-topbar__compact'>VELDRIDGE</strong>
      <Button to='/' className='admin-view-site'>View website ↗</Button><span className='admin-avatar' aria-label='Admin layout'>A</span>
    </header><main className='admin-content' id='admin-content'>
      <div className='admin-demo'>Static layout · No authentication or API. Forms only log to the browser console.</div>
      <Outlet />
    </main></div>
    {menu && <Dialog title='Workspace' className='admin-dialog--menu' onClose={() => setMenu(false)}><Navigation close={() => setMenu(false)} /><Button onClick={() => {setMenu(false);setSignOut(true);}}>Sign out</Button></Dialog>}
    {signOut && <ConfirmDialog title='Return to the login layout?' action='Sign out' onClose={() => setSignOut(false)} onConfirm={() => {
      logForm('Logout', {}); setSignOut(false); navigate('/admin/login');
    }}><p>This is a layout action only. There is no authenticated session to end.</p></ConfirmDialog>}
  </div>;
}
