import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import ProjectCard from '../ProjectCard/ProjectCard.jsx';
import ProjectDialog from '../ProjectDialog/ProjectDialog.jsx';
import { INITIAL_PROJECT_COUNT, PROJECT_BATCH_SIZE } from '../../data/galleryConfig.js';
import { useContent } from '../../../../content/context.js';
import './ProjectGallery.sass';

export default function ProjectGallery() {
  const { projects, projectsStatus, projectsError, reloadProjects } = useContent();
  const location = useLocation();
  const galleryProjects = projects.filter((project) => project.status === 'published');
  const categories = [...new Map(galleryProjects.filter((project) => project.serviceId).map((project) => [project.serviceId, project.categoryLabel])).entries()];
  const [filter, setFilter] = useState('all');
  const category = categories.some(([id]) => id === filter) ? filter : 'all';
  const [propertyType, setPropertyType] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PROJECT_COUNT);
  const [selection, setSelection] = useState(null);
  const requestedId = new URLSearchParams(location.search).get('project') || location.state?.projectId || null;
  const activeId = selection?.key === location.key ? selection.id : requestedId;
  const activeProject = galleryProjects.find((project) => project.id === activeId) || null;
  const focusAfterLoad = useRef(null);
  const dialogId = useId();
  const closeProject = useCallback(() => setSelection({ key: location.key, id: null }), [location.key]);
  const filtered = galleryProjects.filter((project) => (category === 'all' || project.serviceId === category) && (propertyType === 'all' || project.propertyType === propertyType));
  const visibleProjects = filtered.slice(0, visibleCount);
  const hasMore = visibleProjects.length < filtered.length;
  useEffect(() => {
    if (!focusAfterLoad.current) return;
    document.getElementById(`project-card-${focusAfterLoad.current}`)?.focus({ preventScroll: true });
    focusAfterLoad.current = null;
  }, [visibleCount]);
  const chooseFilter = (next) => { focusAfterLoad.current = null; setFilter(next); setVisibleCount(INITIAL_PROJECT_COUNT); };
  const loadMore = () => { focusAfterLoad.current = filtered[visibleCount]?.id ?? null; setVisibleCount((count) => count + PROJECT_BATCH_SIZE); };
  return <section className='project-gallery' aria-labelledby='projects-title'>
    <div className='container project-gallery__inner'>
      <div className='project-gallery__header' id='projects' data-gallery-anchor tabIndex={-1}>
        <div><p className='project-gallery__eyebrow'>Our Work, Up Close</p><h2 className='project-gallery__title' id='projects-title'>Every roof has a story.</h2></div>
        <p className='project-gallery__description'>Explore the work and the details behind it.<br />Select a project for photos, materials, and a short overview.</p>
      </div>
      {galleryProjects.length > 0 && <>
        <div className='project-gallery__filters' role='group' aria-label='Filter projects by service'>
          {[['all', 'All Projects'], ...categories].map(([id, label]) => <button type='button' className='project-gallery__filter' key={id}
            aria-pressed={category === id} aria-controls='project-grid' onClick={() => chooseFilter(id)}>{label}</button>)}
        </div>
        <div className='project-gallery__filters' role='group' aria-label='Filter projects by property type'>
          {['all', 'Residential', 'Commercial'].map((type) => <button type='button' className='project-gallery__filter' key={type}
            aria-pressed={propertyType === type} aria-controls='project-grid' onClick={() => { setPropertyType(type); setVisibleCount(INITIAL_PROJECT_COUNT); }}>{type === 'all' ? 'All property types' : type}</button>)}
        </div>
      </>}
      {galleryProjects.some((project) => project.isDemo) && <p className='project-gallery__disclosure'>Portfolio preview · Projects marked as demo contain illustrative details.</p>}
      {projectsStatus === 'loading' && <p role='status'>Loading projects…</p>}
      {projectsError && <div role='status'><p>Projects are temporarily unavailable.</p><button type='button' className='project-gallery__load-more' onClick={reloadProjects}>Try again</button></div>}
      {projectsStatus === 'ready' && <>
        {activeId && !activeProject && <p role='status'>The requested project is not available. Explore the published projects below.</p>}
        <p className='project-gallery__status' role='status' aria-live='polite' aria-atomic='true'>Showing {visibleProjects.length} of {filtered.length} projects.</p>
        <ul className='project-gallery__grid' id='project-grid'>
          {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onOpen={(item) => setSelection({ key: location.key, id: item.id })} dialogId={dialogId} />)}
        </ul>
        {!filtered.length && <p>{galleryProjects.length ? 'No projects match these filters. Choose another service or property type.' : 'No projects have been published yet. Please check back soon.'}</p>}
        {filtered.length > 0 && <div className='project-gallery__more'>
          {hasMore && <button type='button' className='project-gallery__load-more' aria-controls='project-grid' onClick={loadMore}>Load More</button>}
          <p>{hasMore ? 'More roofing inspiration, one project at a time.' : 'You’re viewing all projects in this selection.'}</p>
        </div>}
      </>}
    </div>
    {activeProject && <ProjectDialog key={activeProject.id} id={dialogId} project={activeProject} onClose={closeProject} />}
  </section>;
}
