import { values } from './values.js';

import './OurValues.sass';

const OurValues = () => {
  return (
    <section className='our-values' aria-labelledby='our-values-title'>
      <div className='container'>
        <div className='our-values__header'>
          <p className='about-page__eyebrow'>What Matters To Us</p>
          <h2 className='about-page__title' id='our-values-title'>
            What Matters On Every Project.
          </h2>
          <p className='about-page__text'>
            The principles behind every conversation, recommendation, and roof.
          </p>
        </div>

        <div className='our-values__grid'>
          {values.map(({ id, number, title, description }) => (
            <article className='our-values__card' key={id}>
              <span className='our-values__number' aria-hidden='true'>
                {number}
              </span>
              <h3 className='our-values__card-title'>{title}</h3>
              <p className='about-page__text'>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurValues;
