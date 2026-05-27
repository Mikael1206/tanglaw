(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Quick Test', email: 'quicktest+copilot@example.com', password: 'Password123!' }),
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text);
  } catch (e) {
    console.error('fetch error', e);
  }
})();
