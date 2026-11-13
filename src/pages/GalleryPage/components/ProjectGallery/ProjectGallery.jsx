import { useCallback, useEffect, useId, useRef, useState } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard.jsx';
import ProjectDialog from '../ProjectDialog/ProjectDialog.jsx';
import { INITIAL_PROJECT_COUNT, PROJECT_BATCH_SIZE } from '../../data/galleryProjects.js';
import './ProjectGallery.sass';
import { useContent } from '../../../../content/context.js';
import { useLocation } from 'react-router';

const ProjectGallery = () => {
  const { projects,services } = useContent();
  const { state } = useLocation();
  const galleryProjects = projects.filter((project) => project.status === 'published');
  const projectCategories = [{id:'all',label:'All Projects'},...services.filter((service) => galleryProjects.some((project) => project.serviceId === service.id)).map((service) => ({id:service.id,label:service.title}))];
  const [category, setCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PROJECT_COUNT);
  const [activeProject, setActiveProject] = useState(() => galleryProjects.find((project) => project.id === state?.projectId) || null);
  const focusAfterLoad = useRef(null);
  const dialogId = useId();
  const closeProject = useCallback(() => setActiveProject(null), []);
  const filtered = category === 'all' ? galleryProjects : galleryProjects.filter((project) => project.category === category);
  const visibleProjects = filtered.slice(0, visibleCount);
  const hasMore = visibleProjects.length < filtered.length;

  useEffect(() => {
    if (!focusAfterLoad.current) return;
    document.getElementById(`project-card-${focusAfterLoad.current}`)?.focus({ preventScroll: true });
    focusAfterLoad.current = null;
  }, [visibleCount]);

  const selectCategory = (nextCategory) => {
    focusAfterLoad.current = null;
    setCategory(nextCategory);
    setVisibleCount(INITIAL_PROJECT_COUNT);
  };

  const loadMore = () => {
    focusAfterLoad.current = filtered[visibleCount]?.id ?? null;
    setVisibleCount((count) => count + PROJECT_BATCH_SIZE);
  };

  return (
    <section className='project-gallery' aria-labelledby='projects-title'>
      <div className='container project-gallery__inner'>
        <div className='project-gallery__header' id='projects' data-gallery-anchor tabIndex={-1}>
          <div>
            <p className='project-gallery__eyebrow'>Our Work, Up Close</p>
            <h2 className='project-gallery__title' id='projects-title'>Every roof has a story.</h2>
          </div>
          <p className='project-gallery__description'>
            Explore the work and the details behind it.<br />
            Select a project for photos, materials, and a short overview.
          </p>
        </div>

        <div className='project-gallery__filters' role='group' aria-label='Filter projects by service'>
          {projectCategories.map(({ id, label }) => (
            <button
              type='button'
              className='project-gallery__filter'
              key={id}
              aria-pressed={category === id}
              aria-controls='project-grid'
              onClick={() => selectCategory(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {galleryProjects.some((project) => project.isDemo) && <p className='project-gallery__disclosure'>Portfolio preview · Illustrative projects and sample details</p>}
        <p className='project-gallery__status' role='status' aria-live='polite' aria-atomic='true'>
          Showing {visibleProjects.length} of {filtered.length} {category === 'all' ? 'projects' : `${(projectCategories.find(({ id }) => id === category)?.label || 'selected').toLowerCase()} projects`}.
        </p>
        <ul className='project-gallery__grid' id='project-grid'>
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setActiveProject} dialogId={dialogId} />
          ))}
        </ul>
        {filtered.length === 0 && <p>No projects in this category yet. Please choose another service.</p>}

        <div className='project-gallery__more'>
          {hasMore && <button type='button' className='project-gallery__load-more' aria-controls='project-grid' onClick={loadMore}>Load More</button>}
          <p>{hasMore ? 'More roofing inspiration, one project at a time.' : 'You’re viewing all projects in this selection.'}</p>
        </div>
      </div>
      {activeProject && <ProjectDialog key={activeProject.id} id={dialogId} project={activeProject} onClose={closeProject} />}
    </section>
  );
};

export default ProjectGallery;
