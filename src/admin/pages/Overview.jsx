import { useContent } from '../../content/context.js';
import { Button, PageHeading, Panel } from '../components/UI.jsx';
import InquiryTable from '../components/InquiryTable.jsx';

export default function Overview() {
  const { services, articles, projects, inquiries } = useContent();
  const metrics = [
    ['New inquiries', 0, 'No data connected'],
    ['In progress', 0, 'No data connected'],
    ['Published projects', 0, 'No data connected'],
    ['Published articles', 0, 'No data connected'],
  ];
  return <><PageHeading title='Overview' description='Static dashboard layout. No records or statistics are loaded.' />
    <div className='admin-metrics'>{metrics.map(([title, value, note]) => <Panel key={title}>
      <p>{title}</p><strong>{value}</strong><small>{note}</small>
    </Panel>)}</div>
    <div className='admin-actions'><Button variant='primary' to='/admin/inquiries'>Review inquiries</Button><Button to='/admin/projects/new'>Add project</Button><Button to='/admin/news/new'>Write article</Button></div>
    <h2>Recent inquiries</h2><InquiryTable records={inquiries} />
    <div className='admin-two-columns'><Panel title='Content at a glance'>
      <p>{services.length} active services · {projects.length} projects · {articles.length} articles</p>
      <p className='admin-hint'>Service categories will connect projects and the contact form.</p>
    </Panel><Panel title='Keep your details current'><p>Review phone, email, address and working hours.</p><Button to='/admin/settings'>Open settings</Button></Panel></div>
  </>;
}
