import { useState, useSyncExternalStore } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { auth, demoCredentials } from '../../api/auth.js';
import { Button, Field, Notice, Wordmark } from '../components/UI.jsx';
export default function Login() {
  const signedIn = useSyncExternalStore(auth.subscribe,auth.isSignedIn,() => false);
  const navigate = useNavigate();
  const location = useLocation();
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [pending,setPending] = useState(false);
  const [error,setError] = useState('');
  const destination = typeof location.state?.from === 'string' && /^\/admin(?:\/|$)/.test(location.state.from)
    && !/^\/admin\/(?:login|logout)/.test(location.state.from) ? location.state.from : '/admin';
  if (signedIn) return <Navigate to={destination} replace />;
  const submit = async (event) => {
    event.preventDefault(); if (pending) return;
    setPending(true); setError('');
    try { await auth.signIn(username,password); navigate(destination,{replace:true}); }
    catch (failure) { setError(failure.message); }
    finally { setPending(false); }
  };
  return <main className='admin-login'><Wordmark /><form className='admin-login__card' onSubmit={submit}>
    <h1>Welcome back.</h1><p>Sign in to manage your website.</p>
    {error && <Notice error>{error}</Notice>}
    <Field name='username' label='Username' value={username} onChange={(event) => setUsername(event.target.value)} autoComplete='username' required />
    <Field name='password' label='Password' type='password' value={password} onChange={(event) => setPassword(event.target.value)} autoComplete='current-password' required />
    <Button type='submit' variant='primary' disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
    <p className='admin-hint'>Demo access only. This is not secure authentication.</p>
    <p className='admin-hint'>Username: <code>{demoCredentials.username}</code> · Password: <code>{demoCredentials.password}</code></p>
  </form><Button to='/'>← Back to website</Button></main>;
}
