import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { projectsApi } from '../../lib/projects.js';
import { servicesApi } from '../../lib/services.js';
import { Badge, Button, Empty, Notice, PageHeading, Panel } from '../components/UI.jsx';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import ProjectForm from '../components/projects/ProjectForm.jsx';
import ProjectDeleteDialog from '../components/projects/ProjectDeleteDialog.jsx';
import ProjectOrderDialog from '../components/projects/ProjectOrderDialog.jsx';
import { newProject, toProjectForm, projectFailure } from '../components/projects/projectForm.js';
import './Projects.sass';

export function ProjectsList() {
  const [query, setQuery] = useState({ page: 1, status: 'all', revision: 0 });
  const [result, setResult] = useState({ projects: [], pagination: null, loading: true, error: '' });
  const [selected, setSelected] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    projectsApi.getAll(query.page, query.status, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      const last = Math.max(1, data.pagination.totalPages);
      if (query.page > last) { setQuery((old) => ({ ...old, page: last })); return; }
      setResult({ projects: data.projects, pagination: data.pagination, loading: false, error: '' });
    }).catch((error) => { if (!controller.signal.aborted) setResult({ projects: [], pagination: null, loading: false, error: projectFailure(error) }); });
    return () => controller.abort();
  }, [query]);
  const reload = (changes = {}) => {
    setResult((old) => ({ ...old, loading: true, error: '' }));
    setQuery((old) => ({ ...old, ...changes, revision: old.revision + 1 }));
  };
  const blocked = result.loading || selected || ordering;
  return <div className='projects-admin'>
    <PageHeading title='Projects' description='Manage your portfolio, photographs and the stories behind your work.'>
      <div className='admin-actions'><Button disabled={Boolean(blocked)} onClick={() => setOrdering(true)}>Arrange projects</Button><Button variant='primary' to='/admin/projects/new'>+ Add project</Button></div>
    </PageHeading>
    <div className='admin-actions' role='group' aria-label='Filter project status'>
      {['all', 'published', 'draft', 'archived'].map((status) => <Button key={status} disabled={Boolean(blocked)} aria-pressed={query.status === status} onClick={() => { setNotice(''); reload({ status, page: 1 }); }}>{status === 'all' ? 'All projects' : status[0].toUpperCase() + status.slice(1)}</Button>)}
    </div>
    {notice && <Notice>{notice}</Notice>}
    {result.error && <Notice error><p>{result.error}</p><Button onClick={() => reload()}>Retry</Button></Notice>}
    {result.loading ? <Panel><p role='status'>Loading projects…</p></Panel> : !result.error && <>
      {!result.projects.length && <Empty title={query.status === 'all' ? 'No projects yet.' : 'No projects with this status.'}><p>Create a draft to start your portfolio.</p></Empty>}
      <div className='projects-admin__grid'>{result.projects.map((project) => <article className='projects-admin__card' key={project.id}>
        {project.image ? <img src={project.image} alt={project.imageAlt || ''} loading='lazy' /> : <div className='admin-image-placeholder'>No cover selected</div>}
        <div className='projects-admin__card-body'><div className='admin-actions'><Badge status={project.status} /><span className='admin-hint'>Position {project.order}</span></div>
          <h2>{project.title}</h2><p className='admin-hint'>{[project.categoryLabel, project.propertyType].filter(Boolean).join(' · ') || 'Project details not set'}</p>
          <p className='admin-hint'>{project.photos.length} photos{project.showOnHome ? ' · Home enabled' : ''}{project.isDemo ? ' · Demo' : ''}</p>
          <div className='projects-admin__card-actions'><Link className='admin-button' to={`/admin/projects/${project.id}`}>Edit project</Link><Button variant='danger' disabled={Boolean(blocked)} onClick={() => setSelected(project)}>Delete</Button></div>
        </div>
      </article>)}</div>
      {result.pagination && <nav className='projects-admin__pagination' aria-label='Project pages'><p>{result.pagination.total} projects · Page {query.page} of {Math.max(1, result.pagination.totalPages)}</p>
        <div className='admin-actions'><Button disabled={Boolean(blocked) || query.page <= 1} onClick={() => reload({ page: query.page - 1 })}>Previous</Button>
          <Button disabled={Boolean(blocked) || query.page >= result.pagination.totalPages} onClick={() => reload({ page: query.page + 1 })}>Next</Button></div></nav>}
    </>}
    {selected && <ProjectDeleteDialog project={selected} onClose={() => setSelected(null)} onDeleted={() => { setSelected(null); setNotice('Project deleted. Its images remain in Media Library.'); reload(); }} />}
    {ordering && <ProjectOrderDialog onClose={() => setOrdering(false)} onChanged={() => reload()} />}
  </div>;
}

export function ProjectEditor() {
  const { id } = useParams();
  return <ProjectLoader key={id || 'new'} id={id} />;
}
function ProjectLoader({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [created] = useState(() => Boolean(id && location.state?.createdProjectId === id));
  const consumed = useRef(false);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ loading: true, error: '', missing: false, project: null, catalog: [], services: [] });
  useEffect(() => {
    if (created && !consumed.current) { consumed.current = true; navigate(location.pathname, { replace: true, state: null }); }
  }, [created, navigate, location.pathname]);
  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([id ? projectsApi.get(id, options) : Promise.resolve({ project: null }), projectsApi.getOrder(options), servicesApi.getOrder(options)])
      .then(([record, catalog, services]) => {
        if (!controller.signal.aborted) setResult({ loading: false, error: '', missing: false,
          project: record.project ? toProjectForm(record.project) : newProject(), catalog: catalog.projects,
          services: Object.values(services.groups).flat() });
      }).catch((error) => { if (!controller.signal.aborted) setResult((old) => ({ ...old, loading: false, missing: error.status === 404, error: projectFailure(error) })); });
    return () => controller.abort();
  }, [id, retry]);
  if (result.loading) return <Panel><p role='status'>{created ? 'Project created successfully. Opening editor…' : 'Loading project editor…'}</p></Panel>;
  if (result.missing) return <NotFound variant='admin' title='Project not found.' returnTo='/admin/projects' returnLabel='Back to projects' />;
  if (result.error) return <Notice error><p>{result.error}</p><Button onClick={() => { setResult((old) => ({ ...old, loading: true, error: '' })); setRetry((value) => value + 1); }}>Retry</Button></Notice>;
  return <ProjectForm initial={result.project} services={result.services} catalog={result.catalog} created={created} />;
}
