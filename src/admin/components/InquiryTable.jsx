import { Link } from 'react-router';
import { Badge } from './UI.jsx';
export default function InquiryTable({ records, detailed = false }) {
  return <div className='admin-table-wrap'><table className='admin-table admin-table--inquiries'>
    <thead><tr><th>Customer</th><th>Service</th><th>Received</th><th>Status</th>{detailed && <th>Source</th>}<th>Action</th></tr></thead>
    <tbody>{records.map((record) => <tr key={record.id}>
      <td data-label='Customer'><strong>{record.name}</strong><small>{record.email || record.phone}</small></td>
      <td data-label='Service'>{record.serviceLabel}</td>
      <td data-label='Received'><time dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time></td>
      <td data-label='Status'><Badge status={record.status} /></td>
      {detailed && <td data-label='Source'>{record.source?.type === 'project' ? 'Gallery' : record.source?.type === 'article' ? 'Blog' : 'Contact'}</td>}
      <td data-label='Action'><Link to={`/admin/inquiries/${encodeURIComponent(record.id)}`}>Open inquiry →</Link></td>
    </tr>)}</tbody>
  </table></div>;
}
