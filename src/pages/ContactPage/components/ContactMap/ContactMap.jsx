import { useContent } from '../../../../content/context.js';
import { getOfficeLocation } from '../../../../utils/officeLocation.js';
import './ContactMap.sass';

const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '').trim();
const isDemo = import.meta.env.VITE_DEMO_MODE !== 'false';

function LocationIcon() {
  return <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d='M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z' /><circle cx='12' cy='10' r='2.5' />
  </svg>;
}

export default function ContactMap() {
  const { settings, settingsStatus, settingsError, reloadSettings } = useContent();
  const office = getOfficeLocation(settings, apiKey);
  const loading = settingsStatus === 'loading';
  const unavailable = settingsStatus === 'error';
  const showAddress = !loading && !unavailable && office.hasAddress;

  return (
    <section className='contact-map' aria-labelledby='contact-map-title'>
      <div className='container contact-map__inner'>
        <div className='contact-map__heading'>
          <div>
            <p className='contact-map__eyebrow'>Nearby, when you need us</p>
            <h2 id='contact-map-title'>Local Team. Regional Reach.</h2>
          </div>
          <p className='contact-map__description'>
            {settings.serviceArea ? <>Serving homes and businesses across<br />{settings.serviceArea}.</> : 'Find our location and plan your route with Google Maps.'}
          </p>
        </div>
        <figure className='contact-map__figure'>
          <div className='contact-map__layout'>
            <div className='contact-map__card'>
              <span className='contact-map__icon'><LocationIcon /></span>
              <p className='contact-map__label'>{isDemo ? 'Demo location' : 'Office location'}</p>
              <h3>{settings.company || 'Veldridge Roofing'}</h3>
              {showAddress ? <>
                <address className='contact-map__address'>{office.street}<br />{office.locality}<br />USA</address>
                {(settings.hours || settings.hoursNote) && <div className='contact-map__hours'>
                  <span>Business hours</span>
                  {settings.hours && <p>{settings.hours}</p>}
                  {settings.hoursNote && <p className='contact-map__hours-note'>{settings.hoursNote}</p>}
                </div>}
                {isDemo && <p className='contact-map__demo-note'>Example location for this demo. This is not a Veldridge Roofing office.</p>}
                <div className='contact-map__actions'>
                  <a className='contact-map__directions' href={office.directionsUrl} target='_blank' rel='noopener noreferrer'>
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='m3 10 18-7-7 18-3-8-8-3Z' /></svg>
                    Get directions <span aria-hidden='true'>↗</span>
                  </a>
                  <a className='contact-map__external' href={office.searchUrl} target='_blank' rel='noopener noreferrer'>Open in Google Maps <span aria-hidden='true'>↗</span></a>
                </div>
                <p className='contact-map__route-note'>Opens Google Maps in a new tab or app. Choose your starting point there.</p>
              </> : <p className='contact-map__address' role='status'>
                {loading ? 'Loading office address…' : unavailable ? 'Office information is temporarily unavailable.' : 'Office address has not been added yet.'}
              </p>}
            </div>
            <div className='contact-map__canvas'>
              {showAddress && office.embedUrl ? <iframe
                key={office.embedUrl}
                className='contact-map__embed'
                title={`${isDemo ? 'Demo location' : 'Office location'}: ${office.address}`}
                src={office.embedUrl}
                width='100%'
                height='460'
                loading='lazy'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
              /> : <div className='contact-map__empty' role='status'>
                <span className='contact-map__empty-icon'><LocationIcon /></span>
                <h3>{loading ? 'Finding our location…' : unavailable ? 'Map temporarily unavailable' : office.hasAddress ? 'Explore this location' : 'Our location, coming soon'}</h3>
                <p>{showAddress
                  ? 'Use the address links to view this location or get directions in Google Maps.'
                  : 'Contact our team for details. No location is guessed or displayed without an address.'}</p>
                {showAddress && !apiKey && import.meta.env.DEV && <small>Add VITE_GOOGLE_MAPS_KEY to .env.local and restart Vite to show the embedded map.</small>}
              </div>}
            </div>
          </div>
          <figcaption className='contact-map__caption'>
            <span>{isDemo ? 'Demo website · Location shown for demonstration only.' : 'Map provided by Google. Check the destination before travelling.'}</span>
            <span>The map uses the saved street address.</span>
          </figcaption>
        </figure>
        {settingsError && <div className='contact-map__refresh' role='status'>
          <span>{settingsError}{showAddress ? ' The displayed address may be out of date.' : ''}</span>
          <button type='button' onClick={reloadSettings}>Retry</button>
        </div>}
      </div>
    </section>
  );
}
