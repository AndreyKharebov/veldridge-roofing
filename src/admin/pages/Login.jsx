import { useState, useSyncExternalStore } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { auth } from '../../auth/session.js';
import { Button, Field, Notice, Wordmark } from '../components/UI.jsx';
export default function Login() {
  const state = useSyncExternalStore(auth.subscribe, auth.getSnapshot, () => 'checking');
  const navigate = useNavigate();
  const location = useLocation();
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [pending,setPending] = useState(false);
  const [error,setError] = useState('');
  const destination = typeof location.state?.from === 'string' && /^\/admin(?:\/|$)/.test(location.state.from)
    && !/^\/admin\/(?:login|logout)/.test(location.state.from) ? location.state.from : '/admin';
  if (state === 'authenticated') return <Navigate to={destination} replace />;
  const submit = async (event) => {
    event.preventDefault(); if (pending) return;
    setPending(true); setError('');
    try { await auth.signIn(username,password); navigate(destination,{replace:true}); }
    catch (failure) { setError(failure.message); }
    finally { setPending(false); }
  };
  return <main className='admin-login'><Wordmark /><form className='admin-login__card' onSubmit={submit}>
    <h1>Welcome back.</h1><p>Sign in to manage your website.</p>
    {state === 'unavailable' && <Notice error>Cannot reach the API. Start Express and retry.</Notice>}
    {error && <Notice error>{error}</Notice>}
    <Field name='username' label='Username' value={username} onChange={(event) => setUsername(event.target.value)} autoComplete='username' required />
    <Field name='password' label='Password' type='password' value={password} onChange={(event) => setPassword(event.target.value)} autoComplete='current-password' required />
    <Button type='submit' variant='primary' disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
    <p className='admin-hint'>Use your administrator account from the Express API. Content editing remains local until the content API is connected.</p>
  </form><Button to='/'>← Back to website</Button></main>;
}
