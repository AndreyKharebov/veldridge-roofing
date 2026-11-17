import arrowRight from '../../assets/icons/arrow-right.svg';
import './ProjectCard.sass';
import ProjectPhoto from '../ProjectPhoto/ProjectPhoto.jsx';

const ProjectCard = ({ project, onOpen, dialogId }) => (
  <li className='project-card' data-gallery-project={project.id}>
    <button
      className='project-card__button'
      id={`project-card-${project.id}`}
      type='button'
      aria-haspopup='dialog'
      aria-controls={dialogId}
      aria-label={`View project: ${project.title}`}
      onClick={(event) => {
        // Give the native dialog a consistent focus-return target in Safari.
        event.currentTarget.focus({ preventScroll: true });
        onOpen(project);
      }}
    >
      <span className='project-card__image'><ProjectPhoto photo={project.coverPhoto || project.photos[0]} /></span>
      <span className='project-card__content'>
        <span className='project-card__category'>{project.categoryLabel}{project.isDemo ? ' · Demo' : ''}</span>
        <span className='project-card__title'>{project.title}</span>
        <span className='project-card__action'>
          <span>View Project</span>
          <img src={arrowRight} alt='' aria-hidden='true' />
        </span>
      </span>
    </button>
  </li>
);

export default ProjectCard;
