import { useContent } from '../../../../content/context.js';
import phoneIcon from './assets/phone.svg';
import emailIcon from './assets/mail.svg';
import officeIcon from './assets/location.svg';
import clockIcon from './assets/clock.svg';
import './ContactDetails.sass';

const ContactDetails = () => {
  const { settings: data } = useContent();
  const hasContacts = Boolean(
    data.phone || data.email || data.street || data.hours,
  );
  const rows = [
    {
      id: 'phone',
      label: 'Phone',
      value: data.phone,
      hint: data.isDemo ? 'Sample phone number' : 'Call our team',
      icon: phoneIcon,
      href: data.isDemo ? null : data.phoneHref,
    },
    {
      id: 'email',
      label: 'Email',
      value: data.email,
      hint: data.isDemo ? 'Sample email address' : 'Send an inquiry',
      icon: emailIcon,
      href: data.isDemo ? null : `mailto:${data.email}`,
    },
    {
      id: 'office',
      label: 'Office',
      value: data.street,
      hint: data.locality,
      icon: officeIcon,
    },
    {
      id: 'hours',
      label: 'Hours',
      value: data.hours,
      hint: [data.hoursNote, data.hours && data.isDemo ? 'Sample hours' : '']
        .filter(Boolean)
        .join(' · '),
      icon: clockIcon,
    },
  ];
  return (
    <aside className='contact-details' aria-labelledby='contact-details-title'>
      <div className='contact-details__intro'>
        <h2 id='contact-details-title'>
          Local people.
          <br />
          Practical answers.
        </h2>
        <p>
          A repair, a new roof, or a question about a project you’ve seen —
          start with a few details.
        </p>
      </div>
      <dl className='contact-details__list'>
        {rows.map(({ id, label, value, hint, icon, href }) => (
          <div className='contact-details__row' key={id}>
            <div className='contact-details__icon' aria-hidden='true'>
              <img src={icon} alt='' />
            </div>
            <div className='contact-details__information'>
              <dt>{label}</dt>
              <dd>
                {value ? (
                  href ? (
                    <a href={href}>{value}</a>
                  ) : (
                    value
                  )
                ) : (
                  'Not provided yet'
                )}
                {value && hint && <span>{hint}</span>}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <div className='contact-details__area'>
        <h3>Proudly serving</h3>
        <p>{data.serviceArea || 'Service area will be added soon.'}</p>
        <p className='contact-details__area-note'>
          Add your ZIP code so we can understand where your project is located.
        </p>
      </div>
      {data.isDemo && (
        <div className='contact-details__disclosure'>
          <h3>
            {hasContacts
              ? 'Local demo workspace'
              : 'Contact details not added yet'}
          </h3>
          <p>
            {hasContacts
              ? 'These details are stored in this browser only. Calls, email and live directions are not connected.'
              : 'Company contact information will appear here once it has been added.'}
          </p>
        </div>
      )}
    </aside>
  );
};
export default ContactDetails;
