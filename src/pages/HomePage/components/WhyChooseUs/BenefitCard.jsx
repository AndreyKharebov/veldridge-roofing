import { useScrollReveal } from '../../../../hooks/useScrollReveal.js';

const BenefitCard = ({ benefit, isOpen, onToggle }) => {
  const [cardRef, cardVisible] = useScrollReveal();

  return (
    <article
      ref={cardRef}
      className={`why-choose-us__benefit${
        isOpen ? ' why-choose-us__benefit--open' : ''
      }${cardVisible ? ' is-revealed' : ''}`}
      role='button'
      tabIndex={0}
      aria-expanded={isOpen}
      aria-controls={`benefit-${benefit.id}`}
      onClick={() => onToggle(benefit.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle(benefit.id);
        }
      }}
    >
      <h3 className='why-choose-us__benefit-title'>
        <span className='why-choose-us__benefit-heading'>{benefit.title}</span>

        <span className='why-choose-us__benefit-toggle'>
          <span>{benefit.title}</span>

          <span className='why-choose-us__benefit-symbol' aria-hidden='true' />
        </span>
      </h3>

      <div className='why-choose-us__benefit-panel'>
        <div className='why-choose-us__benefit-panel-inner'>
          <p
            className='why-choose-us__benefit-description'
            id={`benefit-${benefit.id}`}
          >
            {benefit.description}
          </p>
        </div>
      </div>
    </article>
  );
};

export default BenefitCard;
