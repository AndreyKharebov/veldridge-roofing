import { useState } from 'react';
import { logForm } from '../../utils/logForm.js';
import { Button, Field, Notice, Wordmark } from '../components/UI.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    logForm('Login', { username, password });
    setPassword('');
    setSubmitted(true);
  };
  return <main className='admin-login'><Wordmark />
    <form className='admin-login__card' onSubmit={submit}>
      <h1>Welcome back.</h1><p>Sign in to manage your website.</p>
      {submitted && <Notice>Form data logged. Authentication is not connected; the password is redacted.</Notice>}
      <Field name='username' label='Username' value={username} onChange={(event) => { setUsername(event.target.value); setSubmitted(false); }} autoComplete='username' required />
      <Field name='password' label='Password' type='password' value={password} onChange={(event) => { setPassword(event.target.value); setSubmitted(false); }} autoComplete='current-password' required />
      <Button type='submit' variant='primary'>Sign in</Button>
      <p className='admin-hint'>Static layout only. No accounts, sessions or API requests are used.</p>
      <Button to='/admin'>Open admin layout</Button>
    </form><Button to='/'>← Back to website</Button>
  </main>;
}
