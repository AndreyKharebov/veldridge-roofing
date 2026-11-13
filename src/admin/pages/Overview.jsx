import { useQuery } from '@tanstack/react-query';
import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../api/workspace.js';
import { Button, Notice, PageHeading, Panel } from '../components/UI.jsx';
import InquiryTable from '../components/InquiryTable.jsx';
export default function Overview() {
  const { services,articles,projects } = useContent();
  const query = useQuery({queryKey:['workspace','inquiries'],queryFn:workspaceApi.getInquiries});
  const inquiries = query.data || [];
  const metrics = [
    ['New inquiries',inquiries.filter((i) => i.status === 'new').length,'Ready for a first response'],
    ['In progress',inquiries.filter((i) => i.status === 'in-progress').length,'Conversations to follow up'],
    ['Published projects',projects.filter((p) => p.status === 'published').length,`${projects.length} total projects`],
    ['Published articles',articles.filter((a) => a.status === 'published').length,`${articles.length} total articles`],
  ];
  return <><PageHeading title='Overview' description='A clear view of your content and customer inquiries.' />
    <div className='admin-metrics'>{metrics.map(([title,value,note],index) => <Panel key={title}>
      <p>{title}</p><strong>{query.isPending && index < 2 ? '—' : value}</strong><small>{note}</small>
    </Panel>)}</div>
    <div className='admin-actions'><Button variant='primary' to='/admin/inquiries'>Review inquiries</Button><Button to='/admin/projects/new'>Add project</Button><Button to='/admin/news/new'>Write article</Button></div>
    <h2>Recent inquiries</h2>
    {query.isError ? <Notice error>{query.error.message} <Button onClick={() => query.refetch()}>Retry</Button></Notice> : <InquiryTable records={inquiries.slice(0,3)} />}
    <div className='admin-two-columns'><Panel title='Content at a glance'>
      <p>{services.filter((s) => s.status === 'active').length} active services · {projects.length} projects · {articles.length} articles</p>
      <p className='admin-hint'>Service categories connect your projects and contact form.</p>
    </Panel><Panel title='Keep your details current'><p>Review phone, email, address and working hours.</p><Button to='/admin/settings'>Open settings</Button></Panel></div>
  </>;
}
