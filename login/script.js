/* Simulated frontend sign-in. Public demo values; not secure backend authentication. */
'use strict';
const form = document.querySelector('.login-form');
if (form) {
  const user = document.getElementById('username');
  const password = document.getElementById('password');
  const role = form.dataset.role;
  const demoUsername = role === 'admin' ? 'ana.reyes' : 'mia.santos';
  const demoPassword = 'BayleafDemo1!';
  const messages = {
    'incorrect-username': 'Username not found. Please check your username.',
    'incorrect-password': 'Incorrect password. Please try again.',
    'invalid-credentials': 'Invalid username or password. Please try again.',
    'empty-fields': 'Please enter your username and password.'
  };
  function showState(state) {
    form.dataset.state = state;
    ['username', 'password', 'form'].forEach(id => {
      const message = document.getElementById(id + '-feedback');
      message.hidden = true;
      message.textContent = '';
    });
    user.removeAttribute('aria-invalid');
    password.removeAttribute('aria-invalid');
    user.removeAttribute('aria-describedby');
    password.removeAttribute('aria-describedby');
    if (!messages[state]) return;
    const target = state === 'incorrect-username' ? 'username' : state === 'incorrect-password' ? 'password' : 'form';
    const message = document.getElementById(target + '-feedback');
    message.textContent = messages[state];
    message.hidden = false;
    if (target !== 'password') {
      user.setAttribute('aria-invalid', 'true');
      user.setAttribute('aria-describedby', target + '-feedback');
    }
    if (target !== 'username') {
      password.setAttribute('aria-invalid', 'true');
      password.setAttribute('aria-describedby', target + '-feedback');
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const userValue = user.value.trim();
    const passValue = password.value;
    if (!userValue || !passValue) { showState('empty-fields'); return; }
    const knownUser = userValue === demoUsername;
    const knownPassword = passValue === demoPassword;
    if (knownUser && knownPassword) {
      if (!window.BayleafDemo.login(role)) {
        showState('default');
        const feedback=document.getElementById('form-feedback');
        feedback.hidden=false;
        feedback.textContent='Unable to sign in. Please try again or contact the administrator.';
        return;
      }
      window.BayleafDemo.home(role);
      return;
    }
    showState(!knownUser && !knownPassword ? 'invalid-credentials' : !knownUser ? 'incorrect-username' : 'incorrect-password');
  });
  form.addEventListener('input', event => {
    if (event.target === user || event.target === password) showState('default');
  });
  form.querySelector('[data-password-toggle]').addEventListener('click', event => {
    const button = event.currentTarget;
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    button.setAttribute('aria-pressed', String(show));
  });
}
