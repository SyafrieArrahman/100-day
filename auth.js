(() => {
  const configured = () => window.SUPABASE_URL?.startsWith('https://')
    && !window.SUPABASE_URL.includes('YOUR_PROJECT_ID')
    && window.SUPABASE_ANON_KEY
    && !window.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');

  let client = null;
  let mode = 'signin';
  let message = '';
  let busy = false;
  window.authReady = false;
  window.authUser = null;
  window.guestMode = sessionStorage.getItem('h100-guest') === '1';

  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  window.authView = () => {
    if (!window.authReady) return '<main class="auth-page"><div class="card">Loading sign-in…</div></main>';
    if (window.authUser || window.guestMode) return null;
    const isSignup = mode === 'signup';
    const setupMessage = configured()
      ? ''
      : '<p class="auth-note">Set your Supabase URL and publishable key in <code>auth-config.js</code> to enable sign-in. Guest mode is ready now.</p>';
    return `<main class="auth-page">
      <div class="auth-brand"><h1>100 DAYS</h1><p class="big">BUILD YOURSELF</p><p class="mut">100 days. One day at a time.</p></div>
      <form class="card auth-form" onsubmit="authSubmit(event)">
        <h2>${isSignup ? 'Create your account' : 'Welcome back'}</h2>
        <label for="auth-email">Email</label><input id="auth-email" type="email" autocomplete="email" required>
        <label for="auth-password">Password</label><input id="auth-password" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" minlength="8" required>
        <button class="btn" type="submit" ${!configured() || busy ? 'disabled' : ''}>${busy ? 'PLEASE WAIT…' : isSignup ? 'CREATE ACCOUNT' : 'SIGN IN WITH EMAIL'}</button>
        <div class="auth-divider"><span>OR</span></div>
        <button class="btn alt" type="button" onclick="authGoogle()" ${!configured() || busy ? 'disabled' : ''}>CONTINUE WITH GOOGLE</button>
        ${message ? `<p class="${message.startsWith('Check your email') ? 'auth-note' : 'err'}" role="status">${esc(message)}</p>` : ''}
        ${setupMessage}
        <button class="lnk auth-switch" type="button" onclick="authToggle()">${isSignup ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
      </form>
      <button class="btn alt auth-guest" type="button" onclick="authContinueGuest()">CONTINUE AS GUEST</button>
      <p class="mut auth-local-note">Your challenge progress stays in this browser. Account sync is not enabled yet.</p>
    </main>`;
  };

  window.authToggle = () => { mode = mode === 'signin' ? 'signup' : 'signin'; message = ''; window.renderApp?.(); };
  window.authContinueGuest = () => {
    window.guestMode = true;
    sessionStorage.setItem('h100-guest', '1');
    window.renderApp?.();
  };
  window.authSignIn = () => {
    window.guestMode = false;
    sessionStorage.removeItem('h100-guest');
    window.renderApp?.();
  };
  window.authSubmit = async event => {
    event.preventDefault();
    if (!client || busy) return;
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    busy = true; message = ''; window.renderApp?.();
    let result;
    try {
      result = mode === 'signup'
        ? await client.auth.signUp({ email, password })
        : await client.auth.signInWithPassword({ email, password });
    } catch (error) {
      result = { error };
    }
    busy = false;
    if (result.error) message = result.error.message;
    else if (mode === 'signup' && !result.data.session) message = 'Check your email to confirm your account, then sign in.';
    else {
      window.guestMode = false;
      sessionStorage.removeItem('h100-guest');
      window.authUser = result.data.user;
    }
    window.renderApp?.();
  };
  window.authGoogle = async () => {
    if (!client || busy) return;
    let error;
    try {
      ({ error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      }));
    } catch (caught) {
      error = caught;
    }
    if (error) { message = error.message; window.renderApp?.(); }
  };
  window.authSignOut = async () => {
    await client?.auth.signOut();
    window.authUser = null;
    window.authSignIn();
  };

  async function initialize() {
    if (configured() && window.supabase?.createClient) {
      client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      const { data } = await client.auth.getSession();
      window.authUser = data.session?.user || null;
      client.auth.onAuthStateChange((_event, session) => {
        window.authUser = session?.user || null;
        window.guestMode = false;
        sessionStorage.removeItem('h100-guest');
        window.renderApp?.();
      });
    }
    window.authReady = true;
    window.renderApp?.();
  }

  initialize();
})();
