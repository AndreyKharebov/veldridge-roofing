import { useState } from 'react';

import { faqItems } from './faq';

import './FAQ.sass';


const FAQ = () => {
  const [openItems, setOpenItems] = useState(['inspection']);

  const toggleItem = (id) => {
    setOpenItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <section className='faq'>
      <div className='container'>
        <div className='faq__header'>
          <h2 className='faq__title'>
            Frequently Asked <span>Questions</span>
          </h2>

          <p className='faq__description'>
            Find answers to common questions about roofing services, repairs,
            and replacement.
          </p>
        </div>

        <div className='faq__list'>
          {faqItems.map((item) => {
            const isOpen = openItems.includes(item.id);

            return (
              <article
                className={`faq__item${isOpen ? ' faq__item--open' : ''}`}
                key={item.id}
              >
                <h3 className='faq__question'>
                  <button
                    className='faq__toggle'
                    type='button'
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    id={`faq-button-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span>{item.question}</span>

                    <span className='faq__icon' aria-hidden='true' />
                  </button>
                </h3>

                <div
                  className='faq__panel'
                  id={`faq-panel-${item.id}`}
                  aria-labelledby={`faq-button-${item.id}`}
                  aria-hidden={!isOpen}
                >
                  <div className='faq__panel-inner'>
                    <p className='faq__answer'>{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
