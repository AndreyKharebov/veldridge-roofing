import { processSteps } from './processSteps.js';

import './HowWeWork.sass';

const HowWeWork = () => {
  return (
    <section className='how-we-work' aria-labelledby='how-we-work-title'>
      <div className='container'>
        <div className='how-we-work__header'>
          <div className='how-we-work__heading'>
            <p className='about-page__eyebrow'>How We Work</p>
            <h2 className='about-page__title' id='how-we-work-title'>
              A Clear Process.<br />From Start To Finish.
            </h2>
          </div>
          <p className='about-page__text how-we-work__description'>
            Roofing can feel like a big decision. Our approach keeps the next
            step clear, from the first conversation to the final walkthrough.
          </p>
        </div>

        <ol className='how-we-work__steps'>
          {processSteps.map(({ id, number, title, description }) => (
            <li className='how-we-work__step' key={id}>
              <span className='how-we-work__number' aria-hidden='true'>
                {number}
              </span>
              <h3 className='how-we-work__step-title'>{title}</h3>
              <p className='how-we-work__step-description'>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowWeWork;
