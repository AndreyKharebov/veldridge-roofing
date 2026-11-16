import { useContent } from '../../../content/context.js';
import { getOfficeLocation } from '../../../utils/officeLocation.js';
import './FooterMap.sass';

const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '').trim();
const isDemo = import.meta.env.VITE_DEMO_MODE !== 'false';

function LocationIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z' />
      <circle cx='12' cy='10' r='2.5' />
    </svg>
  );
}

export default function FooterMap() {
  const { settings, settingsStatus, settingsError, reloadSettings } = useContent();
  const office = getOfficeLocation(settings, apiKey);
  const loading = settingsStatus === 'loading';
  const unavailable = settingsStatus === 'error';
  const showAddress = !loading && !unavailable && office.hasAddress;
  const showMap = showAddress && Boolean(office.embedUrl);

  return (
    <section className='footer-map' aria-labelledby='footer-map-title'>
      <div className='footer-map__header'>
        <span className='footer-map__icon'><LocationIcon /></span>
        <h2 id='footer-map-title'>Find us nearby</h2>
        {isDemo && <span className='footer-map__badge'>Demo location</span>}
      </div>

      <div className='footer-map__canvas' aria-busy={loading}>
        {showMap ? (
          <iframe
            key={office.embedUrl}
            className='footer-map__embed'
            title={`Footer ${isDemo ? 'demo' : 'office'} map: ${office.address}`}
            src={office.embedUrl}
            width='100%'
            height='220'
            loading='lazy'
            referrerPolicy='strict-origin-when-cross-origin'
            allowFullScreen
          />
        ) : (
          <div className='footer-map__empty' role='status'>
            <LocationIcon />
            <p>{loading ? 'Loading our location…' : unavailable ? 'Location temporarily unavailable' : office.hasAddress ? 'View our location in Google Maps' : 'Our location, coming soon'}</p>
            <span>{showAddress ? 'Use the links below to explore the area or plan your route.' : 'Contact our team for location details.'}</span>
          </div>
        )}
      </div>

      <div className='footer-map__details'>
        {showAddress && (
          <>
            <address className='footer-map__address'>
              {office.street}<br />{office.locality}, USA
            </address>
            <div className='footer-map__actions'>
              <a className='footer-map__directions' href={office.directionsUrl} target='_blank' rel='noopener noreferrer' aria-label='Get directions in Google Maps (opens in a new tab or app)'>
                <svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='m3 10 18-7-7 18-3-8-8-3Z' />
                </svg>
                Get directions <span aria-hidden='true'>↗</span>
              </a>
              <a className='footer-map__external' href={office.searchUrl} target='_blank' rel='noopener noreferrer' aria-label='Open location in Google Maps (opens in a new tab or app)'>
                Open map <span aria-hidden='true'>↗</span>
              </a>
            </div>
          </>
        )}
        {isDemo && <p className='footer-map__note'>Demonstration location, not a Veldridge Roofing office.</p>}
        {settingsError && (
          <div className='footer-map__error' role='status'>
            <p>{showAddress ? 'Address could not be refreshed; it may be out of date.' : 'Office details could not be loaded.'}</p>
            <button type='button' onClick={reloadSettings}>Retry</button>
          </div>
        )}
      </div>
    </section>
  );
}
