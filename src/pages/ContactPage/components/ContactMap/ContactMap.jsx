import { useContent } from '../../../../content/context.js';
import waterway from './assets/waterway.svg';
import pinBackground from './assets/pin-background.svg';
import pinIcon from './assets/pin.svg';
import './ContactMap.sass';

// Geometry of the approved illustrative map, not geographic coordinates.
const blocks = Array.from({ length: 13 }, (_, col) =>
  (col < 10 ? [0, 1, 2, 3] : [3]).map((row) => ({
    id: `${col}-${row}`, x: 24 + col * 98, y: 18 + row * 92, width: col % 2 ? 76 : 70,
  })),
).flat();

const ContactMap = () => {
  const { settings:contactData } = useContent();
  return (
  <section className='contact-map' aria-labelledby='contact-map-title'>
    <div className='container contact-map__inner'>
      <div className='contact-map__heading'>
        <div>
          <p className='contact-map__eyebrow'>Nearby, when you need us</p>
          <h2 id='contact-map-title'>Local Team. Regional Reach.</h2>
        </div>
        <p className='contact-map__description'>Serving homes and businesses across<br />{contactData.serviceArea}.</p>
      </div>
      <figure className='contact-map__figure'>
        <div className='contact-map__canvas' aria-label='Illustrative map with a sample office marker, not for directions'>
          <div className='contact-map__art' aria-hidden='true'>
            {blocks.map((block) => <div className='contact-map__block' key={block.id} style={{ left: block.x, top: block.y, width: block.width }} />)}
            <div className='contact-map__park contact-map__park--first' />
            <div className='contact-map__park contact-map__park--second' />
            <img className='contact-map__waterway' src={waterway} alt='' />
            <div className='contact-map__road' />
            <div className='contact-map__avenue' />
            <span className='contact-map__area-label'>Philadelphia area</span>
          </div>
          <p className='contact-map__badge'>Map preview · Demo</p>
          <div className='contact-map__location'>
            <div className='contact-map__pin' aria-hidden='true'>
              <img className='contact-map__pin-background' src={pinBackground} alt='' />
              <img className='contact-map__pin-icon' src={pinIcon} alt='' />
            </div>
            <div className='contact-map__card'>
              <h3>{contactData.map.label || contactData.company}</h3>
              <p>{contactData.street}<br />{contactData.locality}</p>
              <p className='contact-map__pin-note'>Sample pin · not for directions</p>
            </div>
          </div>
        </div>
        <figcaption>Illustrative map and sample marker. The live map will use the confirmed office address.</figcaption>
      </figure>
    </div>
  </section>
  );
};
export default ContactMap;
