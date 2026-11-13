import SharedFormField from '../../../../components/forms/FormField.jsx';
export default function FormField(props) {
  return <SharedFormField {...props} id={`contact-${props.name}`} classPrefix='inquiry-form' />;
}
