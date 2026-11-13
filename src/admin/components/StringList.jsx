import { Button, Field } from './UI.jsx';
export default function StringList({ label, items, onChange }) {
  const swap = (from,to) => {
    const copy = [...items]; [copy[from],copy[to]] = [copy[to],copy[from]]; onChange(copy);
  };
  return <div className='admin-stack'>
    {items.map((value,index) => <div className='admin-list-item' key={index}>
      <Field name={`${label}-${index}`} label={`${label} ${index+1}`} value={value} maxLength={300}
        onChange={(event) => onChange(items.map((item,i) => i === index ? event.target.value : item))} />
      <div className='admin-actions'>
        <Button disabled={index === 0} aria-label={`Move ${label.toLowerCase()} ${index+1} up`} onClick={() => swap(index,index-1)}>↑</Button>
        <Button disabled={index === items.length-1} aria-label={`Move ${label.toLowerCase()} ${index+1} down`} onClick={() => swap(index,index+1)}>↓</Button>
        <Button aria-label={`Remove ${label.toLowerCase()} ${index+1}`} onClick={() => onChange(items.filter((_,i) => i !== index))}>Remove</Button>
      </div>
    </div>)}
    <Button disabled={items.length >= 20} onClick={() => onChange([...items,''])}>+ Add {label.toLowerCase()}</Button>
  </div>;
}
