import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { authApi } from '../../lib/auth.js';
import { Button, Field, Notice, Wordmark } from '../components/UI.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sessionStatus, setSessionStatus] = useState('checking');

  const from = location.state?.from;

  const destination =
    typeof from === 'string' &&
    /^\/admin(?:\/|$)/.test(from) &&
    !/^\/admin\/(?:login|logout)(?:\/|$)/.test(from)
      ? from
      : '/admin';

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then(() => {
        if (active) {
          setSessionStatus('authenticated');
        }
      })
      .catch((failure) => {
        if (!active) return;

        if (failure.status === 401) {
          setSessionStatus('unauthenticated');
        } else {
          setSessionStatus('unavailable');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    if (pending) return;

    setPending(true);
    setError('');

    try {
      await authApi.login(username, password);

      setPassword('');
      setSessionStatus('authenticated');

      navigate(destination, {
        replace: true,
      });
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  };

  if (sessionStatus === 'checking') {
    return (
      <main className='content-status'>Checking administrator session…</main>
    );
  }

  if (sessionStatus === 'authenticated') {
    return <Navigate to={destination} replace />;
  }

  if (sessionStatus === 'unavailable') {
    return (
      <main className='content-status'>
        <h1>Cannot connect to the API.</h1>
        <p>Check your connection and reload this page.</p>
      </main>
    );
  }

  return (
    <main className='admin-login'>
      <Wordmark />

      <form className='admin-login__card' onSubmit={submit}>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your website.</p>

        {error && <Notice error>{error}</Notice>}

        <Field
          name='username'
          label='Username'
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete='username'
          required
        />

        <Field
          name='password'
          label='Password'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete='current-password'
          required
        />

        <Button type='submit' variant='primary' disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className='admin-hint'>Sign in with your administrator account.</p>
      </form>

      <Button to='/'>← Back to website</Button>
    </main>
  );
}
